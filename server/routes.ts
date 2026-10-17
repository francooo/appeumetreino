import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { testConnection } from "./db";
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
} from "../shared/schema";
import { identifyImage, isGroqConfigured } from "./groq";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      const dbOk = await testConnection();
      res.json({
        status: dbOk ? "ok" : "degraded",
        database: dbOk ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        database: "disconnected",
        message: String(error),
      });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Dados invalidos",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { name, email, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email ja cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Dados invalidos",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro ao entrar" });
    }
  });

  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const parsed = googleAuthSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Dados invalidos",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) {
        return res.status(503).json({ message: "GOOGLE_WEB_CLIENT_ID nao configurada" });
      }

      // Valida o idToken no Google em vez de confiar nos dados enviados pelo app
      const tokenRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(parsed.data.idToken)}`,
      );
      const tokenInfo = (await tokenRes.json()) as {
        aud?: string;
        sub?: string;
        email?: string;
        email_verified?: string;
        name?: string;
      };
      if (
        !tokenRes.ok ||
        tokenInfo.aud !== webClientId ||
        !tokenInfo.sub ||
        !tokenInfo.email ||
        tokenInfo.email_verified !== "true"
      ) {
        return res.status(401).json({ message: "Token do Google invalido" });
      }

      const googleId = tokenInfo.sub;
      const email = tokenInfo.email;
      const name = tokenInfo.name || email.split("@")[0];

      let user = await storage.getUserByGoogleId(googleId);

      if (!user) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(409).json({
            message: "Email ja cadastrado com outra conta. Use login com email/senha.",
          });
        }
        user = await storage.createUser({
          name,
          email,
          googleId,
          password: null,
        });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ message: "Erro na autenticacao Google" });
    }
  });

  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro ao buscar usuario" });
    }
  });

  app.put("/api/user/:id/level", async (req: Request, res: Response) => {
    try {
      const { level } = req.body;
      if (!["beginner", "intermediate", "advanced"].includes(level)) {
        return res.status(400).json({ message: "Nivel invalido" });
      }
      await storage.updateUserLevel(req.params.id, level);
      res.json({ success: true });
    } catch (error) {
      console.error("Update level error:", error);
      res.status(500).json({ message: "Erro ao atualizar nivel" });
    }
  });

  app.get("/api/user/:id/equipment", async (req: Request, res: Response) => {
    try {
      const items = await storage.getEquipmentByUser(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Get equipment error:", error);
      res.status(500).json({ message: "Erro ao buscar equipamentos" });
    }
  });

  app.post("/api/user/:id/equipment", async (req: Request, res: Response) => {
    try {
      const { name, imageUri } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome e obrigatorio" });
      }
      const item = await storage.addEquipment(req.params.id, name, imageUri);
      res.status(201).json(item);
    } catch (error) {
      console.error("Add equipment error:", error);
      res.status(500).json({ message: "Erro ao adicionar equipamento" });
    }
  });

  app.delete(
    "/api/user/:userId/equipment/:id",
    async (req: Request, res: Response) => {
      try {
        await storage.removeEquipment(req.params.id, req.params.userId);
        res.json({ success: true });
      } catch (error) {
        console.error("Remove equipment error:", error);
        res.status(500).json({ message: "Erro ao remover equipamento" });
      }
    },
  );

  app.get("/api/user/:id/workouts", async (req: Request, res: Response) => {
    try {
      const items = await storage.getWorkoutsByUser(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Get workouts error:", error);
      res.status(500).json({ message: "Erro ao buscar treinos" });
    }
  });

  app.post("/api/user/:id/workouts", async (req: Request, res: Response) => {
    try {
      const workout = { ...req.body };
      delete workout.id;
      if (workout.createdAt && typeof workout.createdAt === "number") {
        workout.createdAt = new Date(workout.createdAt);
      } else {
        delete workout.createdAt;
      }
      const saved = await storage.saveWorkout(req.params.id, workout);
      res.status(201).json(saved);
    } catch (error) {
      console.error("Save workout error:", error);
      res.status(500).json({ message: "Erro ao salvar treino" });
    }
  });

  app.get("/api/user/:id/history", async (req: Request, res: Response) => {
    try {
      const items = await storage.getHistoryByUser(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({ message: "Erro ao buscar historico" });
    }
  });

  app.post("/api/user/:id/history", async (req: Request, res: Response) => {
    try {
      const entry = { ...req.body };
      delete entry.id;
      if (entry.completedAt && typeof entry.completedAt === "number") {
        entry.completedAt = new Date(entry.completedAt);
      } else {
        delete entry.completedAt;
      }
      const saved = await storage.addHistory(req.params.id, entry);
      res.status(201).json(saved);
    } catch (error) {
      console.error("Add history error:", error);
      res.status(500).json({ message: "Erro ao adicionar historico" });
    }
  });

  app.post("/api/vision/identify", async (req: Request, res: Response) => {
    try {
      const { image, level } = req.body;
      const levelLabel =
        level === "advanced" ? "avancado" : level === "intermediate" ? "intermediario" : "iniciante";
      if (!image) {
        return res.status(400).json({ message: "Imagem e obrigatoria" });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Você é um especialista em fitness e equipamentos de treino. Analise esta imagem e identifique equipamento(s) de exercício presentes.

IMPORTANTE: Considere tanto equipamentos tradicionais de academia (halteres, barras, bancos, elásticos, etc.) quanto objetos do cotidiano que podem ser usados como equipamento improvisado (garrafas d'água como pesos, cadeiras para apoio, escadas, mochilas com peso, toalhas como faixas, etc.).

Responda EXCLUSIVAMENTE em JSON válido com esta estrutura:
{
  "equipment_name": "nome do equipamento em português",
  "confidence": número de 0 a 100,
  "suggested_exercises": [
    {
      "name": "nome do exercício em português",
      "description": "instrução detalhada de execução em português brasileiro, passo a passo",
      "muscles_primary": ["músculo principal 1", "músculo principal 2"],
      "muscles_secondary": ["músculo secundário 1"],
      "sets": número de séries (3-5),
      "reps": "número de repetições ou duração (ex: '12' ou '30 segundos')",
      "rest_seconds": segundos de descanso entre séries (30-90),
      "suggested_weight": "carga sugerida curta (ex: '6–8 kg por halter') ou null se o exercício usa só o peso corporal"
    }
  ]
}

Regras:
- Sugira entre 4 e 6 exercícios variados para o equipamento identificado
- Use nomes de músculos padronizados: peito, ombros, biceps, triceps, costas_superiores, costas_inferiores, abdomen, quadriceps, isquiotibiais, gluteos, panturrilhas, antebracos
- As instruções devem ser detalhadas e em português brasileiro
- O usuário é de nível ${levelLabel}: ajuste séries, repetições e suggested_weight a esse nível
- Para objetos improvisados (garrafas, mochilas), sugira a carga de forma prática (ex: 'garrafa de 2 L ≈ 2 kg')
- Se não conseguir identificar um equipamento de exercício, responda com confidence menor que 50
- Retorne APENAS o JSON, sem markdown ou texto adicional`;

      if (!isGroqConfigured) {
        return res.status(503).json({
          message: "GROQ_API_KEY nao configurada. Adicione no .env para usar identificacao por IA.",
        });
      }

      const responseText = await identifyImage(base64Data, prompt);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ message: "Resposta da IA invalida" });
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const response = {
        ...parsed,
        low_confidence: (parsed.confidence || 0) < 70,
      };

      res.json(response);
    } catch (error) {
      console.error("Vision identify error:", error);
      res.status(500).json({
        message: "Erro ao processar imagem",
        error: String(error),
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
