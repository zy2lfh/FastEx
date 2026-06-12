export type AppLanguage = "zh-CN" | "en-US";

export type AppMessages = {
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
  languageSwitch: string;
};

export const LANGUAGE_STORAGE_KEY = "fastex:language";

export const messages: Record<AppLanguage, AppMessages> = {
  "zh-CN": {
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
    languageSwitch: "EN"
  },
  "en-US": {
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
    languageSwitch: "中文"
  }
};

export function detectInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "zh-CN" || saved === "en-US") {
      return saved;
    }
  } catch {
    // Ignore storage access errors and fall back to browser language.
  }

  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh-CN";
  }

  return "en-US";
}

export function toggleLanguage(current: AppLanguage): AppLanguage {
  return current === "zh-CN" ? "en-US" : "zh-CN";
}
