export const dynamic = 'force-dynamic';

import { Article } from "@app/types/index";
import { NewsCard } from "@app/components/NewsCard";
import { PositiveNewsCard } from "@app/components/PositiveNewsCard";
import { NegativeNewsCard } from "@app/components/NegativeNewsCard";
import { fetchNews } from "./lib/fetchNews";
import { fetchMarketIndices, IndicesResult } from "./lib/fetchIndices";
import IndicesTicker from "@app/components/IndicesTicker";
import DashboardMenu from "@app/components/DashboardMenu";
import { mistralClassifier, batchClassify, selectSentimentArticles } from "@app/lib/classifiers/AI-classifier";
import { preFilter } from "@app/lib/classifiers/Prefilter";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";

const DISPLAY_LIMIT = 16;

interface CachedPageData {
  isEmpty: boolean;
  indicesResult: IndicesResult;
  topArticle: Article | null;
  gridArticles: Article[];
}

const getCachedPageData = unstable_cache(
  async (): Promise<CachedPageData> => {
    console.log("[PageCache] Cache miss! Fetching and resolving new news data...");
    const [indicesResult, articles] = await Promise.all([
      fetchMarketIndices(),
      fetchNews()
    ]);

    const preFiltered = preFilter(articles);
    console.log(`Pre-filtered: ${articles.length} -> ${preFiltered.length} articles`);

    const classifications = await batchClassify(preFiltered, mistralClassifier, 5, 1000);

    const businessArticles: Article[] = preFiltered.filter((article, i) => {
      const classification = classifications[i];
      if (!classification.isBusiness) {
        console.log(`🚫 Filtered: "${article.title}" → ${classification.vetoReason || 'low confidence'}`);
      }
      return classification.isBusiness && classification.confidence >= 60;
    });

    console.log(`Filter stats: ${articles.length} raw -> ${preFiltered.length} pre-filtered -> ${businessArticles.length} business`);

    if (indicesResult.errors.length > 0) {
      console.warn("Indices partial failure:", indicesResult.errors);
    }

    if (businessArticles.length === 0) {
      return {
        isEmpty: true,
        indicesResult,
        topArticle: null,
        gridArticles: []
      };
    }

    const rankedArticles = businessArticles
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, DISPLAY_LIMIT);

    const topArticle = rankedArticles[0];
    const pool = rankedArticles.slice(1);

    // Identify positive and negative articles using Mistral
    const sentimentResult = await selectSentimentArticles(pool);
    
    let positiveArticle = pool.find(a => a.id === sentimentResult.positiveArticleId);
    let negativeArticle = pool.find(a => a.id === sentimentResult.negativeArticleId);

    // Fallbacks if not found or if they are the same article
    if (!positiveArticle) {
      positiveArticle = pool[3] || pool[0];
    }
    if (!negativeArticle) {
      negativeArticle = pool[7] || pool[1];
    }
    if (positiveArticle.id === negativeArticle.id) {
      negativeArticle = pool.find(a => a.id !== positiveArticle!.id) || pool[1];
    }

    // Filter the remaining standard articles (excluding top, positive, negative)
    const standardArticles = pool.filter(
      a => a.id !== positiveArticle!.id && a.id !== negativeArticle!.id
    );

    // Construct the final grid list
    const gridArticles: Article[] = [];
    let standardIndex = 0;
    
    for (let i = 0; i < 15; i++) {
      if (i === 3) {
        gridArticles.push(positiveArticle);
      } else if (i === 7) {
        gridArticles.push(negativeArticle);
      } else {
        if (standardArticles[standardIndex]) {
          gridArticles.push(standardArticles[standardIndex]);
          standardIndex++;
        }
      }
    }

    return {
      isEmpty: false,
      indicesResult,
      topArticle,
      gridArticles
    };
  },
  ["homepage-news-data-key"],
  { revalidate: 300 } // 5 minutes cache revalidation (300 seconds)
);

export default async function HomePage() {
  const data = await getCachedPageData();
  const session = await auth();

  // If the api response is empty or data failed to resolve
  if (data.isEmpty || !data.topArticle) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 dark:bg-zinc-950 px-4">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No business articles matched our filter.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Refreshing feeds shortly...</p>
      </main>
    );
  }

  const { indicesResult, topArticle, gridArticles } = data;

  const headlineTime = new Date(topArticle.publishedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-yellow-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">Mangoboard</p>
        <DashboardMenu session={session} />
      </div>
      
      <div className="mx-auto max-w-7xl mb-6">
        <IndicesTicker 
          indices={indicesResult.indices}
          fetchedAt={indicesResult.fetchedAt}
        />
      </div>
      
      <div className="mx-auto max-w-7xl">
        {/* Centered Heading */}
        <section className="mb-10 text-center">
          <div className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Top Story
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
            <a 
              href={topArticle.url} 
              className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors underline decoration-blue-300 dark:decoration-blue-700/60 decoration-2 hover:decoration-blue-600 dark:hover:decoration-blue-400 underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {topArticle.title}
            </a>
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-500">{topArticle.source}</span>
            <span>•</span>
            <time dateTime={topArticle.publishedAt}>{headlineTime}</time>
          </div>
        </section>
        
        {/* Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridArticles.map((article, index) => {
            if (index === 3) {
              return <PositiveNewsCard key={article.id} article={article} />;
            }
            if (index === 7) {
              return <NegativeNewsCard key={article.id} article={article} />;
            }
            return <NewsCard key={article.id} article={article} />;
          })}
        </div>
      </div>
    </main>
  );
}