import type { ArticleContent } from "./payload-client.js";
import { config } from "./config.js";

const SYSTEM_PROMPT = `You are a technical content synthesizer for baldie.ai, an AI learning and news blog.
Your job is to read raw scraped content from an article or tool page and produce a structured four-section post.

You MUST respond with valid JSON matching this schema exactly:
{
  "title": "Concise article title (max 80 chars)",
  "tldr": "2–3 sentence plain-English overview of what this is.",
  "careerImpact": "How does this affect someone actively building an AI career? Be specific and practical.",
  "technicalBreakdown": "What does the tool/model/paper actually do under the hood? Include architecture details, key innovations, or mechanism if available.",
  "actionItems": "3–5 concrete, numbered steps the reader can take right now to apply this knowledge.",
  "fullMarkdown": "The complete post rendered as Markdown with proper headings (## TL;DR, ## Career Impact, ## Technical Breakdown, ## Action Items)."
}

Do not include any text outside the JSON object.`;

export async function synthesize(
  url: string,
  scrapedText: string,
  scrapedTitle: string
): Promise<ArticleContent & { title: string }> {
  const userPrompt = `Source URL: ${url}
Page title: ${scrapedTitle}

--- SCRAPED CONTENT ---
${scrapedText}
--- END ---

Produce the structured JSON post.`;

  if (config.aiProvider === "claude") {
    return synthesizeClaude(userPrompt);
  }
  return synthesizeOpenAI(userPrompt);
}

async function synthesizeClaude(
  userPrompt: string
): Promise<ArticleContent & { title: string }> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — optional Phase-2 dep
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as ArticleContent & { title: string };
}

async function synthesizeOpenAI(
  userPrompt: string
): Promise<ArticleContent & { title: string }> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — optional Phase-2 dep
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return JSON.parse(text) as ArticleContent & { title: string };
}
