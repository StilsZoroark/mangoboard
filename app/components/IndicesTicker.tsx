// src/components/IndicesTicker.tsx
'use client';
import { MarketIndex } from '@app/lib/fetchIndices';

interface IndicesTickerProps {
  indices: MarketIndex[];
  fetchedAt?: string; // optional — for future freshness UI
}

export default function IndicesTicker({ indices }: IndicesTickerProps) {
  if (indices.length === 0) {
    return (
      <div className="w-full overflow-hidden border-b border-slate-200 bg-slate-50 py-2 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Market data temporarily unavailable • Refresh to try again
      </div>
    );
  }

  const doubled = [...indices, ...indices];

  return (
    //<div className="relative w-full overflow-hidden border-b border-slate-200 bg-slate-50 py-2 dark:border-slate-800 dark:bg-slate-900">
    <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 py-2 mx-4 my-2 group">

      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent rounded-l-full" />

      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent rounded-r-full" />

      <div className="inline-flex animate-marquee whitespace-nowrap will-change-transform group-hover:animate-marquee-pause">
        {doubled.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="mx-4 flex items-center gap-2 text-sm font-medium"
          >
            <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
            <span
              className={`flex items-center gap-1 text-xs ${
                item.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {item.isUp ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
            <span className="mx-2 h-4 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          </div>
        ))}
      </div>
      
      
    </div>
  );
}