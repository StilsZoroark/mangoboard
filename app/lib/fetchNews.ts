import { Article } from "@app/types";
import Parser from "rss-parser";

const ARTICLES_PER_SOURCE = 5;

const FEEDS = [
  //{ url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", source: "Times of India" },
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "Economic Times" },
  { url: "https://news.google.com/rss/search?q=site:business-standard.com&hl=en-IN&gl=IN&ceid=IN:en", source: "Business Standard" },
  { url: "https://www.livemint.com/rss/markets", source: "Mint" },
  { url: "https://www.thehindubusinessline.com/feeder/default.rss", source: "The Hindu BusinessLine" },
  { url: "https://inc42.com/feed/", source: "Inc42" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms", source: "TOI Business" },
  { url: "https://www.moneycontrol.com/rss/MCtopnews.xml", source: "Moneycontrol" },
  { url: "https://www.financialexpress.com/market/feed", source: "Financial Express" },
  { url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV Profit" }
];



// Explicit type for the external API response (replaces 'any')
interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;       //rss-parser auto-parses this from pubDate
  categories?: string[];
  guid?: string;
  contentSnippet?: string;  //Ready for future inline summaries
}

 //  Type the parser itself using generics
// <{}, RssItem> means: use default feed shape, but type items as RssItem
  const parser = new Parser<Record<string, never>, RssItem>(
    {
        headers:{
            "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
    }
  );

export async function fetchNews(): Promise<Article[]> {
  //const RSS_FEED = "https://timesofindia.indiatimes.com/rssfeedstopstories.cms";
  //const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED)}`;
    //old code for the singular feed fetch

 

  //to fetch from multiple feeds in parallel
  const results = await Promise.allSettled(
    FEEDS.map(async ({url, source}) => {
        try{
        const feed = await parser.parseURL(url);
    return feed.items
        .sort(
          (a, b) =>
            new Date(b.isoDate || b.pubDate || 0).getTime() -
            new Date(a.isoDate || a.pubDate || 0).getTime()
        )
        .slice(0, ARTICLES_PER_SOURCE)
        .map((item) => ({
        id: item.guid || item.link || `${source}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title:item.title || "Untitled Story",
        url: item.link || '#',
        source,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        category: item.categories?.[0] || "Business",
    }));
}catch(error){
    if(process.env.NODE_ENV === "development"){
        console.warn(`${source} could not be fetched: 
            ${(error as Error).message}
            `);
    }
    return [];
}
})
  );

 // Flatten successful results and ignore failed ones
  const allArticles = results
  .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === "fulfilled")
  .flatMap((r) => r.value);

  //for deduplication of articles ()
  const seenTitles = new Set<string>();
  const uniqueArticles = allArticles.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  })

  //To put the newest articles first 
  return uniqueArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}


    //Old fetch logic
  /*const res = await fetch(API_URL, {
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
  }));*/
