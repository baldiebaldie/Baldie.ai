import axios from "axios";
import { config } from "./config.js";

const client = axios.create({
  baseURL: config.payloadApiUrl,
  headers: {
    "Content-Type": "application/json",
    ...(config.payloadApiKey ? { Authorization: `Bearer ${config.payloadApiKey}` } : {}),
  },
});

export interface ArticleContent {
  tldr: string;
  careerImpact: string;
  technicalBreakdown: string;
  actionItems: string;
  fullMarkdown: string;
}

export async function updateArticle(
  id: string,
  patch: {
    status: string;
    title?: string;
    content?: ArticleContent;
    errorMessage?: string;
  }
): Promise<void> {
  await client.patch(`/articles/${id}`, patch);
}
