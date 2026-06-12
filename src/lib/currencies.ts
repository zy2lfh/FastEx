import type { AppLanguage } from "./i18n";
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

const LOCALIZED_CURRENCY_NAMES: Record<AppLanguage, Record<string, string>> = {
  "zh-CN": {
    AED: "阿联酋迪拉姆",
    AUD: "澳大利亚元",
    CAD: "加拿大元",
    CHF: "瑞士法郎",
    CNY: "人民币",
    EUR: "欧元",
    GBP: "英镑",
    HKD: "港币",
    INR: "印度卢比",
    JPY: "日元",
    KRW: "韩元",
    NOK: "挪威克朗",
    NZD: "新西兰元",
    SGD: "新加坡元",
    THB: "泰铢",
    TWD: "新台币",
    USD: "美元",
    VND: "越南盾"
  },
  "en-US": {},
  "ja-JP": {
    AED: "UAEディルハム",
    AUD: "オーストラリアドル",
    CAD: "カナダドル",
    CHF: "スイスフラン",
    CNY: "人民元",
    EUR: "ユーロ",
    GBP: "英ポンド",
    HKD: "香港ドル",
    INR: "インドルピー",
    JPY: "日本円",
    KRW: "韓国ウォン",
    NOK: "ノルウェークローネ",
    NZD: "ニュージーランドドル",
    SGD: "シンガポールドル",
    THB: "タイバーツ",
    TWD: "台湾ドル",
    USD: "米ドル",
    VND: "ベトナムドン"
  },
  "zh-TW": {
    AED: "阿聯酋迪拉姆",
    AUD: "澳幣",
    CAD: "加拿大元",
    CHF: "瑞士法郎",
    CNY: "人民幣",
    EUR: "歐元",
    GBP: "英鎊",
    HKD: "港幣",
    INR: "印度盧比",
    JPY: "日圓",
    KRW: "韓元",
    NOK: "挪威克朗",
    NZD: "紐西蘭元",
    SGD: "新加坡元",
    THB: "泰銖",
    TWD: "新台幣",
    USD: "美元",
    VND: "越南盾"
  }
};

export function getLocalizedCurrencyName(
  code: string,
  fallbackName: string,
  language: AppLanguage
) {
  return LOCALIZED_CURRENCY_NAMES[language][code] ?? fallbackName;
}
