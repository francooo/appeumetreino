/**
 * Deve ser o primeiro import do servidor para que process.env esteja
 * preenchido antes de qualquer outro módulo (ex.: gemini.ts) ser carregado.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
