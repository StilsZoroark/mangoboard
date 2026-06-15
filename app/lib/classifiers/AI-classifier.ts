// lib/classifiers/mistralClassifier.ts

import {Mistral} from '@mistralai/mistralai';
import type { ArticleClassifier, BusinessClassification } from '@app/lib/classifiers/types';
import type { Article } from '@app/types';
import crypto from "crypto";
import { sql } from "../db";

// Use globalThis to persist the cache Map during development hot-reloading
const globalForCache = globalThis as unknown as {
  classificationCache: Map<string, BusinessClassification>;
};

if (!globalForCache.classificationCache) {
  globalForCache.classificationCache = new Map();
}

const classificationCache = globalForCache.classificationCache;

function getTitleHash(title: string): string {
  return crypto.createHash("sha256").update(title.toLowerCase().trim()).digest("hex");
}

// ============================================================
// 🌼 SECTION 1 — Client Setup
// We instantiate the Mistral client once at module level so it
// isn't recreated on every classify() call. The API key is read
// from environment variables — never hardcode it.
// ============================================================
console.log('API KEY LOADED:', process.env.MISTRAL_API_KEY?.slice(0, 8) + '...');
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

// ============================================================
// 🌼 SECTION 2 — The Prompt
// This is the most important part. We tell Mistral exactly what
// JSON shape to return so we can parse it reliably. We also give
// it Indian market context so it doesn't score "RBI" as irrelevant
// just because it's an unfamiliar acronym to a Western-trained model.
// ============================================================
function buildPrompt(article: Article): string {
  return `
You are a financial news classifier for an Indian business and markets dashboard.

Your job is to decide if the given article is relevant to Indian or global business, 
markets, economy, finance, startups, or corporate news.

Context clues for India-specific relevance:
- RBI, SEBI, NSE, BSE, Nifty, Sensex = highly relevant
- Budget, GST, repo rate, FII, DII = highly relevant
- Tata, Reliance, Infosys, Wipro, HDFC = highly relevant
- General crime, sports, entertainment, weather = NOT relevant
- Politics is only relevant if it directly impacts markets or economy

Given this article, return ONLY a valid JSON object with NO extra text, 
no markdown, no backticks. Just raw JSON.

{
  "isBusiness": boolean,
  "confidence": number between 0 and 100,
  "matchedSignals": array of short strings explaining why (max 4 signals),
  "vetoReason": string or null (only if isBusiness is false, explain why in one sentence)
}

Article Title: ${article.title}

Source: ${article.source}
`.trim();
}

// ============================================================
// 🌼 SECTION 3 — Response Parser
// Mistral is very good at JSON but occasionally wraps it in
// markdown code fences (```json ... ```) even when told not to.
// This parser handles both clean JSON and fenced JSON gracefully.
// ============================================================
function parseResponse(raw: string): Omit<BusinessClassification, 'metadata'> {
  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate the shape before trusting it
  if (typeof parsed.isBusiness !== 'boolean') {
    throw new Error('Missing isBusiness field');
  }
  if (typeof parsed.confidence !== 'number') {
    throw new Error('Missing confidence field');
  }

  return {
    isBusiness: parsed.isBusiness,
    confidence: Math.min(100, Math.max(0, parsed.confidence)), // clamp 0–100
    matchedSignals: Array.isArray(parsed.matchedSignals) ? parsed.matchedSignals : [],
    vetoReason: parsed.vetoReason ?? undefined,
  };
}

// ============================================================
// 🌼 SECTION 4 — The Classifier Implementation
// This is the class that fulfills your ArticleClassifier interface.
// version string follows your naming convention — if you ever swap
// models or change the prompt significantly, bump this string so
// logs clearly show which classifier produced which result.
// ============================================================
export class MistralClassifier implements ArticleClassifier {
  // Matches your interface: version helps with logging and migrations
  version = 'mistral-small-v1';

