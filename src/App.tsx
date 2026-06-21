import { useEffect, useMemo, useState } from "react";
import { fetchCurrencies, getCurrencyFlag, getLocalizedCurrencyName } from "./lib/currencies";
import {
  detectInitialLanguage,
  LANGUAGE_STORAGE_KEY,
  languageOptions,
  messages,
  type AppLanguage
} from "./lib/i18n";
import { convertAmount, fetchRates, formatAmount } from "./lib/rates";
import type { CurrencyOption, CurrencyRow, RatesSnapshot } from "./types";

const DEFAULT_ROWS: CurrencyRow[] = [
  { id: crypto.randomUUID(), code: "USD", amount: "1" },
  { id: crypto.randomUUID(), code: "CNY", amount: "" },
  { id: crypto.randomUUID(), code: "JPY", amount: "" }
];

const REFRESH_MINUTES = 30;
const ROWS_STORAGE_KEY = "fastex:rows";
const SUPPORT_URL = "https://buymeacoffee.com/zy2lfh";

function loadInitialRows() {
  try {
    const raw = localStorage.getItem(ROWS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ROWS;
    }

    const parsed = JSON.parse(raw) as CurrencyRow[];
    if (!Array.isArray(parsed) || parsed.length < 2) {
      return DEFAULT_ROWS;
    }

    return parsed.map((row) => ({
      id: row.id || crypto.randomUUID(),
      code: row.code,
      amount: row.amount ?? ""
    }));
  } catch {
    return DEFAULT_ROWS;
  }
}

