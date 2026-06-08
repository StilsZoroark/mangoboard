import { Article } from "@/app/types";

export function preFilter(articles: Article[]): Article[] {
  // placeholder function; actual implementation is inferred from page.tsx

    
        // Example pre-filter: remove articles with very short titles or from certain sources
        return articles.filter(article => {
            return article.title.length > 20 && !article.source.includes("example-source");
        });
    
}
