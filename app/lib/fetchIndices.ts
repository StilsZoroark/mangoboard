// src/lib/fetchIndices.ts
import YahooFinance from 'yahoo-finance2';
import { Quote } from 'yahoo-finance2/modules/quote';

const yahooFinance =  new YahooFinance();
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isUp: boolean;
}

export interface IndicesResult {
  indices: MarketIndex[];
  errors: { symbol: string; reason: string }[];
  fetchedAt: string;
}

const INDICES = [
  { symbol: '^NSEI',  name: 'Nifty 50'   },
  { symbol: '^BSESN', name: 'Sensex'     },
  { symbol: '^NSEBANK', name: 'Bank Nifty' },
  { symbol: '^DJI',  name: 'Dow Jones'  },
  { symbol: '^IXIC', name: 'Nasdaq'     },
  { symbol: '^GSPC', name: 'S&P 500'    },
  { symbol: '^FTSE', name: 'FTSE 100'   },
];

const QUOTE_FIELDS = [
  'regularMarketPrice',
  'regularMarketChange',
  'regularMarketChangePercent',
  'shortName',
] as const;

export async function fetchMarketIndices(): Promise<IndicesResult> {
  const results = await Promise.allSettled(
    INDICES.map(i =>
      yahooFinance.quote(i.symbol, { fields: [...QUOTE_FIELDS] })
    )
  );

  const indices: MarketIndex[] = [];
  const errors: { symbol: string; reason: string }[] = [];

  results.forEach((result, idx) => {
    const { symbol, name } = INDICES[idx];

    if (result.status === 'fulfilled') {
      const q = result.value as Quote; //fixes the never error
      if (q.regularMarketPrice == null) {
        errors.push({ symbol, reason: 'No price returned' });
        return;
      }
      const change = q.regularMarketChange ?? 0;
      const changePercent = q.regularMarketChangePercent ?? 0;

      indices.push({
        symbol,
        name,
        price: q.regularMarketPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        isUp: change >= 0,
      });
    } else {
      errors.push({ symbol, reason: result.reason?.message ?? 'Unknown error' });
    }
  });

  if (errors.length) console.warn('⚠️ Some indices failed:', errors);

  return { indices, errors, fetchedAt: new Date().toISOString() };
}