  async classify(article: Article): Promise<BusinessClassification> {
    const hash = getTitleHash(article.title);

    // 1. Check in-memory cache
    if (classificationCache.has(hash)) {
      const cached = classificationCache.get(hash)!;
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true,
          source: "memory",
        },
      };
    }

    // 2. Check Supabase database cache if connected
    if (sql) {
      try {
        const cachedResults = await sql`
          SELECT is_business as "isBusiness", confidence, matched_signals as "matchedSignals", veto_reason as "vetoReason"
          FROM classification_cache
          WHERE title_hash = ${hash}
          LIMIT 1
        `;

        if (cachedResults.length > 0) {
          const cached = cachedResults[0];
          const result: BusinessClassification = {
            isBusiness: cached.isBusiness,
            confidence: cached.confidence,
            matchedSignals: cached.matchedSignals || [],
            vetoReason: cached.vetoReason || undefined,
            metadata: {
              model: 'mistral-small-latest',
              classifierVersion: this.version,
              scoredAt: new Date().toISOString(),
              cached: true,
              source: "database",
            },
          };
          classificationCache.set(hash, result);
          return result;
        }
      } catch (err) {
        console.warn(`[Cache] Database read failed for "${article.title}":`, err);
      }
    }

    // 3. Query Mistral API
    try {
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: buildPrompt(article),
          }
        ],
        temperature: 0,
        maxTokens: 256,
      });

      const raw = response.choices?.[0]?.message?.content;

      if (!raw || typeof raw !== 'string') {
        throw new Error('Empty response from Mistral');
      }

      const result = parseResponse(raw);
      const finalResult: BusinessClassification = {
        ...result,
        metadata: {
          model: 'mistral-small-latest',
          classifierVersion: this.version,
          scoredAt: new Date().toISOString(),
        },
      };

      // 4. Save to caches
      classificationCache.set(hash, finalResult);
      if (sql) {
        sql`
          INSERT INTO classification_cache (title_hash, title, is_business, confidence, matched_signals, veto_reason)
          VALUES (${hash}, ${article.title}, ${finalResult.isBusiness}, ${finalResult.confidence}, ${finalResult.matchedSignals}, ${finalResult.vetoReason || null})
          ON CONFLICT (title_hash) DO NOTHING
        `.catch(err => {
          console.warn(`[Cache] Database write failed for "${article.title}":`, err);
        });
      }

      return finalResult;

    } catch (error) {
      // ============================================================
      // 🌼 SECTION 5 — Graceful Fallback
      // If Mistral is down, rate limited, or returns malformed JSON,
      // we return a neutral "maybe business" result rather than
      // crashing the whole feed. confidence 50 means "unsure" —
      // your dashboard can decide whether to show or hide 50s.
      // ============================================================
      console.warn(`[MistralClassifier] Failed to classify "${article.title}":`, error);

      return {
        isBusiness: true,       // optimistic default — show rather than hide
        confidence: 50,         // explicitly "unsure"
        matchedSignals: ['fallback — classification failed'],
        vetoReason: undefined,
        metadata: {
          model: 'mistral-small-latest',
          classifierVersion: this.version,
          scoredAt: new Date().toISOString(),
          fallback: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
// ADD THIS to the bottom of mistralClassifier.ts, before the singleton export

// ============================================================
// 🌼 SECTION 6 — Batch Classifier
// Processes articles in small batches with a delay between them.
// This prevents 429 rate limit errors on Mistral's free tier.
// batchSize=5 and delayMs=1000 is safe for free tier.
// ============================================================
export async function batchClassify(
  articles: Article[],
  classifier: MistralClassifier,
  batchSize = 5,
  delayMs = 1000
): Promise<BusinessClassification[]> {
  const results: BusinessClassification[] = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    // Process current batch in parallel — 5 at a time is safe
    const batchResults = await Promise.allSettled(
      batch.map(article => classifier.classify(article))
    );

    batchResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn(`Failed to classify: ${batch[idx].title}`);
        // Fallback — show article rather than silently drop it
        results.push({
          isBusiness: true,
          confidence: 50,
          matchedSignals: ['fallback — batch error'],
          metadata: { fallback: true }
        });
      }
    });

    // Log progress so you can see it working in terminal
    console.log(`🔄 Classified batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)}`);

    // Delay between batches — skip after the last one
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}


// Export a singleton instance so the whole app shares one client
export const mistralClassifier = new MistralClassifier();

export interface SentimentSelection {
  positiveArticleId: string | null;
  negativeArticleId: string | null;
}

export async function selectSentimentArticles(articles: Article[]): Promise<SentimentSelection> {
  if (articles.length === 0) {
    return { positiveArticleId: null, negativeArticleId: null };
  }

  const prompt = `
You are a financial news analyst. Given the following list of business news articles, select:
1. The most positive/bullish article (highest positive sentiment or positive market/economic news).
2. The most negative/bearish article (highest negative sentiment or negative market/economic news).

Articles:
${articles.map((art, idx) => `[ID: ${art.id}] Index ${idx}: ${art.title} (Source: ${art.source})`).join('\n')}

Return ONLY a valid JSON object with the following schema, with no explanation, markdown code blocks, or backticks:
{
  "positiveArticleId": "ID of the selected positive article (or null if none fit)",
  "negativeArticleId": "ID of the selected negative article (or null if none fit)"
}
`.trim();

  let raw = "";
  try {
    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      maxTokens: 512,
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('Empty or invalid response from Mistral');
    }
    raw = content;

    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    
    console.log('[selectSentimentArticles] Mistral selected:', parsed);

    return {
      positiveArticleId: typeof parsed.positiveArticleId === 'string' ? parsed.positiveArticleId : null,
      negativeArticleId: typeof parsed.negativeArticleId === 'string' ? parsed.negativeArticleId : null,
    };
  } catch (error) {
    console.warn('[selectSentimentArticles] Failed to select sentiment articles:', error, 'Raw output was:', raw);
    // Graceful fallback: pick the first and second articles if AI selection fails
    return {
      positiveArticleId: articles[0]?.id || null,
      negativeArticleId: articles[1]?.id || null,
    };
  }
}