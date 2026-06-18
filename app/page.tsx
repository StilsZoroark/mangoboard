export const dynamic = 'force-dynamic';

import { NewsCard } from "@app/components/NewsCard";
import { PositiveNewsCard } from "@app/components/PositiveNewsCard";
import { NegativeNewsCard } from "@app/components/NegativeNewsCard";
import IndicesTicker from "@app/components/IndicesTicker";
import DashboardMenu from "@app/components/DashboardMenu";
import { auth } from "@/auth";
import { getCachedPageData } from "./lib/resolvePageData";

export default async function HomePage() {
  const data = await getCachedPageData();
  const session = await auth();

  // If the api response is empty or data failed to resolve
  if (data.isEmpty || !data.topArticle) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 dark:bg-zinc-950 px-4">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No business articles matched our filter.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Refreshing feeds shortly...</p>
      </main>
    );
  }

  const { indicesResult, topArticle, gridArticles } = data;

  const headlineTime = new Date(topArticle.publishedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-yellow-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">Mangoboard</p>
        <DashboardMenu session={session} />
      </div>
      
      <div className="mx-auto max-w-7xl mb-6">
        <IndicesTicker 
          indices={indicesResult.indices}
          fetchedAt={indicesResult.fetchedAt}
        />
      </div>
      
      <div className="mx-auto max-w-7xl">
        {/* Centered Heading */}
        <section className="mb-10 text-center">
          <div className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Top Story
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
            <a 
              href={topArticle.url} 
              className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors underline decoration-blue-300 dark:decoration-blue-700/60 decoration-2 hover:decoration-blue-600 dark:hover:decoration-blue-400 underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {topArticle.title}
            </a>
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-500">{topArticle.source}</span>
            <span>•</span>
            <time dateTime={topArticle.publishedAt}>{headlineTime}</time>
          </div>
        </section>
        
        {/* Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridArticles.map((article, index) => {
            if (index === 3) {
              return <PositiveNewsCard key={article.id} article={article} />;
            }
            if (index === 7) {
              return <NegativeNewsCard key={article.id} article={article} />;
            }
            return <NewsCard key={article.id} article={article} />;
          })}
        </div>
      </div>
    </main>
  );
}