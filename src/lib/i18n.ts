export type AppLanguage = "zh-CN" | "en-US" | "ja-JP" | "zh-TW";

export type AppMessages = {
  htmlLang: string;
  metaDescription: string;
  updating: string;
  loading: string;
  lastUpdated: (value: string) => string;
  sort: string;
  doneSorting: string;
  add: string;
  delete: string;
  deleteCurrency: (code: string) => string;
  inputCurrency: string;
  refreshError: string;
  footerCreatedPrefix: string;
  footerCreatedSuffix: string;
  footerDataPrefix: string;
  footerDataSuffix: string;
  footerVerify: string;
  languageButton: string;
};

export type LanguageOption = {
  code: AppLanguage;
  flag: string;
  shortLabel: string;
  nativeLabel: string;
};

export const LANGUAGE_STORAGE_KEY = "fastex:language";

export const languageOptions: LanguageOption[] = [
  { code: "zh-CN", flag: "🇨🇳", shortLabel: "简", nativeLabel: "简体中文" },
  { code: "en-US", flag: "🇺🇸", shortLabel: "EN", nativeLabel: "English" },
  { code: "ja-JP", flag: "🇯🇵", shortLabel: "日", nativeLabel: "日本語" },
  { code: "zh-TW", flag: "🇹🇼", shortLabel: "繁", nativeLabel: "繁體中文" }
];

export const messages: Record<AppLanguage, AppMessages> = {
  "zh-CN": {
    htmlLang: "zh-CN",
    metaDescription: "FastEx 是一个轻量、好看的多币种汇率换算工具。",
    updating: "更新中...",
    loading: "加载中...",
    lastUpdated: (value) => `最近更新 ${value}`,
    sort: "排序",
    doneSorting: "完成排序",
    add: "添加",
    delete: "删除",
    deleteCurrency: (code) => `删除 ${code}`,
    inputCurrency: "当前输入货币",
    refreshError: "汇率更新失败，已尝试使用缓存数据，请稍后重试。",
    footerCreatedPrefix: "FastEx 由 ",
    footerCreatedSuffix: " 创建。",
    footerDataPrefix: "汇率数据由 ",
    footerDataSuffix: " 提供。为提升速度，页面会使用缓存数据，结果仅供参考。",
    footerVerify: "如涉及重要金额，请以银行、发卡机构或实际支付平台为准。",
    languageButton: "切换语言"
  },
  "en-US": {
    htmlLang: "en-US",
    metaDescription: "FastEx is a lightweight and elegant multi-currency exchange-rate converter.",
    updating: "Updating...",
    loading: "Loading...",
    lastUpdated: (value) => `Last updated ${value}`,
    sort: "Sort",
    doneSorting: "Done",
    add: "Add",
    delete: "Delete",
    deleteCurrency: (code) => `Delete ${code}`,
    inputCurrency: "Input currency",
    refreshError: "Rates could not be refreshed. Cached data was used when available. Please try again later.",
    footerCreatedPrefix: "FastEx was created by ",
    footerCreatedSuffix: ".",
    footerDataPrefix: "Exchange-rate data is provided via ",
    footerDataSuffix: ". Rates are cached for speed and shown for reference only.",
    footerVerify: "Always verify important amounts with your bank, card issuer, or payment provider.",
    languageButton: "Switch language"
  },
  "ja-JP": {
    htmlLang: "ja-JP",
    metaDescription: "FastEx は軽量で使いやすい多通貨為替換算ツールです。",
    updating: "更新中...",
    loading: "読み込み中...",
    lastUpdated: (value) => `最終更新 ${value}`,
    sort: "並び替え",
    doneSorting: "完了",
    add: "追加",
    delete: "削除",
    deleteCurrency: (code) => `${code} を削除`,
    inputCurrency: "入力中の通貨",
    refreshError: "為替レートを更新できませんでした。利用可能な場合はキャッシュ済みデータを使用しています。しばらくしてからもう一度お試しください。",
    footerCreatedPrefix: "FastEx は ",
    footerCreatedSuffix: " により作成されました。",
    footerDataPrefix: "為替データは ",
    footerDataSuffix: " により提供されています。表示速度向上のためキャッシュを利用しており、結果は参考情報です。",
    footerVerify: "重要な金額は、銀行・カード会社・実際の決済サービスで必ず再確認してください。",
    languageButton: "言語を切り替え"
  },
  "zh-TW": {
    htmlLang: "zh-TW",
    metaDescription: "FastEx 是一個輕量、好用的多幣別匯率換算工具。",
    updating: "更新中...",
    loading: "載入中...",
    lastUpdated: (value) => `最近更新 ${value}`,
    sort: "排序",
    doneSorting: "完成排序",
    add: "新增",
    delete: "刪除",
    deleteCurrency: (code) => `刪除 ${code}`,
    inputCurrency: "目前輸入幣別",
    refreshError: "匯率更新失敗，已嘗試使用快取資料，請稍後再試。",
    footerCreatedPrefix: "FastEx 由 ",
    footerCreatedSuffix: " 建立。",
    footerDataPrefix: "匯率資料由 ",
    footerDataSuffix: " 提供。為了提升速度，頁面會使用快取資料，結果僅供參考。",
    footerVerify: "如涉及重要金額，請以銀行、發卡機構或實際支付平台為準。",
    languageButton: "切換語言"
  }
};

function normalizeBrowserLanguage(value: string): AppLanguage {
  const lower = value.toLowerCase();
  if (lower.startsWith("ja")) {
    return "ja-JP";
  }
  if (lower.startsWith("zh-tw") || lower.startsWith("zh-hk") || lower.startsWith("zh-mo")) {
    return "zh-TW";
  }
  if (lower.startsWith("zh")) {
    return "zh-CN";
  }
  return "en-US";
}

export function detectInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "zh-CN" || saved === "en-US" || saved === "ja-JP" || saved === "zh-TW") {
      return saved;
    }
  } catch {
    // Ignore storage access errors and fall back to browser language.
  }

  if (typeof navigator !== "undefined") {
    return normalizeBrowserLanguage(navigator.language);
  }

  return "en-US";
}

export function getLanguageOption(language: AppLanguage): LanguageOption {
  return languageOptions.find((option) => option.code === language) ?? languageOptions[0];
}
