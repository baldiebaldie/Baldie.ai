import type { CollectionAfterChangeHook } from "payload";
import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";

let queue: Queue | null = null;

function getQueue(): Queue {
  if (!queue) {
    const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
    queue = new Queue("article-processing", { connection });
  }
  return queue;
}

export const enqueueArticle: CollectionAfterChangeHook = async ({ doc, operation }) => {
  // Only enqueue on create, and only when status is pending
  if (operation !== "create" || doc.status !== "pending") {
    return doc;
  }

  try {
    const q = getQueue();
    await q.add(
      "process-article",
      { articleId: doc.id, url: doc.url },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: false, // keep failed jobs for inspection
      }
    );
    console.log(`[Payload] Enqueued article ${doc.id} (${doc.url})`);
  } catch (err) {
    console.error(`[Payload] Failed to enqueue article ${doc.id}:`, err);
  }

  return doc;
};
