export type CurrencyOption = {
  code: string;
  name: string;
  symbol?: string;
};

export type CurrencyRow = {
  id: string;
  code: string;
  amount: string;
};

export type RatesSnapshot = {
  base: string;
  date: string;
  fetchedAt: number;
  rates: Record<string, number>;
};
