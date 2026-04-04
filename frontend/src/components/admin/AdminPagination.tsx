'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface AdminPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  itemLabel?: string;
  pageSizeOptions?: number[];
}

function buildPages(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 1; p <= page + 1; p += 1) {
    if (p > 1 && p < totalPages) {
      pages.add(p);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function AdminPagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  itemLabel = 'items',
  pageSizeOptions = [10, 20, 30, 50],
}: AdminPaginationProps) {
  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);

  const start = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(total, safePage * limit);
  const pages = buildPages(safePage, safeTotalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>
          Showing <span className="font-semibold text-slate-900">{start}-{end}</span> of{' '}
          <span className="font-semibold text-slate-900">{total}</span> {itemLabel}
        </span>
        {onLimitChange && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-500">
            Rows
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange(Number(value))}
              options={pageSizeOptions.map((option) => ({
                value: String(option),
                label: String(option),
              }))}
              className="w-20"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showGap = idx > 0 && prev !== undefined && p - prev > 1;
          return (
            <div key={p} className="flex items-center gap-1.5">
              {showGap && <span className="px-1 text-xs text-slate-300">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-colors ${
                  p === safePage
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {p}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={safePage >= safeTotalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
