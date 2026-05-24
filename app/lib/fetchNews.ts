import { Article } from "@app/types";



// Explicit type for the external API response (replaces 'any')
interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  categories?: string[];
}

export async function fetchNews(): Promise<Article[]> {
  const RSS_FEED = "https://timesofindia.indiatimes.com/rssfeedstopstories.cms";
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED)}`;

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

  // ✅ Typed mapping: replaces 'any' with 'RssItem'
  return data.items.map((item: RssItem, index: number) => ({
    id: `toi-${index}-${Date.now()}`,
    title: item.title || "Untitled Story",
    url: item.link || "#",
    source: "Times of India",
    publishedAt: item.pubDate || new Date().toISOString(),
    category: item.categories?.[0] || "Top News",
  }));
}