const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

export const isGroqConfigured = Boolean(apiKey);

export async function identifyImage(base64Jpeg: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      // Plano gratuito limita a 1000 tokens de saida por minuto neste modelo
      max_tokens: 1000,
      reasoning_effort: "none",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Jpeg}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
