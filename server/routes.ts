import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { testConnection } from "./db";
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  type User,
} from "../shared/schema";
import { identifyImage, isGroqConfigured } from "./groq";
import type { MealInput } from "./storage";

// Dados do usuario devolvidos ao app (nunca inclui senha nem googleId)
function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    level: user.level,
    avatar: user.avatar ?? null,
    calorieGoal: user.calorieGoal ?? 2000,
  };
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;
const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];
const MAX_MEAL_PHOTO_LENGTH = 200_000; // ~150 KB de miniatura em base64

// Valida o corpo de uma refeicao; devolve a mensagem de erro ou os dados normalizados
function parseMeal(body: any): { error: string } | { meal: MealInput } {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const kcal = Number(body?.kcal);
  if (!DAY_RE.test(String(body?.day))) return { error: "Data invalida" };
  if (name.length < 1 || name.length > 80) return { error: "Nome invalido" };
  if (!Number.isInteger(kcal) || kcal < 0 || kcal > 5000) return { error: "Calorias invalidas" };
  if (!MEAL_TYPES.includes(body?.mealType)) return { error: "Tipo de refeicao invalido" };
  const eatenAt = new Date(body?.eatenAt);
  if (Number.isNaN(eatenAt.getTime())) return { error: "Horario invalido" };
  const photo = body?.photo ?? null;
  if (photo !== null) {
    if (typeof photo !== "string" || !photo.startsWith("data:image/jpeg;base64,")) {
      return { error: "Foto invalida" };
    }
    if (photo.length > MAX_MEAL_PHOTO_LENGTH) return { error: "Foto muito grande" };
  }
  const items = Array.isArray(body?.items) ? body.items.slice(0, 20) : null;
  return {
    meal: { day: body.day, eatenAt, mealType: body.mealType, name, kcal, photo, items },
  };
}

