import type { DiscoveredLink } from "./index";

const SUBREDDITS = ["MachineLearning", "LocalLLaMA", "artificial"];

interface RedditPost {
  data: {
    title: string;
    url: string;
    score: number;
    is_self: boolean;
    permalink: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

async function fetchSubreddit(sub: string): Promise<DiscoveredLink[]> {
  const url = `https://www.reddit.com/r/${sub}/top.json?t=month&limit=25`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "BaldieBot/1.0 (baldie.ai content discovery)",
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Reddit API error for r/${sub}: ${res.status}`);
  }

  const data = (await res.json()) as RedditResponse;

  return data.data.children
    .filter((post) => !post.data.is_self) // skip text-only posts
    .filter((post) => !post.data.url.includes("reddit.com")) // skip cross-posts that link back to reddit
    .map((post) => ({
      title: post.data.title,
      url: post.data.url,
      score: post.data.score,
      source: "reddit" as const,
    }));
}

export async function fetchReddit(): Promise<DiscoveredLink[]> {
  const results = await Promise.allSettled(
    SUBREDDITS.map((sub) => fetchSubreddit(sub))
  );

  return results.flatMap((result) => {
    if (result.status === "fulfilled") return result.value;
    console.warn("[Discovery] Reddit fetch failed:", result.reason);
    return [];
  });
}
