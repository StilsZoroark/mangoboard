import { Article } from "@app/types/index";

/*
  Original simplistic style — swap classNames below to revert:

  <a className="group block h-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-colors">
  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
  <time className="text-xs text-gray-500" dateTime={...}>
  <h2 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
*/

export function NewsCard({ article }: { article: Article }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group relative block h-full overflow-hidden rounded-2xl p-4
        border border-orange-300/35 dark:border-orange-400/20
        bg-orange-50/25 dark:bg-orange-950/20
        backdrop-blur-xl backdrop-saturate-200
        shadow-[inset_0_1px_0_rgba(255,230,140,0.4),0_4px_20px_rgba(200,90,0,0.1)]
        ring-1 ring-inset ring-amber-200/35 dark:ring-amber-500/10
        hover:bg-orange-500/15 hover:border-orange-300/50
        hover:shadow-[inset_0_1px_0_rgba(255,230,140,0.55),0_8px_28px_rgba(200,90,0,0.18)]
        hover:-translate-y-0.5 active:translate-y-0
        transition-all duration-150
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-2xl
          bg-gradient-to-b from-amber-100/35 to-transparent opacity-70
        "
      />

      <div className="relative flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-800 dark:text-orange-300">
          {article.source}
        </span>
        <time
          className="text-xs text-orange-900/60 dark:text-orange-200/60"
          dateTime={article.publishedAt}
        >
          {formattedDate}
        </time>
      </div>

      <h2 className="relative text-base font-semibold text-orange-950 dark:text-orange-50 mb-3 line-clamp-2 group-hover:text-orange-700 dark:group-hover:text-orange-200 transition-colors">
        {article.title}
      </h2>

      <span className="relative inline-block bg-orange-400/15 border border-orange-300/30 text-orange-900 dark:text-orange-200 text-xs px-2 py-0.5 rounded-full">
        {article.category}
      </span>
    </a>
  );
}
