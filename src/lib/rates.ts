import type { RatesSnapshot } from "../types";

const CACHE_PREFIX = "fastex:rates:";
const CACHE_TTL = 1000 * 60 * 30;

function readCache(base: string): RatesSnapshot | null {
  const cached = localStorage.getItem(`${CACHE_PREFIX}${base}`);
  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as RatesSnapshot;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(snapshot: RatesSnapshot) {
  localStorage.setItem(`${CACHE_PREFIX}${snapshot.base}`, JSON.stringify(snapshot));
}

export async function fetchRates(base: string, quotes: string[]): Promise<RatesSnapshot> {
  const uniqueQuotes = [...new Set(quotes.filter((quote) => quote !== base))];
  const cached = readCache(base);

  if (cached && uniqueQuotes.every((quote) => quote in cached.rates)) {
    return cached;
  }

  const params = new URLSearchParams({
    base,
    quotes: uniqueQuotes.join(",")
  });

  const response = await fetch(`https://api.frankfurter.dev/v2/rates?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status}`);
  }

  const raw = (await response.json()) as
    | Array<{
        date: string;
        base: string;
        quote: string;
        rate: number;
      }>
    | {
        date?: string;
        base?: string;
        rates?: Record<string, number>;
      };

  const rows = Array.isArray(raw)
    ? raw
    : Object.entries(raw.rates ?? {}).map(([quote, rate]) => ({
        date: raw.date ?? new Date().toISOString().slice(0, 10),
        base: raw.base ?? base,
        quote,
        rate
      }));

  const snapshot: RatesSnapshot = {
    base,
    date: rows[0]?.date ?? new Date().toISOString().slice(0, 10),
    fetchedAt: Date.now(),
    rates: Object.fromEntries(rows.map((row) => [row.quote, row.rate]))
  };

  writeCache(snapshot);
  return snapshot;
}

export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  snapshot: RatesSnapshot
) {
  if (fromCode === toCode) {
    return amount;
  }

  if (fromCode !== snapshot.base) {
    throw new Error("Snapshot base does not match source currency.");
  }

  const rate = snapshot.rates[toCode];
  if (!rate) {
    throw new Error(`Missing rate for ${toCode}`);
  }

  return amount * rate;
}

export function formatAmount(value: number) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return value.toFixed(2);
}
