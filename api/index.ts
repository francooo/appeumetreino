import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/app";

// Na Vercel as variaveis de ambiente vem do painel; o app e criado uma vez por instancia
const appPromise = createApp().then(({ app }) => app);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await appPromise;
  return app(req as any, res as any);
}
