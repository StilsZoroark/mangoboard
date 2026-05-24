import { Article } from "@app/types/index";

export function NewsCard({ article }: { article: Article }) {
  // Format date: "22 May"
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <a
  href={article.url}
  target="_blank"
  rel="noopener noreferrer" // 🔒 Required for security & performance
  className="group block h-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-colors"
>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {article.source}
        </span>
        <time className="text-xs text-gray-500" dateTime={article.publishedAt}>
          {formattedDate}
        </time>
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {article.title}
      </h2>

      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
        {article.category}
      </span>
    </a>
  );
}