import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapeResult {
  title: string;
  text: string;
  url: string;
}

/**
 * Fast path: plain HTTP fetch + cheerio extraction.
 * Returns null if the page appears to require JS rendering.
 */
export async function scrapeHttp(url: string): Promise<ScrapeResult | null> {
  const response = await axios.get(url, {
    timeout: 15_000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BaldieBot/1.0; +https://baldie.ai)",
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data as string);

  // Strip noise
  $("script, style, nav, header, footer, aside, [role=navigation]").remove();

  const title =
    $("meta[property='og:title']").attr("content") ||
    $("title").text() ||
    "";

  // Grab the largest block of text — article, main, or body fallback
  const contentEl =
    $("article").length
      ? $("article")
      : $("main").length
      ? $("main")
      : $("body");

  const text = contentEl
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12_000); // cap at ~3k tokens

  if (text.length < 200) {
    // Too little text — likely a JS-rendered SPA
    return null;
  }

  return { title: title.trim(), text, url };
}

/**
 * Playwright fallback for JS-rendered pages.
 * Lazily imported so the dependency is optional in Phase 1.
 */
export async function scrapePlaywright(url: string): Promise<ScrapeResult> {
  // Dynamic import keeps startup fast when Playwright is not installed
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — optional Phase-2 dep
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2_000);

    const title = await page.title();
    const text = await page.evaluate(() => document.body.innerText);

    return {
      title,
      text: text.replace(/\s+/g, " ").trim().slice(0, 12_000),
      url,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Main scrape entrypoint. HTTP-first, Playwright fallback.
 */
export async function scrape(url: string): Promise<ScrapeResult> {
  try {
    const result = await scrapeHttp(url);
    if (result) return result;
    console.log(`[Scraper] HTTP scrape insufficient for ${url}, falling back to Playwright`);
  } catch (err) {
    console.warn(`[Scraper] HTTP scrape failed for ${url}:`, (err as Error).message);
  }

  return scrapePlaywright(url);
}