function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => detectInitialLanguage());
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [rows, setRows] = useState<CurrencyRow[]>(() => loadInitialRows());
  const [sourceRowId, setSourceRowId] = useState<string>(() => loadInitialRows()[0].id);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [snapshot, setSnapshot] = useState<RatesSnapshot | null>(null);
  const [isSortMode, setIsSortMode] = useState<boolean>(false);
  const [swipedRowId, setSwipedRowId] = useState<string | null>(null);
  const [dragRowId, setDragRowId] = useState<string | null>(null);
  const [draggingVisualId, setDraggingVisualId] = useState<string | null>(null);
  const [dropTargetRowId, setDropTargetRowId] = useState<string | null>(null);
  const [replaceArmedRowId, setReplaceArmedRowId] = useState<string | null>(null);
  const [touchSort, setTouchSort] = useState<{ rowId: string; y: number } | null>(null);
  const [touchSwipe, setTouchSwipe] = useState<{ rowId: string; x: number } | null>(null);

  useEffect(() => {
    fetchCurrencies().then(setCurrencies);
  }, []);

  useEffect(() => {
    if (currencies.length < 2) {
      return;
    }

    const allowedCodes = new Set(currencies.map((currency) => currency.code));
    setRows((currentRows) => {
      const kept = currentRows.filter((row) => allowedCodes.has(row.code));
      const next = kept.length > 0 ? kept : [{ id: crypto.randomUUID(), code: currencies[0].code, amount: "1" }];

      while (next.length < 2) {
        const code = currencies.find((currency) => !next.some((row) => row.code === currency.code))?.code;
        if (!code) {
          break;
        }
        next.push({ id: crypto.randomUUID(), code, amount: "" });
      }

      const changed =
        next.length !== currentRows.length ||
        next.some(
          (row, index) =>
            row.id !== currentRows[index]?.id ||
            row.code !== currentRows[index]?.code ||
            row.amount !== currentRows[index]?.amount
        );

      return changed ? next : currentRows;
    });
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem(ROWS_STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const copy = messages[language];
  const currencyMap = useMemo(
    () => new Map(currencies.map((currency) => [currency.code, currency])),
    [currencies]
  );
  const currencyCodesKey = rows.map((row) => row.code).join(",");
  const sourceRow = useMemo(
    () => rows.find((row) => row.id === sourceRowId) ?? rows[0],
    [rows, sourceRowId]
  );
  const sourceAmountText = sourceRow?.amount ?? "";
  const sourceCode = sourceRow?.code ?? "";

  useEffect(() => {
    if (!rows.some((row) => row.id === sourceRowId) && rows[0]) {
      setSourceRowId(rows[0].id);
    }
  }, [rows, sourceRowId]);

  useEffect(() => {
    let cancelled = false;
    const quoteCodes = currencyCodesKey.split(",").filter(Boolean);

    async function refreshRates() {
      if (!sourceRow || !sourceCode) {
        return;
      }

      if (sourceAmountText.trim() === "") {
        setRows((currentRows) =>
          currentRows.map((row) => (row.id === sourceRow.id ? row : { ...row, amount: "" }))
        );
        return;
      }

      const sourceAmount = Number(sourceAmountText);
      if (Number.isNaN(sourceAmount)) {
        return;
      }

      setIsRefreshing(true);
      setError("");

      try {
        const latest = await fetchRates(sourceCode, quoteCodes);

        if (cancelled) {
          return;
        }

        setRows((currentRows) =>
          currentRows.map((row) => {
            if (row.id === sourceRow.id) {
              return row;
            }

            const value = convertAmount(sourceAmount, sourceCode, row.code, latest);
            return {
              ...row,
              amount: formatAmount(value)
            };
          })
        );

          setLastUpdatedAt(latest.fetchedAt);
          setSnapshot(latest);
      } catch {
        if (!cancelled) {
          setError(copy.refreshError);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    refreshRates();
    const timer = window.setInterval(refreshRates, REFRESH_MINUTES * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sourceAmountText, sourceCode, sourceRow, currencyCodesKey, copy.refreshError]);

  function updateAmount(id: string, amount: string) {
    setSourceRowId(id);
    setReplaceArmedRowId(null);
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, amount } : row))
    );
  }

  function updateCurrency(id: string, code: string) {
    setSourceRowId(id);
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, code } : row))
    );
  }

  function addRow() {
    const available =
      currencies.find((currency) => !rows.some((row) => row.code === currency.code)) ??
      currencies[0];

    if (!available) {
      return;
    }

    setRows((currentRows) => [
      ...currentRows,
      { id: crypto.randomUUID(), code: available.code, amount: "" }
    ]);
  }

  function removeRow(id: string) {
    if (rows.length <= 2) {
      return;
    }

    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
    setSwipedRowId(null);
  }

  function getRateNote(rowId: string, rowCode: string) {
    if (!snapshot || !sourceCode) {
      return "";
    }

    if (rowId === sourceRowId) {
      return copy.inputCurrency;
    }

    try {
      const value = convertAmount(1, sourceCode, rowCode, snapshot);
      return `1 ${sourceCode} = ${formatAmount(value)} ${rowCode}`;
    } catch {
      return "";
    }
  }

  function reorderRows(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= rows.length) {
      return;
    }

    setRows((currentRows) => {
      const next = [...currentRows];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setSwipedRowId(null);
  }

  function handleTouchSortStart(rowId: string, y: number) {
    setSwipedRowId(null);
    setTouchSwipe(null);
    setDraggingVisualId(rowId);
    setTouchSort({ rowId, y });
  }

  function handleTouchSortMove(y: number) {
    if (!touchSort) {
      return;
    }

    const fromIndex = rows.findIndex((row) => row.id === touchSort.rowId);
    if (fromIndex < 0) {
      return;
    }

    const delta = y - touchSort.y;
    if (Math.abs(delta) < 24) {
      return;
    }

    const toIndex = delta > 0 ? fromIndex + 1 : fromIndex - 1;
    reorderRows(fromIndex, toIndex);
    setTouchSort({ rowId: touchSort.rowId, y });
  }

  function handleTouchSwipeStart(rowId: string, x: number) {
    setTouchSwipe({ rowId, x });
  }

  function handleTouchSwipeMove(x: number) {
    if (!touchSwipe) {
      return;
    }

    const delta = x - touchSwipe.x;
    if (delta < -24) {
      setSwipedRowId(touchSwipe.rowId);
    }
    if (delta > 16) {
      setSwipedRowId(null);
    }
  }

  function toggleSortMode() {
    setIsSortMode((current) => {
      const next = !current;
      if (next) {
        setSwipedRowId(null);
      }
      return next;
    });
    setTouchSort(null);
    setTouchSwipe(null);
    setDragRowId(null);
    setDraggingVisualId(null);
    setDropTargetRowId(null);
    setReplaceArmedRowId(null);
  }

  function armReplaceMode(id: string, currentValue: string, input: HTMLInputElement) {
    setSourceRowId(id);
    if (currentValue.trim() !== "") {
      setReplaceArmedRowId(id);
      requestAnimationFrame(() => input.select());
      return;
    }
    setReplaceArmedRowId(null);
  }

  const lastUpdatedText = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString(language)
    : "";

  useEffect(() => {
    document.documentElement.lang = copy.htmlLang;
    document.title = "FastEx";
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", copy.metaDescription);
  }, [copy.htmlLang, copy.metaDescription]);

  return (
    <main className="shell">
      <section className="board">
        <div className="topmeta">
          <p>
            {isRefreshing
              ? copy.updating
              : lastUpdatedText
                ? copy.lastUpdated(lastUpdatedText)
                : copy.loading}
          </p>
        </div>
        <div className="topbar">
          <div className="brand">
            <h1>FastEx</h1>
          </div>
          <div className="top-actions">
            <label className="lang-select-wrap">
              <select
                aria-label={copy.languageButton}
                className="lang-select"
                onChange={(event) => setLanguage(event.target.value as AppLanguage)}
                value={language}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.flag} {option.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={`sort-toggle ${isSortMode ? "active" : ""}`}
              onClick={toggleSortMode}
              type="button"
            >
              ⇅ {isSortMode ? copy.doneSorting : copy.sort}
            </button>
            <button className="ghost-button" onClick={addRow} type="button">
              + {copy.add}
            </button>
          </div>
        </div>

        <div className={`rows ${isSortMode ? "sort-mode" : ""}`}>
          {rows.map((row, index) => (
            <article
              className={`row-shell ${swipedRowId === row.id ? "swiped" : ""} ${isSortMode ? "sort-mode" : ""}`}
              key={row.id}
            >
              <button
                aria-label={copy.deleteCurrency(row.code)}
                className="swipe-delete"
                onClick={() => removeRow(row.id)}
                type="button"
              >
                {copy.delete}
              </button>
              <div
                className={`currency-row ${index === 0 ? "base active" : ""} ${isSortMode ? "sorting-enabled" : ""} ${draggingVisualId === row.id ? "floating sort-selected" : ""} ${dropTargetRowId === row.id && draggingVisualId !== row.id ? "sort-target" : ""}`}
                draggable={isSortMode}
                onClick={() => setSwipedRowId(null)}
                onDragEnd={() => {
                  setDragRowId(null);
                  setDraggingVisualId(null);
                  setDropTargetRowId(null);
                }}
                onDragOver={(event) => {
                  if (isSortMode) {
                    event.preventDefault();
                    if (dragRowId && dragRowId !== row.id) {
                      setDropTargetRowId(row.id);
                    }
                  }
                }}
                onDragStart={(event) => {
                  if (!isSortMode) {
                    return;
                  }
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", row.id);
                  setDragRowId(row.id);
                  setDraggingVisualId(row.id);
                  setDropTargetRowId(null);
                }}
                onDrop={() => {
                  if (!isSortMode) {
                    return;
                  }
                  if (!dragRowId || dragRowId === row.id) {
                    return;
                  }
                  const fromIndex = rows.findIndex((item) => item.id === dragRowId);
                  reorderRows(fromIndex, index);
                  setDragRowId(null);
                  setDraggingVisualId(null);
                  setDropTargetRowId(null);
                }}
                onTouchEnd={() => {
                  setTouchSort(null);
                  setTouchSwipe(null);
                  setDraggingVisualId(null);
                  setDropTargetRowId(null);
                }}
                onTouchMove={(event) => {
                  const touch = event.touches[0];
                  if (isSortMode) {
                    event.preventDefault();
                    handleTouchSortMove(touch.clientY);
                    return;
                  }
                  handleTouchSwipeMove(touch.clientX);
                }}
                onTouchStart={(event) => {
                  if (isSortMode) {
                    handleTouchSortStart(row.id, event.touches[0].clientY);
                    return;
                  }
                  const touch = event.touches[0];
                  handleTouchSwipeStart(row.id, touch.clientX);
                }}
              >
                <div className="currency-main">
                  <div className="currency-top">
                    <label className="code-field">
                      <select
                        disabled={isSortMode}
                        value={row.code}
                        onChange={(event) => updateCurrency(row.id, event.target.value)}
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {getCurrencyFlag(currency.code)} {currency.code}
                          </option>
                        ))}
                      </select>
                    </label>

                    <input
                      className={`amount-input ${replaceArmedRowId === row.id ? "replace-armed" : ""}`}
                      disabled={isSortMode}
                      inputMode="decimal"
                      onBlur={() => {
                        if (replaceArmedRowId === row.id) {
                          setReplaceArmedRowId(null);
                        }
                      }}
                      onChange={(event) => updateAmount(row.id, event.target.value)}
                      onFocus={(event) => armReplaceMode(row.id, row.amount, event.currentTarget)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      onMouseUp={(event) => {
                        if (replaceArmedRowId === row.id) {
                          event.preventDefault();
                          event.currentTarget.select();
                        }
                      }}
                      placeholder="0"
                      type="number"
                      value={row.amount}
                    />
                  </div>
                  <div className="currency-bottom">
                    <span className="currency-meta">
                      {getLocalizedCurrencyName(
                        row.code,
                        currencyMap.get(row.code)?.name ?? row.code,
                        language
                      )}
                    </span>
                    <span className="rate-note">{getRateNote(row.id, row.code)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <footer className="site-footer">
        <div className="support-callout">
          <p>{copy.supportText}</p>
          <a className="support-link" href={SUPPORT_URL} rel="noreferrer" target="_blank">
            <span aria-hidden="true">☕</span>
            <span>{copy.supportButton}</span>
          </a>
        </div>
        <p>
          {copy.footerCreatedPrefix}
          <a href="https://github.com/zy2lfh/FastEx" rel="noreferrer" target="_blank">
            zy2lfh
          </a>
          {copy.footerCreatedSuffix}
        </p>
        <p>
          {copy.footerDataPrefix}
          <a href="https://www.frankfurter.app/" rel="noreferrer" target="_blank">
            Frankfurter
          </a>
          {copy.footerDataSuffix}
        </p>
        <p>{copy.footerVerify}</p>
      </footer>
    </main>
  );
}

export default App;
