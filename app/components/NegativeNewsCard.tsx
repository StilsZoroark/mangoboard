import { Article } from "@app/types/index";

export function NegativeNewsCard({ article }: { article: Article }) {
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
        group relative block h-full overflow-hidden rounded-2xl p-5
        border border-rose-300/40 dark:border-rose-400/25
        bg-[#fcf5f5] dark:bg-[#180809]
        shadow-[inset_0_1px_0_rgba(254,226,226,0.45),0_4px_20px_rgba(244,63,94,0.06)]
        ring-1 ring-inset ring-rose-200/35 dark:ring-rose-500/10
        hover:bg-[#fae6e6] dark:hover:bg-[#260d0f]
        hover:border-rose-300/60
        hover:shadow-[inset_0_1px_0_rgba(254,226,226,0.6),0_8px_24px_rgba(244,63,94,0.14)]
        hover:-translate-y-0.5 transform-gpu active:translate-y-0
        transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-2xl
          bg-gradient-to-b from-rose-100/40 to-transparent opacity-70 dark:from-rose-950/20
        "
      />

      <div className="relative flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-rose-800 dark:text-rose-300">
            {article.source}
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-500/10 dark:bg-rose-400/15 border border-rose-400/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            <span>📉</span> Bearish Movement
          </span>
        </div>
        <time
          className="text-xs text-black/60 dark:text-white/60"
          dateTime={article.publishedAt}
        >
          {formattedDate}
        </time>
      </div>

      <h2 className="relative text-[16.5px] font-bold text-rose-900 dark:text-rose-400 mb-3 line-clamp-2 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
        {article.title}
      </h2>

      <span className="relative inline-block bg-rose-400/15 border border-rose-300/30 text-black dark:text-white text-xs px-2 py-0.5 rounded-full">
        {article.category}
      </span>
    </a>
  );
}
