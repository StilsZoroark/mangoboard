import { Article } from "@app/types";

export async function fetchNews(): Promise<Article[]> {
  // Free RSS-to-JSON proxy targeting Times of India top stories
  const RSS_FEED = "https://timesofindia.indiatimes.com/rssfeedstopstories.cms";
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED)}`;

  // Next.js fetch extension: caches for 5 minutes, then refreshes in background
  const res = await fetch(API_URL, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`News fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Invalid news data structure received");
  }

  // Map API response to your strict Article interface
  return data.items.map((item: any, index: number) => ({
    id: `toi-${index}-${Date.now()}`,
    title: item.title || "Untitled Story",
    url: item.link || "#",
    source: "Times of India",
    publishedAt: item.pubDate || new Date().toISOString(),
    category: item.categories?.[0] || "Top News",
  }));
}