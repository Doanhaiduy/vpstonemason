'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  Edit,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { openAdminPreview, slugify } from '@/lib/admin-preview';

type StatusFilter = 'all' | 'active' | 'inactive';

const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
};

const RANGE_SORT_OPTIONS = [
  { value: 'displayOrder', label: 'Sort: Display Order' },
  { value: 'title', label: 'Sort: Title A-Z' },
  { value: '-title', label: 'Sort: Title Z-A' },
  { value: '-createdAt', label: 'Sort: Newest' },
  { value: 'createdAt', label: 'Sort: Oldest' },
];

export default function AdminRangesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [ranges, setRanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageMain, setFormImageMain] = useState('');
  const [formImageItem, setFormImageItem] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || '';
    try {
      const res = await adminApi.getCatalogItems(token, {
        type: 'category',
        limit: '400',
        sort: 'displayOrder',
        includeInactive: 'true',
      });
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchRanges = useCallback(
    async (targetPage: number = page) => {
      const token = localStorage.getItem('accessToken') || '';
      const params: Record<string, string> = {
        type: 'range',
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

      if (categoryFilter !== 'all') {
        params.parentId = categoryFilter;
      }

      try {
        const res = await adminApi.getCatalogItems(token, params);
        const nextPagination = res.pagination || INITIAL_PAGINATION;

        if (nextPagination.totalPages > 0 && targetPage > nextPagination.totalPages) {
          setPage(nextPagination.totalPages);
          return;
        }

        setRanges(res.data || []);
        setPagination({
          page: nextPagination.page || targetPage,
          limit: nextPagination.limit || limit,
          total: nextPagination.total || 0,
          totalPages: Math.max(1, nextPagination.totalPages || 1),
        });
      } catch {
        setRanges([]);
        setPagination(INITIAL_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, limit, page, search, sortBy, statusFilter],
  );

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 320);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    void fetchRanges(page);
  }, [fetchRanges, page, reloadKey]);

  const categoryTitleById = useMemo(() => {
    const entries = categories.map(
      (category): [string, string] => [category._id, category.title],
    );
    return new Map<string, string>(entries);
  }, [categories]);

  const resetForm = () => {
    setEditId(null);
    setFormTitle('');
    setFormCategoryId('');
    setFormDesc('');
    setFormImageMain('');
    setFormImageItem('');
    setFormOrder(0);
    setFormIsActive(true);
  };

  const handleEdit = (range: any) => {
    setEditId(range._id);
    setFormTitle(range.title || '');
    setFormCategoryId(range.parentId?._id || range.parentId || '');
    setFormDesc(range.description || '');
    setFormImageMain(range.imageMain || '');
    setFormImageItem(range.imageItem || '');
    setFormOrder(range.displayOrder || 0);
    setFormIsActive(range.isActive !== false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formCategoryId) {
      alert('Range title and parent category are required.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('accessToken') || '';
    const payload = {
      type: 'range',
      title: formTitle,
      parentId: formCategoryId,
      description: formDesc,
      imageMain: formImageMain,
      imageItem: formImageItem,
      displayOrder: Number(formOrder) || 0,
      isActive: formIsActive,
    };

    try {
      if (editId) {
        await adminApi.updateCatalogItem(token, editId, payload);
      } else {
        await adminApi.createCatalogItem(token, payload);
      }
      setShowForm(false);
      resetForm();
      setPage(1);
      setReloadKey((value) => value + 1);
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete range "${title}"? Delete its products first.`)) return;
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.deleteCatalogItem(token, id);
      if (ranges.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy('displayOrder');
    setLimit(DEFAULT_LIMIT);
    setPage(1);
  };

  const handlePreview = () => {
    if (!formTitle.trim()) {
      alert('Please enter a range title first.');
      return;
    }

    const selectedCategory = categories.find((category) => category._id === formCategoryId);
    if (!selectedCategory?.slug) {
      alert('Please select a parent category first.');
      return;
    }

    const previewSlug = slugify(formTitle, 'preview-range');
    openAdminPreview(
      `/catalog/${selectedCategory.slug}/${previewSlug}`,
      'range',
      {
        slug: previewSlug,
        title: formTitle,
        description: formDesc,
        descriptionItem: '',
        imageMain: formImageMain,
        imageItem: formImageItem,
        imageDetail: formImageMain,
        imageSub: [],
        categoryId: selectedCategory._id,
        categorySlug: selectedCategory.slug,
        categoryTitle: selectedCategory.title,
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ranges</h1>
            <p className="mt-1 text-sm text-slate-600">
              Middle-level catalog groups under each category.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            variant="adminPrimary"
            size="lg"
          >
            <Plus className="h-4 w-4" /> Add Range
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {editId ? 'Edit' : 'New'} Range
          </h2>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Supernatural Collection"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Parent Category *</label>
              <Select
                value={formCategoryId}
                onValueChange={setFormCategoryId}
                placeholder="Select category"
                options={categories.map((category) => ({
                  value: category._id,
                  label: category.title,
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Display Order</label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                placeholder="Short description..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <AdminImageField
                label="Main Image"
                value={formImageMain}
                onChange={setFormImageMain}
                placeholder="https://.../range-main.jpg"
                folder="vpstonemason/catalog/range"
              />
            </div>

            <div>
              <AdminImageField
                label="Card Image"
                value={formImageItem}
                onChange={setFormImageItem}
                placeholder="https://.../range-card.jpg"
                folder="vpstonemason/catalog/range"
              />
            </div>
          </div>

          <label className="mb-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Active (visible on site)</span>
          </label>

          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              variant="adminSoft"
              size="lg"
            >
              <Eye className="h-4 w-4" /> Preview on Website
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="adminPrimary"
              size="lg"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {editId ? 'Update' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              variant="adminSoft"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
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
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            options={RANGE_SORT_OPTIONS}
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
                  Image
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Range
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Order
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
              {ranges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No ranges found
                  </td>
                </tr>
              ) : (
                ranges.map((range) => {
                  const categoryId = range.parentId?._id || range.parentId || '';
                  const categoryTitle =
                    range.parentId?.title || categoryTitleById.get(categoryId) || '—';

                  return (
                    <tr
                      key={range._id}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        {range.imageMain || range.imageItem ? (
                          <div
                            className="h-10 w-10 rounded-lg border border-slate-200 bg-cover bg-center"
                            style={{
                              backgroundImage: `url('${range.imageMain || range.imageItem}')`,
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{range.title}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{range.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{categoryTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{range.displayOrder || 0}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            range.isActive !== false
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {range.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => handleEdit(range)}
                            variant="adminSoft"
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(range._id, range.title)}
                            variant="adminDanger"
                            size="icon"
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
        itemLabel="ranges"
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />
    </div>
  );
}
