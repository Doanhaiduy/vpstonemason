'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

type StatusFilter = 'all' | 'active' | 'inactive';

const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
};

const PRODUCT_SORT_OPTIONS = [
  { value: 'displayOrder', label: 'Sort: Display Order' },
  { value: 'title', label: 'Sort: Title A-Z' },
  { value: '-title', label: 'Sort: Title Z-A' },
  { value: '-createdAt', label: 'Sort: Newest' },
  { value: 'createdAt', label: 'Sort: Oldest' },
];

function getId(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || '';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ranges, setRanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchLookups = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || '';

    try {
      const [categoryRes, rangeRes] = await Promise.all([
        adminApi.getCatalogItems(token, {
          type: 'category',
          limit: '500',
          sort: 'displayOrder',
          includeInactive: 'true',
        }),
        adminApi.getCatalogItems(token, {
          type: 'range',
          limit: '1000',
          sort: 'displayOrder',
          includeInactive: 'true',
        }),
      ]);

      setCategories(categoryRes.data || []);
      setRanges(rangeRes.data || []);
    } catch {
      setCategories([]);
      setRanges([]);
    }
  }, []);

  const filteredRangeOptions = useMemo(() => {
    if (categoryFilter === 'all') {
      return ranges;
    }

    return ranges.filter((range) => getId(range.parentId) === categoryFilter);
  }, [categoryFilter, ranges]);

  const rangeMetaById = useMemo(() => {
    const categoryTitleById = new Map<string, string>(
      categories.map((category) => [category._id, category.title]),
    );

    const entries = ranges.map((range) => {
      const categoryId = getId(range.parentId);
      const categoryTitle =
        range.parentId?.title || categoryTitleById.get(categoryId) || '-';

      return [
        range._id,
        {
          title: range.title || '-',
          categoryId,
          categoryTitle,
        },
      ] as const;
    });

    return new Map<string, { title: string; categoryId: string; categoryTitle: string }>(
      entries,
    );
  }, [categories, ranges]);

  useEffect(() => {
    if (rangeFilter === 'all') return;

    const isRangeAvailable = filteredRangeOptions.some(
      (range) => range._id === rangeFilter,
    );

    if (!isRangeAvailable) {
      setRangeFilter('all');
      setPage(1);
    }
  }, [filteredRangeOptions, rangeFilter]);

  const fetchProducts = useCallback(
    async (targetPage: number = page) => {
      const token = localStorage.getItem('accessToken') || '';
      const params: Record<string, string> = {
        type: 'product',
        page: String(targetPage),
        limit: String(limit),
        sort: sortBy,
        includeInactive: 'true',
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter === 'active') {
        params.isActive = 'true';
      } else if (statusFilter === 'inactive') {
        params.isActive = 'false';
      }

      if (rangeFilter !== 'all') {
        params.parentId = rangeFilter;
      } else if (categoryFilter !== 'all') {
        params.categoryId = categoryFilter;
      }

      try {
        const res = await adminApi.getCatalogItems(token, params);
        const nextPagination = res.pagination || INITIAL_PAGINATION;

        if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
          setPage(nextPagination.totalPages);
          return;
        }

        setProducts(res.data || []);
        setPagination({
          page: nextPagination.page || targetPage,
          limit: nextPagination.limit || limit,
          total: nextPagination.total || 0,
          totalPages: Math.max(1, nextPagination.totalPages || 1),
        });
      } catch {
        setProducts([]);
        setPagination(INITIAL_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, limit, page, rangeFilter, search, sortBy, statusFilter],
  );

  useEffect(() => {
    void fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 320);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    void fetchProducts(page);
  }, [fetchProducts, page, reloadKey]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete product "${title}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.deleteCatalogItem(token, id);
      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setRangeFilter('all');
    setSortBy('displayOrder');
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
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage products with richer filters across category, range and status.
            </p>
          </div>
          <Button asChild variant="adminPrimary" size="lg">
            <Link href="/admin/stones/create">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, slug or description..."
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
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              variant={statusFilter === status ? 'adminChipActive' : 'adminChip'}
              size="sm"
            >
              {status}
            </Button>
          ))}

          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((category) => ({
                value: category._id,
                label: category.title,
              })),
            ]}
            size="sm"
            className="w-[190px]"
          />

          <Select
            value={rangeFilter}
            onValueChange={(value) => {
              setRangeFilter(value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Ranges' },
              ...filteredRangeOptions.map((range) => ({
                value: range._id,
                label: range.title,
              })),
            ]}
            size="sm"
            className="w-[190px]"
          />

          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={PRODUCT_SORT_OPTIONS}
            size="sm"
            className="w-[190px]"
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Range
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const rangeId = getId(product.parentId);
                  const rangeTitle = product.parentId?.title || rangeMetaById.get(rangeId)?.title || '-';
                  const categoryTitle = rangeMetaById.get(rangeId)?.categoryTitle || '-';
                  const featureCount = Array.isArray(product.features)
                    ? product.features.length
                    : 0;

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageMain ? (
                            <div
                              className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-200 bg-cover bg-center"
                              style={{ backgroundImage: `url('${product.imageMain}')` }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-100" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-slate-900">{product.title}</span>
                            <div className="mt-0.5 text-[11px] text-slate-400">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{rangeTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{categoryTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{featureCount}</td>
                      <td className="px-6 py-4">
                        {product.isActive !== false ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <Eye className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <EyeOff className="h-3.5 w-3.5" /> Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="adminSoft"
                            size="icon"
                          >
                            <Link
                              href={`/admin/stones/${product._id}/edit`}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            onClick={() => handleDelete(product._id, product.title)}
                            variant="adminDanger"
                            size="icon"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        itemLabel="products"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
