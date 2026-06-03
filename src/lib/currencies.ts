import type { CurrencyOption } from "../types";

const FALLBACK_CURRENCIES: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "CNY" },
  { code: "JPY", name: "Japanese Yen", symbol: "JPY" },
  { code: "EUR", name: "Euro", symbol: "EUR" },
  { code: "GBP", name: "British Pound", symbol: "GBP" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "KRW", name: "South Korean Won", symbol: "KRW" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  { code: "THB", name: "Thai Baht", symbol: "THB" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "INR", name: "Indian Rupee", symbol: "INR" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" }
];

export async function fetchCurrencies(): Promise<CurrencyOption[]> {
  try {
    const response = await fetch("https://api.frankfurter.dev/v2/currencies");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = (await response.json()) as
      | Array<{
          iso_code: string;
          name: string;
          symbol?: string;
        }>
      | Record<string, string>;

    const normalized = Array.isArray(raw)
      ? raw.map((currency) => ({
          code: currency.iso_code,
          name: currency.name,
          symbol: currency.symbol
        }))
      : Object.entries(raw).map(([code, name]) => ({
          code,
          name
        }));

    return normalized
      .filter((currency) => hasCurrencyFlag(currency.code))
      .sort((a, b) => a.code.localeCompare(b.code));
  } catch {
    return FALLBACK_CURRENCIES;
  }
}

const FLAG_BY_CURRENCY: Record<string, string> = {
  AED: "AE",
  AUD: "AU",
  CAD: "CA",
  CHF: "CH",
  CNY: "CN",
  EUR: "EU",
  GBP: "GB",
  HKD: "HK",
  IMP: "IM",
  INR: "IN",
  JPY: "JP",
  KRW: "KR",
  NOK: "NO",
  NZD: "NZ",
  SGD: "SG",
  THB: "TH",
  TWD: "TW",
  USD: "US",
  VND: "VN"
};

function toFlagEmoji(countryCode: string) {
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return "¤";
  }

  return String.fromCodePoint(
    ...countryCode.split("").map((char) => 127397 + char.charCodeAt(0))
  );
}

export function getCurrencyFlag(code: string) {
  return toFlagEmoji(FLAG_BY_CURRENCY[code] ?? "");
}

export function hasCurrencyFlag(code: string) {
  return code in FLAG_BY_CURRENCY;
}
