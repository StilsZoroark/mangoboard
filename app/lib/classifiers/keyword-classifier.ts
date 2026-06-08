// src/lib/classifiers/keyword-classifier.ts
import { Article } from '@app/types';
import { ArticleClassifier, BusinessClassification } from './types';
import { BUSINESS_POSITIVE_SIGNALS, NON_BUSINESS_NEGATIVE_SIGNALS } from './business-config';

export class KeywordBusinessClassifier implements ArticleClassifier {
  readonly version = 'keyword-v1';

  // 🌼 Helper methods stay private — only `classify` is part of the public contract
  private normalizeText(article: Article): string {
    return article.title.toLowerCase();
  }

  private findMatches(text: string, signals: readonly string[]): string[] {
    return signals.filter(signal => text.includes(signal));
  }

  // 🌼 The only method the outside world calls
  classify(article: Article): BusinessClassification {
    const text = this.normalizeText(article);

    const negativeMatches = this.findMatches(text, NON_BUSINESS_NEGATIVE_SIGNALS);
    if (negativeMatches.length > 0) {
      return {
        isBusiness: false,
        confidence: 0,
        matchedSignals: [],
        vetoReason: `Non-business signals: ${negativeMatches.join(', ')}`
      };
    }

    const positiveMatches = this.findMatches(text, BUSINESS_POSITIVE_SIGNALS);
    const confidence = positiveMatches.length >= 2 ? 100 : positiveMatches.length * 60;

    return {
      isBusiness: confidence >= 60,
      confidence,
      matchedSignals: positiveMatches
    };
  }
}

// 🌼 Export a singleton instance for easy use today
export const keywordClassifier = new KeywordBusinessClassifier();