// src/lib/classifiers/types.ts
import { Article } from '@app/types';

// 🌼 The contract any classifier must fulfill
export interface ArticleClassifier {
  version: string; // e.g., 'keyword-v1', 'nlp-v2' — helps with logging/migrations
  classify(article: Article): Promise<BusinessClassification> | BusinessClassification;
}

// 🌼 Shared result type (already defined, just re-exported for clarity)
export interface BusinessClassification {
  isBusiness: boolean;
  confidence: number; // 0–100
  matchedSignals: string[];
  vetoReason?: string;
  metadata?: Record<string, unknown>; // for future AI explanations, model scores, etc.
}