import "dotenv/config";

export const config = {
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  payloadApiUrl: process.env.PAYLOAD_API_URL ?? "http://localhost:3000/api",
  payloadApiKey: process.env.PAYLOAD_API_KEY ?? "",
  aiProvider: (process.env.AI_PROVIDER ?? "claude") as "claude" | "openai",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
} as const;
