import { fetchHackerNews } from "./hackernews";
import { fetchReddit } from "./reddit";
import { isAiRelated } from "./keywords";

export interface DiscoveredLink {
  title: string;
  url: string;
  score: number;
  source: "hackernews" | "reddit";
}

function normaliseUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip query params and trailing slash for deduplication
    return `${u.hostname}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export async function fetchDiscoveredLinks(): Promise<DiscoveredLink[]> {
  const [hnResult, redditResult] = await Promise.allSettled([
    fetchHackerNews(),
    fetchReddit(),
  ]);

  const all: DiscoveredLink[] = [
    ...(hnResult.status === "fulfilled" ? hnResult.value : []),
    ...(redditResult.status === "fulfilled" ? redditResult.value : []),
  ];

  if (hnResult.status === "rejected") {
    console.warn("[Discovery] HN fetch failed:", hnResult.reason);
  }
  if (redditResult.status === "rejected") {
    console.warn("[Discovery] Reddit fetch failed:", redditResult.reason);
  }

  // Deduplicate by normalised URL — keep highest score
  const seen = new Map<string, DiscoveredLink>();
  for (const link of all) {
    const key = normaliseUrl(link.url);
    const existing = seen.get(key);
    if (!existing || link.score > existing.score) {
      seen.set(key, link);
    }
  }

  return (
    Array.from(seen.values())
      .filter((link) => isAiRelated(link.title))
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
  );
}
