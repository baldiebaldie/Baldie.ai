import { Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import { config } from "./config.js";
import { scrape } from "./scraper.js";
import { synthesize } from "./synthesize.js";
import { updateArticle } from "./payload-client.js";

export interface ArticleJobData {
  articleId: string;
  url: string;
}

export function createWorker() {
  const connection = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker<ArticleJobData>(
    "article-processing",
    async (job) => {
      const { articleId, url } = job.data;
      console.log(`[Brain] Processing job ${job.id} — article ${articleId} (${url})`);

      // Mark as processing
      await updateArticle(articleId, { status: "processing" });

      // Step 1: Scrape
      const scraped = await scrape(url);
      console.log(`[Brain] Scraped ${url} — ${scraped.text.length} chars`);

      // Step 2: Synthesize (Phase 1: stub — skip AI, just mark draft)
      // In Phase 2 this becomes: const result = await synthesize(url, scraped.text, scraped.title);
      console.log(`[Brain] Synthesis skipped (Phase 1 skeleton — AI not yet wired)`);

      // For Phase 1, just update to "draft" with raw scraped title so we can
      // verify the full pipeline end-to-end without needing an AI API key.
      await updateArticle(articleId, {
        status: "draft",
        title: scraped.title || url,
      });

      console.log(`[Brain] Article ${articleId} → draft`);
    },
    {
      connection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Brain] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Brain] Job ${job?.id} failed:`, err.message);
    if (job) {
      updateArticle(job.data.articleId, {
        status: "failed",
        errorMessage: err.message,
      }).catch(console.error);
    }
  });

  return worker;
}
