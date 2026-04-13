import type { DiscoveredLink } from "./index";

const HN_API =
  "https://hn.algolia.com/api/v1/search?tags=story&numericFilters=points%3E50&hitsPerPage=50";

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
  const res = await fetch(HN_API, {
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
