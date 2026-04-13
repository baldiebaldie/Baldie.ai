import type { DiscoveredLink } from "./index";

interface HNHit {
  objectID: string;
  title: string;
  url?: string;
  points: number;
  created_at: string;
}

interface HNResponse {
  hits: HNHit[];
}

export async function fetchHackerNews(): Promise<DiscoveredLink[]> {
  // Use search_by_date so results are sorted newest-first, not by all-time score.
  // created_at_i filter keeps results within the last 30 days.
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points%3E10,created_at_i%3E${thirtyDaysAgo}&hitsPerPage=100`;

  const res = await fetch(url, {
    next: { revalidate: 0 }, // always fresh
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HN API error: ${res.status}`);
  }

  const data = (await res.json()) as HNResponse;

  return data.hits
    .filter((hit) => !!hit.url) // drop Ask HN / polls with no external link
    .map((hit) => ({
      title: hit.title,
      url: hit.url as string,
      score: hit.points,
      source: "hackernews" as const,
    }));
}
