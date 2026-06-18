import { Article } from "@app/types/index";
import { fetchNews } from "./fetchNews";
import { fetchMarketIndices, IndicesResult } from "./fetchIndices";
import { mistralClassifier, batchClassify, selectSentimentArticles } from "./classifiers/AI-classifier";
import { preFilter } from "./classifiers/Prefilter";
import { unstable_cache } from "next/cache";

const DISPLAY_LIMIT = 16;

export interface CachedPageData {
  isEmpty: boolean;
  indicesResult: IndicesResult;
  topArticle: Article | null;
  gridArticles: Article[];
}

export const getCachedPageData = unstable_cache(
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
  { revalidate: false, tags: ["homepage-news"] }
);
