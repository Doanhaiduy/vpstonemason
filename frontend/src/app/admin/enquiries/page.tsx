'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

type EnquiryStatus = 'all' | 'new' | 'in_progress' | 'completed' | 'archived';
type EnquirySource = 'all' | 'contact' | 'quote' | 'stone_enquiry' | 'booking';

const statusColors: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600',
  archived: 'bg-slate-50 text-slate-400',
};

const sourceLabels: Record<string, string> = {
  contact: 'Contact Form',
  quote: 'Quote Request',
  stone_enquiry: 'Stone Enquiry',
  booking: 'Booking',
};

const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
};

const ENQUIRY_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Sort: Newest' },
  { value: 'createdAt', label: 'Sort: Oldest' },
  { value: 'name', label: 'Sort: Name A-Z' },
  { value: '-name', label: 'Sort: Name Z-A' },
];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<EnquirySource>('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const fetchEnquiries = useCallback(
    async (targetPage: number = page) => {
      const token = localStorage.getItem('accessToken') || '';
      const params: Record<string, string> = {
        page: String(targetPage),
        limit: String(limit),
        sort: sortBy,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (sourceFilter !== 'all') {
        params.source = sourceFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      try {
        const res = await adminApi.getEnquiries(token, params);
        const nextPagination = res.pagination || INITIAL_PAGINATION;

        if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
          setPage(nextPagination.totalPages);
          return;
        }

        setEnquiries(res.data || []);
        setPagination({
          page: nextPagination.page || targetPage,
          limit: nextPagination.limit || limit,
          total: nextPagination.total || 0,
          totalPages: Math.max(1, nextPagination.totalPages || 1),
        });
      } catch {
        setEnquiries([]);
        setPagination(INITIAL_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [limit, page, search, sortBy, sourceFilter, statusFilter],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 320);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    void fetchEnquiries(page);
  }, [fetchEnquiries, page]);

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setSortBy('-createdAt');
    setLimit(DEFAULT_LIMIT);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review all enquiries with modern filters by status, source and keyword.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, suburb, message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {pagination.total} total
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['all', 'new', 'in_progress', 'completed', 'archived'] as EnquiryStatus[]).map(
            (status) => (
              <Button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                variant={statusFilter === status ? 'adminChipActive' : 'adminChip'}
                size="sm"
              >
                {status.replace('_', ' ')}
              </Button>
            ),
          )}

          <Select
            value={sourceFilter}
            onValueChange={(value) => {
              setSourceFilter(value as EnquirySource);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'contact', label: 'Contact Form' },
              { value: 'quote', label: 'Quote Request' },
              { value: 'stone_enquiry', label: 'Stone Enquiry' },
              { value: 'booking', label: 'Booking' },
            ]}
            size="sm"
            className="w-[180px]"
          />

          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={ENQUIRY_SORT_OPTIONS}
            size="sm"
            className="w-[180px]"
          />

          <Button
            type="button"
            onClick={clearFilters}
            variant="adminSoft"
            size="sm"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Stone
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No enquiries found
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{enquiry.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{enquiry.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">
                        {sourceLabels[enquiry.source] || enquiry.source || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {enquiry.stoneName || enquiry.stoneId?.title || enquiry.stoneId?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          statusColors[enquiry.status] || statusColors.new
                        }`}
                      >
                        {(enquiry.status || 'new').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="adminSoft" size="sm">
                        <Link href={`/admin/enquiries/${enquiry._id}`}>
                          View →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        itemLabel="enquiries"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
