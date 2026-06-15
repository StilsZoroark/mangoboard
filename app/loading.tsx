export default function Loading() {
  return (
    <main className="min-h-screen bg-yellow-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Skeleton */}
      <div className="mx-auto max-w-7xl flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">Mangoboard</p>
        <div className="h-9 w-20 bg-orange-500/10 dark:bg-orange-500/5 border border-orange-300/20 dark:border-orange-500/10 rounded-full animate-pulse" />
      </div>

      {/* Indices Ticker Skeleton */}
      <div className="mx-auto max-w-7xl mb-6 bg-[#fffaf0] dark:bg-[#150b0a]/30 border border-orange-300/15 dark:border-orange-400/5 rounded-2xl p-3 flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-100 dark:bg-zinc-900 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Centered Heading / Top Story Skeleton */}
        <section className="mb-10 text-center space-y-4">
          <div className="inline-block bg-blue-50/70 dark:bg-blue-950/20 h-6 w-24 rounded-full animate-pulse" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="h-8 w-full bg-gray-200/80 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-gray-200/80 dark:bg-zinc-800 rounded mx-auto animate-pulse" />
          </div>
          <div className="h-4 w-40 bg-gray-200/60 dark:bg-zinc-800/60 rounded mx-auto animate-pulse" />
        </section>

        {/* Responsive Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 15 }).map((_, index) => {
            if (index === 3) {
              // PositiveNewsCard skeleton (green)
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl p-5 border border-emerald-300/20 dark:border-emerald-800/10 bg-[#f4fcf6]/50 dark:bg-[#07160e]/30 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-16 bg-emerald-200/60 dark:bg-emerald-950/40 rounded animate-pulse" />
                    <div className="h-3.5 w-24 bg-emerald-200/40 dark:bg-emerald-950/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-emerald-200/50 dark:bg-emerald-900/20 rounded animate-pulse" />
                    <div className="h-5 w-4/5 bg-emerald-200/50 dark:bg-emerald-900/20 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-emerald-200/40 dark:bg-emerald-950/30 rounded-full animate-pulse mt-4" />
                </div>
              );
            }
            if (index === 7) {
              // NegativeNewsCard skeleton (red)
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl p-5 border border-rose-300/20 dark:border-rose-800/10 bg-[#fcf5f5]/50 dark:bg-[#180809]/30 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-16 bg-rose-200/60 dark:bg-rose-950/40 rounded animate-pulse" />
                    <div className="h-3.5 w-24 bg-rose-200/40 dark:bg-rose-950/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-rose-200/50 dark:bg-rose-900/20 rounded animate-pulse" />
                    <div className="h-5 w-4/5 bg-rose-200/50 dark:bg-rose-900/20 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-rose-200/40 dark:bg-rose-950/30 rounded-full animate-pulse mt-4" />
                </div>
              );
            }
            // Standard NewsCard skeleton
            return (
              <div
                key={index}
                className="bg-[#fffaf0]/40 dark:bg-[#150b0a]/30 border border-orange-300/15 dark:border-orange-400/5 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3.5 w-10 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-full bg-gray-200 dark:bg-zinc-800/80 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-800/80 rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-gray-100 dark:bg-zinc-900/60 rounded-full animate-pulse mt-4" />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}