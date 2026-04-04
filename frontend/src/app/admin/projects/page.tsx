'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Loader2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

type StatusFilter = 'all' | 'active' | 'inactive';
type FeaturedFilter = 'all' | 'featured' | 'normal';

const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
};

const PROJECT_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Sort: Newest' },
  { value: 'createdAt', label: 'Sort: Oldest' },
  { value: 'name', label: 'Sort: Name A-Z' },
  { value: '-name', label: 'Sort: Name Z-A' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchProjects = useCallback(
    async (targetPage: number = page) => {
      const token = localStorage.getItem('accessToken') || '';
      const params: Record<string, string> = {
        page: String(targetPage),
        limit: String(limit),
        sort: sortBy,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter === 'active') {
        params.isActive = 'true';
      } else if (statusFilter === 'inactive') {
        params.isActive = 'false';
      }

      if (featuredFilter === 'featured') {
        params.isFeatured = 'true';
      } else if (featuredFilter === 'normal') {
        params.isFeatured = 'false';
      }

      try {
        const res = await adminApi.getProjects(token, params);
        const nextPagination = res.pagination || INITIAL_PAGINATION;

        if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
          setPage(nextPagination.totalPages);
          return;
        }

        setProjects(res.data || []);
        setPagination({
          page: nextPagination.page || targetPage,
          limit: nextPagination.limit || limit,
          total: nextPagination.total || 0,
          totalPages: Math.max(1, nextPagination.totalPages || 1),
        });
      } catch {
        setProjects([]);
        setPagination(INITIAL_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [featuredFilter, limit, page, search, sortBy, statusFilter],
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
    void fetchProjects(page);
  }, [fetchProjects, page, reloadKey]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.deleteProject(token, id);
      if (projects.length === 1 && page > 1) {
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
    setFeaturedFilter('all');
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
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse projects with advanced filters by status, featured state and keywords.
            </p>
          </div>
          <Button asChild variant="adminPrimary" size="lg">
            <Link href="/admin/projects/create">
              <Plus className="h-4 w-4" /> Add Project
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
              placeholder="Search by project name, suburb, state..."
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
            value={featuredFilter}
            onValueChange={(value) => {
              setFeaturedFilter(value as FeaturedFilter);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Featured States' },
              { value: 'featured', label: 'Featured Only' },
              { value: 'normal', label: 'Non-featured Only' },
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
            options={PROJECT_SORT_OPTIONS}
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
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Stone
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Featured
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {typeof project.location === 'string'
                          ? project.location
                          : [project.location?.suburb, project.location?.state]
                              .filter(Boolean)
                              .join(', ') || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {project.stoneIds?.[0]?.title || project.stoneIds?.[0]?.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {project.isFeatured ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <span className="text-xs text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="adminSoft"
                          size="icon"
                        >
                          <Link href={`/admin/projects/${project._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          onClick={() => handleDelete(project._id, project.name)}
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
        itemLabel="projects"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
