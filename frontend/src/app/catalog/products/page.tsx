'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Select } from '@/components/ui/Select';
import { CatalogLoading } from '@/components/catalog/CatalogLoading';
import { CatalogError } from '@/components/catalog/CatalogError';
import { shouldUnoptimizeImage } from '@/lib/image';
import type { CatalogProductsResponse } from '@/types/catalog';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Order' },
  { value: 'newest', label: 'Newest First' },
  { value: 'title-asc', label: 'A to Z' },
  { value: 'title-desc', label: 'Z to A' },
];

const PER_PAGE_OPTIONS = [
  { value: '12', label: '12 / page' },
  { value: '24', label: '24 / page' },
  { value: '36', label: '36 / page' },
];

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export default function CatalogProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      range: searchParams.get('range') || '',
      finish: searchParams.get('finish') || '',
      sort: searchParams.get('sort') || 'featured',
      page: toPositiveInt(searchParams.get('page'), 1),
      limit: toPositiveInt(searchParams.get('limit'), 12),
    }),
    [searchParams],
  );

  const [data, setData] = useState<CatalogProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState(params.search);

  const updateQuery = useCallback(
    (
      updates: Record<string, string | undefined>,
      options?: { resetPage?: boolean },
    ) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      if (options?.resetPage !== false && !Object.prototype.hasOwnProperty.call(updates, 'page')) {
        next.set('page', '1');
      }

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const query: Record<string, string> = {
        sort: params.sort,
        page: String(params.page),
        limit: String(params.limit),
      };

      if (params.search) query.search = params.search;
      if (params.category) query.category = params.category;
      if (params.range) query.range = params.range;
      if (params.finish) query.finish = params.finish;

      const response = await api.getCatalogProducts(query);
      setData(response);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params.category, params.finish, params.limit, params.page, params.range, params.search, params.sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(params.search);
  }, [params.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalizedInput = searchInput.trim();
      if (normalizedInput === params.search) return;

      updateQuery(
        {
          search: normalizedInput || undefined,
        },
        { resetPage: true },
      );
    }, 420);

    return () => window.clearTimeout(timer);
  }, [params.search, searchInput, updateQuery]);

  const categoryOptions = useMemo(() => {
    const dynamic = (data?.filters.categories || []).map((option) => ({
      value: option.value,
      label: `${option.label} (${option.count})`,
    }));

    return [{ value: 'all', label: 'All collections' }, ...dynamic];
  }, [data?.filters.categories]);

  const rangeOptions = useMemo(() => {
    const dynamic = (data?.filters.ranges || []).map((option) => ({
      value: option.value,
      label: `${option.label} (${option.count})`,
    }));

    return [{ value: 'all', label: 'All ranges' }, ...dynamic];
  }, [data?.filters.ranges]);

  const finishOptions = useMemo(() => {
    const dynamic = (data?.filters.finishes || []).map((option) => ({
      value: option.value,
      label: `${option.label} (${option.count})`,
    }));

    return [{ value: 'all', label: 'All finishes' }, ...dynamic];
  }, [data?.filters.finishes]);

  const total = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;
  const currentPage = data?.pagination.page || 1;
  const products = data?.data || [];

  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const activeFilterCount = [
    Boolean(params.search),
    Boolean(params.category),
    Boolean(params.range),
    Boolean(params.finish),
  ].filter(Boolean).length;

  if (loading) return <CatalogLoading />;
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32">
        <CatalogError onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <>
      <section className="relative pt-32 pb-16 md:pb-20 bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(201,169,110,0.35), transparent 45%), radial-gradient(circle at 80% 50%, rgba(201,169,110,0.15), transparent 42%)',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-accent-gold text-xs font-semibold tracking-[0.24em] uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              All Products
            </span>
            <h1 className="font-display text-4xl md:text-display-sm text-white max-w-3xl leading-tight">
              Browse the full product catalogue in one place
            </h1>
            <p className="text-white/65 text-lg mt-4 max-w-2xl">
              Filter by collection, range, finish, and search keywords. No more intermediate clicks.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-stone-50 py-8 border-y border-stone-200/70">
        <div className="container-custom">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="inline-flex items-center gap-2 text-sm text-stone-700">
                <SlidersHorizontal className="w-4 h-4 text-accent-gold" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-accent-gold/15 text-accent-gold text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateQuery(
                    {
                      search: undefined,
                      category: undefined,
                      range: undefined,
                      finish: undefined,
                      sort: 'featured',
                      limit: '12',
                    },
                    { resetPage: true },
                  )
                }
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <div className="xl:col-span-2 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by product, SKU, or keyword"
                  className="input-field pl-9 h-10"
                />
              </div>

              <Select
                value={params.category || 'all'}
                onValueChange={(value) =>
                  updateQuery(
                    {
                      category: value === 'all' ? undefined : value,
                      range: undefined,
                    },
                    { resetPage: true },
                  )
                }
                options={categoryOptions}
                variant="client"
                size="md"
              />

              <Select
                value={params.range || 'all'}
                onValueChange={(value) =>
                  updateQuery(
                    {
                      range: value === 'all' ? undefined : value,
                    },
                    { resetPage: true },
                  )
                }
                options={rangeOptions}
                variant="client"
                size="md"
              />

              <Select
                value={params.finish || 'all'}
                onValueChange={(value) =>
                  updateQuery(
                    {
                      finish: value === 'all' ? undefined : value,
                    },
                    { resetPage: true },
                  )
                }
                options={finishOptions}
                variant="client"
                size="md"
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={params.sort}
                  onValueChange={(value) =>
                    updateQuery(
                      {
                        sort: value,
                      },
                      { resetPage: true },
                    )
                  }
                  options={SORT_OPTIONS}
                  variant="client"
                  size="md"
                />
                <Select
                  value={String(params.limit)}
                  onValueChange={(value) =>
                    updateQuery(
                      {
                        limit: value,
                      },
                      { resetPage: true },
                    )
                  }
                  options={PER_PAGE_OPTIONS}
                  variant="client"
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-white">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <p className="text-stone-600 text-sm md:text-base">
              Showing <span className="font-semibold text-stone-900">{products.length}</span> of{' '}
              <span className="font-semibold text-stone-900">{total}</span> products
            </p>
            <p className="text-stone-500 text-sm">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-stone-300 bg-stone-50 rounded-2xl p-10 text-center">
              <h2 className="font-display text-2xl text-stone-900 mb-2">No products found</h2>
              <p className="text-stone-500 mb-5">
                Try a different combination of filters or clear the search keyword.
              </p>
              <button
                type="button"
                onClick={() =>
                  updateQuery(
                    {
                      search: undefined,
                      category: undefined,
                      range: undefined,
                      finish: undefined,
                    },
                    { resetPage: true },
                  )
                }
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {products.map((product, index) => {
                const cardImage = product.imageItem || product.imageMain || product.imageDetail;

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.24) }}
                    className="group border border-stone-200 bg-white overflow-hidden hover:shadow-xl hover:shadow-stone-900/10 transition-all duration-300"
                  >
                    <Link href={`/catalog/${product.categorySlug}/${product.rangeSlug}/${product.slug}`}>
                      <div className="aspect-[3/4] bg-stone-100 overflow-hidden relative">
                        {cardImage ? (
                          <Image
                            src={cardImage}
                            alt={product.title}
                            fill
                            sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized={shouldUnoptimizeImage(cardImage)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
                            No image
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase bg-stone-900/80 text-white">
                            {product.categoryTitle}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">
                          {product.rangeTitle}
                        </p>
                        <h3 className="font-display text-xl text-stone-900 leading-tight mb-3 line-clamp-2">
                          {product.title}
                        </h3>

                        {product.finish && (
                          <p className="text-xs text-stone-500 mb-3">
                            Finish: <span className="text-stone-800 font-medium">{product.finish}</span>
                          </p>
                        )}

                        <span className="inline-flex items-center text-sm font-medium text-accent-gold group-hover:text-accent-gold-dark transition-colors">
                          View details
                          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {products.length > 0 && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  updateQuery(
                    {
                      page: String(Math.max(1, currentPage - 1)),
                    },
                    { resetPage: false },
                  )
                }
                className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-stone-300 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-stone-900 hover:text-stone-900"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {visiblePageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() =>
                    updateQuery(
                      {
                        page: String(pageNumber),
                      },
                      { resetPage: false },
                    )
                  }
                  className={`min-w-10 px-3 py-2 text-sm border transition-colors ${
                    pageNumber === currentPage
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  updateQuery(
                    {
                      page: String(Math.min(totalPages, currentPage + 1)),
                    },
                    { resetPage: false },
                  )
                }
                className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-stone-300 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-stone-900 hover:text-stone-900"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
