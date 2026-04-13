import "dotenv/config";
import { createWorker } from "./worker.js";

console.log("[Brain] Starting article-processing worker...");

const worker = createWorker();

console.log("[Brain] Worker listening on queue: article-processing");

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[Brain] ${signal} received — shutting down worker`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
