'use client';

import { useEffect, useMemo, useState } from 'react';
import { Braces, Plus, Trash2 } from 'lucide-react';

export const DEFAULT_SPEC_KEYS = [
  'Finish',
  'Thickness',
  'Slab Size',
  'Application',
  'Origin',
] as const;

type SpecRow = {
  id: string;
  key: string;
  value: string;
};

interface SpecificationsEditorProps {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

function normalizeSpecs(raw: Record<string, string> | undefined): Record<string, string> {
  const entries = Object.entries(raw || {}).map(([key, value]) => [
    String(key || '').trim(),
    String(value || '').trim(),
  ]);

  const normalized: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!key) continue;
    normalized[key] = value;
  }
  return normalized;
}

function rowsToSpecs(rows: SpecRow[]): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    specs[key] = row.value.trim();
  }
  return specs;
}

function specsToRows(specs: Record<string, string>): SpecRow[] {
  const used = new Set<string>();
  const rows: SpecRow[] = [];

  DEFAULT_SPEC_KEYS.forEach((key, index) => {
    rows.push({
      id: `default-${index}`,
      key,
      value: specs[key] || '',
    });
    used.add(key);
  });

  Object.entries(specs).forEach(([key, value], index) => {
    if (used.has(key)) return;
    rows.push({
      id: `extra-${index}-${key}`,
      key,
      value,
    });
  });

  return rows;
}

export function SpecificationsEditor({ value, onChange }: SpecificationsEditorProps) {
  const normalizedValue = useMemo(() => normalizeSpecs(value), [value]);
  const [mode, setMode] = useState<'ui' | 'json'>('ui');
  const [rows, setRows] = useState<SpecRow[]>(() => specsToRows(normalizedValue));
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(normalizedValue, null, 2),
  );
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    const nextRows = specsToRows(normalizedValue);
    setRows(nextRows);
    setJsonText(JSON.stringify(normalizedValue, null, 2));
  }, [normalizedValue]);

  const updateRows = (nextRows: SpecRow[]) => {
    setRows(nextRows);
    const nextSpecs = rowsToSpecs(nextRows);
    setJsonText(JSON.stringify(nextSpecs, null, 2));
    setJsonError('');

    // Avoid emitting unchanged specs. This keeps local draft rows (like a newly
    // added empty row) from being reset by the parent value sync effect.
    const currentSpecsJson = JSON.stringify(normalizedValue);
    const nextSpecsJson = JSON.stringify(nextSpecs);
    if (currentSpecsJson !== nextSpecsJson) {
      onChange(nextSpecs);
    }
  };

  const updateRow = (id: string, field: 'key' | 'value', nextValue: string) => {
    updateRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: nextValue } : row)),
    );
  };

  const removeRow = (id: string) => {
    updateRows(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    updateRows([
      ...rows,
      {
        id: `manual-${Date.now()}-${rows.length}`,
        key: '',
        value: '',
      },
    ]);
  };

  const onJsonChange = (nextText: string) => {
    setJsonText(nextText);
    try {
      const parsed = JSON.parse(nextText || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('JSON must be an object of key/value pairs.');
        return;
      }
      const nextSpecs = normalizeSpecs(parsed as Record<string, string>);
      setJsonError('');
      setRows(specsToRows(nextSpecs));
      onChange(nextSpecs);
    } catch {
      setJsonError('Invalid JSON format.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700">
          Specifications
        </label>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setMode('ui')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'ui' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            UI Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === 'json'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            JSON Mode
          </button>
        </div>
      </div>

      {mode === 'ui' && (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={row.key}
                onChange={(e) => updateRow(row.id, 'key', e.target.value)}
                placeholder="Specification name"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                placeholder="Value"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Remove specification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Specification
          </button>
          <p className="text-xs text-slate-500">
            5 default fields are pre-filled, and you can add any custom specs.
          </p>
        </div>
      )}

      {mode === 'json' && (
        <div className="space-y-2">
          <div className="relative">
            <Braces className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-300" />
            <textarea
              value={jsonText}
              onChange={(e) => onJsonChange(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm font-mono outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
          {jsonError ? (
            <p className="text-xs font-medium text-red-600">{jsonError}</p>
          ) : (
            <p className="text-xs text-slate-500">Use a plain JSON object of key/value pairs.</p>
          )}
        </div>
      )}
    </div>
  );
}