const MAX_AVATAR_LENGTH = 400_000; // ~300 KB de imagem em base64

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

      res.status(201).json(toPublicUser(user));
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

      res.json(toPublicUser(user));
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
        if (existingEmail?.googleId) {
          return res.status(409).json({
            message: "Email ja vinculado a outra conta Google.",
          });
        }
        user = existingEmail
          ? await storage.linkGoogleId(existingEmail.id, googleId)
          : await storage.createUser({
              name,
              email,
              googleId,
              password: null,
            });
      }

      res.json(toPublicUser(user));
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
      res.json(toPublicUser(user));
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro ao buscar usuario" });
    }
  });

  app.put("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      if (name.length < 1 || name.length > 80) {
        return res.status(400).json({ message: "Nome invalido" });
      }
      const user = await storage.updateUserName(String(req.params.id), name);
      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }
      res.json(toPublicUser(user));
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  app.put("/api/user/:id/calorie-goal", async (req: Request, res: Response) => {
    try {
      const goal = Number(req.body?.goal);
      if (!Number.isInteger(goal) || goal < 800 || goal > 6000) {
        return res.status(400).json({ message: "Meta invalida (800 a 6000 kcal)" });
      }
      await storage.updateCalorieGoal(String(req.params.id), goal);
      res.json({ calorieGoal: goal });
    } catch (error) {
      console.error("Update calorie goal error:", error);
      res.status(500).json({ message: "Erro ao salvar meta" });
    }
  });

  app.get("/api/user/:id/meals", async (req: Request, res: Response) => {
    try {
      const day = String(req.query.day || "");
      if (!DAY_RE.test(day)) {
        return res.status(400).json({ message: "Data invalida" });
      }
      res.json(await storage.getMealsByDay(String(req.params.id), day));
    } catch (error) {
      console.error("Get meals error:", error);
      res.status(500).json({ message: "Erro ao buscar refeicoes" });
    }
  });

  app.post("/api/user/:id/meals", async (req: Request, res: Response) => {
    try {
      const parsed = parseMeal(req.body);
      if ("error" in parsed) return res.status(400).json({ message: parsed.error });
      const saved = await storage.addMeal(String(req.params.id), parsed.meal);
      res.status(201).json(saved);
    } catch (error) {
      console.error("Add meal error:", error);
      res.status(500).json({ message: "Erro ao salvar refeicao" });
    }
  });

  app.put("/api/user/:id/meals/:mealId", async (req: Request, res: Response) => {
    try {
      const mealId = String(req.params.mealId);
      if (!UUID_RE.test(mealId)) return res.status(404).json({ message: "Refeicao nao encontrada" });
      const parsed = parseMeal(req.body);
      if ("error" in parsed) return res.status(400).json({ message: parsed.error });
      const saved = await storage.updateMeal(String(req.params.id), mealId, parsed.meal);
      if (!saved) return res.status(404).json({ message: "Refeicao nao encontrada" });
      res.json(saved);
    } catch (error) {
      console.error("Update meal error:", error);
      res.status(500).json({ message: "Erro ao atualizar refeicao" });
    }
  });

  app.delete("/api/user/:id/meals/:mealId", async (req: Request, res: Response) => {
    try {
      const mealId = String(req.params.mealId);
      if (!UUID_RE.test(mealId)) return res.status(404).json({ message: "Refeicao nao encontrada" });
      const ok = await storage.deleteMeal(String(req.params.id), mealId);
      if (!ok) return res.status(404).json({ message: "Refeicao nao encontrada" });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete meal error:", error);
      res.status(500).json({ message: "Erro ao excluir refeicao" });
    }
  });

  app.get("/api/user/:id/weights", async (req: Request, res: Response) => {
    try {
      const from = String(req.query.from || "");
      const to = String(req.query.to || "");
      if (!DAY_RE.test(from) || !DAY_RE.test(to)) {
        return res.status(400).json({ message: "Periodo invalido" });
      }
      const userId = String(req.params.id);
      const [entries, latest] = await Promise.all([
        storage.getWeights(userId, from, to),
        storage.getLatestWeight(userId),
      ]);
      res.json({ entries, latest: latest ?? null });
    } catch (error) {
      console.error("Get weights error:", error);
      res.status(500).json({ message: "Erro ao buscar peso" });
    }
  });

  app.post("/api/user/:id/weights", async (req: Request, res: Response) => {
    try {
      const day = String(req.body?.day || "");
      const kg = Math.round(Number(req.body?.kg) * 10) / 10;
      if (!DAY_RE.test(day)) return res.status(400).json({ message: "Data invalida" });
      if (!Number.isFinite(kg) || kg < 20 || kg > 400) {
        return res.status(400).json({ message: "Peso invalido (20 a 400 kg)" });
      }
      res.status(201).json(await storage.saveWeight(String(req.params.id), day, kg));
    } catch (error) {
      console.error("Save weight error:", error);
      res.status(500).json({ message: "Erro ao salvar peso" });
    }
  });

  app.put("/api/user/:id/avatar", async (req: Request, res: Response) => {
    try {
      const { avatar } = req.body as { avatar?: string | null };
      if (avatar !== null) {
        if (typeof avatar !== "string" || !avatar.startsWith("data:image/jpeg;base64,")) {
          return res.status(400).json({ message: "Imagem invalida" });
        }
        if (avatar.length > MAX_AVATAR_LENGTH) {
          return res.status(413).json({ message: "Imagem muito grande" });
        }
      }
      const user = await storage.getUser(String(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }
      await storage.updateUserAvatar(user.id, avatar);
      res.json({ success: true });
    } catch (error) {
      console.error("Update avatar error:", error);
      res.status(500).json({ message: "Erro ao salvar foto" });
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

  app.put("/api/user/:id/workouts/:workoutId", async (req: Request, res: Response) => {
    try {
      const { exercises, duration } = req.body;
      if (!Array.isArray(exercises) || exercises.length === 0 || typeof duration !== "string") {
        return res.status(400).json({ message: "Dados invalidos" });
      }
      const workoutId = String(req.params.workoutId);
      // Ids locais do app (nao-UUID) nunca existem no banco
      if (!/^[0-9a-f-]{36}$/i.test(workoutId)) {
        return res.status(404).json({ message: "Treino nao encontrado" });
      }
      const updated = await storage.updateWorkout(String(req.params.id), workoutId, {
        exercises,
        duration,
      });
      if (!updated) {
        return res.status(404).json({ message: "Treino nao encontrado" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update workout error:", error);
      res.status(500).json({ message: "Erro ao atualizar treino" });
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

  app.post("/api/vision/meal", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      if (!image || typeof image !== "string") {
        return res.status(400).json({ message: "Imagem e obrigatoria" });
      }
      if (!isGroqConfigured) {
        return res.status(503).json({ message: "GROQ_API_KEY nao configurada" });
      }
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Você é um nutricionista. Analise a foto da refeição e estime as calorias.

Responda EXCLUSIVAMENTE em JSON válido, curto, com esta estrutura:
{
  "name": "nome curto da refeição em português (ex: 'Frango grelhado com arroz e salada')",
  "meal_type": "breakfast" | "lunch" | "snack" | "dinner",
  "kcal": número inteiro com o total estimado,
  "items": [{ "name": "alimento", "kcal": número inteiro }],
  "confidence": número de 0 a 100
}

Regras:
- No máximo 6 itens; estime porções pelo tamanho aparente no prato
- Se a foto não mostrar comida, responda com kcal 0, items vazio e confidence menor que 30
- Retorne APENAS o JSON, sem markdown ou texto adicional`;

      const responseText = await identifyImage(base64Data, prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ message: "Resposta da IA invalida" });
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const items = Array.isArray(parsed.items)
        ? parsed.items
            .filter((i: any) => i && typeof i.name === "string")
            .slice(0, 6)
            .map((i: any) => ({ name: i.name, kcal: Math.max(0, Math.round(Number(i.kcal) || 0)) }))
        : [];
      res.json({
        name: typeof parsed.name === "string" ? parsed.name : "Refeição",
        meal_type: MEAL_TYPES.includes(parsed.meal_type) ? parsed.meal_type : null,
        kcal: Math.max(0, Math.round(Number(parsed.kcal) || 0)),
        items,
        confidence: Number(parsed.confidence) || 0,
      });
    } catch (error) {
      console.error("Meal vision error:", error);
      res.status(500).json({ message: "Erro ao analisar refeicao", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
