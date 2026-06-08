// src/lib/classifiers/business-classifier.ts
import { Article } from '@app/types';
import { BUSINESS_POSITIVE_SIGNALS, NON_BUSINESS_NEGATIVE_SIGNALS } from './business-config';
import { BusinessClassification } from './types';

// 🌼 Clear return type: tells the caller exactly what to expect
/*export interface BusinessClassification {
//This is a redundant interface since we already have one in types.ts, but it serves as a reminder of the expected shape of the classification result. We can remove it if we want to avoid duplication.
  isBusiness: boolean;
  confidence: number;       // 0 to 100
  matchedSignals: string[];
  vetoReason?: string;
}*/

// 🌼 Helper: Normalizes article text into a single, lowercase string
function normalizeText(article: Article): string {
  return article.title.toLowerCase();
}

// 🌼 Helper: Finds which signals appear in the text
function findMatches(text: string, signals: readonly string[]): string[] {
  return signals.filter(signal => text.includes(signal));
}

// 🌼 Core Classifier: Pure function, deterministic, fast
export function classifyBusiness(article: Article): BusinessClassification {
  const text = normalizeText(article);

  // 1️⃣ Veto Check: If non-business signals exist, reject immediately
  const negativeMatches = findMatches(text, NON_BUSINESS_NEGATIVE_SIGNALS);
  if (negativeMatches.length > 0) {
    return {
      isBusiness: false,
      confidence: 0,
      matchedSignals: [],
      vetoReason: `Non-business signals found: ${negativeMatches.join(', ')}`
    };
  }

  // 2️⃣ Positive Scoring: Count business-related matches
  const positiveMatches = findMatches(text, BUSINESS_POSITIVE_SIGNALS);
  const matchCount = positiveMatches.length;

  // 🌼 Confidence Calculation: Linear scale capped at 100
  // 0 matches = 0, 1 match = 30, 2 matches = 60, 3+ = 100
  const confidence = matchCount >=2 ? 100 : matchCount *60;

  // 3️⃣ Threshold Decision: Require at least 2 signals to classify as "business"
  const isBusiness = confidence >= 60;

  return {
    isBusiness,
    confidence,
    matchedSignals: positiveMatches
  };
}