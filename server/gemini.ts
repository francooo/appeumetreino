import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI
  ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  : null;

export { genAI };
