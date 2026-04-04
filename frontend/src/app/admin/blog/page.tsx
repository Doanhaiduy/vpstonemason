'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Eye,
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

type BlogStatusFilter = 'all' | 'draft' | 'published';

const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
};

const BLOG_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Sort: Newest' },
  { value: 'createdAt', label: 'Sort: Oldest' },
  { value: '-publishedAt', label: 'Sort: Recently Published' },
  { value: 'title', label: 'Sort: Title A-Z' },
  { value: '-title', label: 'Sort: Title Z-A' },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogStatusFilter>('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchPosts = useCallback(
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

      if (search.trim()) {
        params.search = search.trim();
      }

      try {
        const res = await adminApi.getBlogPosts(token, params);
        const nextPagination = res.pagination || INITIAL_PAGINATION;

        if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
          setPage(nextPagination.totalPages);
          return;
        }

        setPosts(res.data || []);
        setPagination({
          page: nextPagination.page || targetPage,
          limit: nextPagination.limit || limit,
          total: nextPagination.total || 0,
          totalPages: Math.max(1, nextPagination.totalPages || 1),
        });
      } catch {
        setPosts([]);
        setPagination(INITIAL_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [limit, page, search, sortBy, statusFilter],
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
    void fetchPosts(page);
  }, [fetchPosts, page, reloadKey]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.deleteBlogPost(token, id);
      if (posts.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch {
      alert('Failed');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
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
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage content with stronger filtering across status and search terms.
            </p>
          </div>
          <Button asChild variant="adminPrimary" size="lg">
            <Link href="/admin/blog/create">
              <Plus className="h-4 w-4" /> New Post
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
              placeholder="Search by title, content, tags..."
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
          {(['all', 'draft', 'published'] as BlogStatusFilter[]).map((status) => (
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
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={BLOG_SORT_OPTIONS}
            size="sm"
            className="w-[220px]"
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
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Tags
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
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    No posts found
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post._id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="max-w-xs truncate px-6 py-4 text-sm font-medium text-slate-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          post.status === 'published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-AU')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.slug && (
                          <Button
                            asChild
                            variant="adminSoft"
                            size="icon"
                          >
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="adminSoft"
                          size="icon"
                        >
                          <Link href={`/admin/blog/${post._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          onClick={() => handleDelete(post._id, post.title)}
                          variant="adminDanger"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
        itemLabel="posts"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
