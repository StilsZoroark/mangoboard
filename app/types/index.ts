export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO 8601 format (e.g., "2026-05-22T08:30:00Z")
  category: string;
}