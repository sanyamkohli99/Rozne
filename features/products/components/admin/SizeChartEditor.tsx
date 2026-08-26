"use client";

import { Trash2 } from "lucide-react";

export type SizeChartData = {
  headers: string[];
  rows: string[][];
};

const DEFAULT_CHART: SizeChartData = {
  headers: ["Size", "Chest (in)", "Waist (in)", "Hip (in)", "Length (in)"],
  rows: [
    ["XS", "32–34", "24–26", "34–36", "24"],
    ["S", "34–36", "26–28", "36–38", "25"],
    ["M", "36–38", "28–30", "38–40", "26"],
    ["L", "38–40", "30–32", "40–42", "27"],
    ["XL", "40–42", "32–34", "42–44", "28"],
    ["XXL", "42–44", "34–36", "44–46", "29"],
  ],
};

export function parseSizeChart(raw: string | null | undefined): SizeChartData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.headers && parsed.rows) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function serializeSizeChart(chart: SizeChartData): string {
  return JSON.stringify(chart);
}

type Props = {
  value: string | null | undefined;
  onChange: (json: string | null) => void;
};

export function SizeChartEditor({ value, onChange }: Props) {
  const chart = parseSizeChart(value) || DEFAULT_CHART;

  const updateHeader = (idx: number, val: string) => {
    const next = { ...chart, headers: [...chart.headers] };
    next.headers[idx] = val;
    onChange(serializeSizeChart(next));
  };

  const addHeader = () => {
    const next = { ...chart, headers: [...chart.headers, "New Column"], rows: chart.rows.map(r => [...r, ""]) };
    onChange(serializeSizeChart(next));
  };

  const removeHeader = (idx: number) => {
    if (chart.headers.length <= 2) return;
    const next = {
      ...chart,
      headers: chart.headers.filter((_, i) => i !== idx),
      rows: chart.rows.map(r => r.filter((_, i) => i !== idx)),
    };
    onChange(serializeSizeChart(next));
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const next = { ...chart, rows: chart.rows.map((r, ri) => ri === rowIdx ? r.map((c, ci) => ci === colIdx ? val : c) : [...r]) };
    onChange(serializeSizeChart(next));
  };

  const addRow = () => {
    const newRow = chart.headers.map(() => "");
    const next = { ...chart, rows: [...chart.rows, newRow] };
    onChange(serializeSizeChart(next));
  };

  const removeRow = (idx: number) => {
    if (chart.rows.length <= 1) return;
    const next = { ...chart, rows: chart.rows.filter((_, i) => i !== idx) };
    onChange(serializeSizeChart(next));
  };

  const resetToDefault = () => {
    onChange(serializeSizeChart(DEFAULT_CHART));
  };

  const clear = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
        >
          + Row
        </button>
        <button
          type="button"
          onClick={addHeader}
          className="px-3 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
        >
          + Column
        </button>
        <button
          type="button"
          onClick={resetToDefault}
          className="px-3 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={clear}
          className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto border border-zinc-200 rounded-md">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {chart.headers.map((header, i) => (
                <th key={i} className="border border-zinc-200 bg-zinc-50 px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      className="w-full text-xs font-medium text-zinc-700 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    />
                    {chart.headers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeHeader(i)}
                        className="text-zinc-400 hover:text-red-500 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 bg-zinc-50 border border-zinc-200" />
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-zinc-200 px-2 py-1">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-full text-xs bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    />
                  </td>
                ))}
                <td className="border border-zinc-200 px-1 py-1 text-center">
                  {chart.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(ri)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Edit cells directly. Leave a product&apos;s size chart empty to show the default size guide.
      </p>
    </div>
  );
}
