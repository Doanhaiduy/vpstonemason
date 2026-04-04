'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Eye, Save, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminImageField } from '@/components/admin/AdminImageField';
import { CloudinaryUpload } from '@/components/admin/CloudinaryUpload';
import { SpecificationsEditor } from '@/components/admin/SpecificationsEditor';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { openAdminPreview, slugify } from '@/lib/admin-preview';

const DEFAULT_SPECIFICATIONS: Record<string, string> = {
  Finish: '',
  Thickness: '',
  'Slab Size': '',
  Application: '',
  Origin: '',
};

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [ranges, setRanges] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: '',
    parentId: '',
    description: '',
    descriptionItem: '',
    imageMain: '',
    imageItem: '',
    imageDetail: '',
    imageSubItems: [] as { url: string; alt: string }[],
    featuresText: '',
    specifications: { ...DEFAULT_SPECIFICATIONS } as Record<string, string>,
    sourceUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    Promise.all([
      adminApi
        .getCatalogItems(token, {
          type: 'category',
          limit: '300',
          sort: 'displayOrder',
        })
        .catch(() => ({ data: [] })),
      adminApi
        .getCatalogItems(token, {
          type: 'range',
          limit: '500',
          sort: 'displayOrder',
        })
        .catch(() => ({ data: [] })),
    ]).then(([categoryRes, rangeRes]) => {
      setCategories(categoryRes.data || []);
      setRanges(rangeRes.data || []);
    });
  }, []);

  const rangeOptions = useMemo(() => {
    const categoryMap = new Map<string, string>();
    categories.forEach((category) => {
      categoryMap.set(category._id, category.title);
    });

    return ranges.map((range) => ({
      _id: range._id,
      title: range.title,
      categoryTitle:
        range.parentId?.title || categoryMap.get(range.parentId) || 'Uncategorized',
    }));
  }, [categories, ranges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.parentId) {
      alert('Please select a parent range.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      await adminApi.createCatalogItem(token, {
        type: 'product',
        title: form.title,
        parentId: form.parentId,
        description: form.description,
        descriptionItem: form.descriptionItem,
        imageMain: form.imageMain,
        imageItem: form.imageItem,
        imageDetail: form.imageDetail,
        imageSub: form.imageSubItems
          .map((item) => item.url.trim())
          .filter(Boolean),
        features: splitLines(form.featuresText),
        specifications: form.specifications,
        sourceUrl: form.sourceUrl,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      });
      router.push('/admin/stones');
    } catch (err: any) {
      alert(err.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!form.title.trim()) {
      alert('Please enter a product title first.');
      return;
    }

    const selectedRange = ranges.find((range) => range._id === form.parentId);
    const selectedCategoryId =
      selectedRange?.parentId?._id || selectedRange?.parentId || '';
    const selectedCategory = categories.find(
      (category) => category._id === selectedCategoryId,
    );

    if (!selectedRange?.slug || !selectedCategory?.slug) {
      alert('Please select a valid parent range first.');
      return;
    }

    const previewSlug = slugify(form.title, 'preview-product');
    openAdminPreview(
      `/catalog/${selectedCategory.slug}/${selectedRange.slug}/${previewSlug}`,
      'product',
      {
        slug: previewSlug,
        title: form.title,
        description: form.description,
        descriptionItem: form.descriptionItem,
        imageMain: form.imageMain,
        imageItem: form.imageItem,
        imageDetail: form.imageDetail,
        imageSub: form.imageSubItems.map((item) => item.url).filter(Boolean),
        features: splitLines(form.featuresText),
        specifications: form.specifications,
        sourceUrl: form.sourceUrl,
        displayOrder: form.displayOrder,
        categoryTitle: selectedCategory.title,
        categorySlug: selectedCategory.slug,
        categoryId: selectedCategory._id,
        rangeTitle: selectedRange.title,
        rangeSlug: selectedRange.slug,
        rangeId: selectedRange._id,
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/stones"
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Create a product under an existing range.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Marble White"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Parent Range *
              </label>
              <Select
                value={form.parentId}
                onValueChange={(value) => setForm({ ...form, parentId: value })}
                options={rangeOptions.map((range) => ({
                  value: range._id,
                  label: `${range.categoryTitle} / ${range.title}`,
                }))}
                placeholder="Select range"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: Number(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Source URL
              </label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Short Description Item
            </label>
            <textarea
              value={form.descriptionItem}
              onChange={(e) =>
                setForm({ ...form, descriptionItem: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminImageField
              label="Main Image"
              value={form.imageMain}
              onChange={(next) => setForm({ ...form, imageMain: next })}
              placeholder="https://.../product-main.jpg"
              folder="vpstonemason/catalog/product"
            />
            <AdminImageField
              label="Item Image"
              value={form.imageItem}
              onChange={(next) => setForm({ ...form, imageItem: next })}
              placeholder="https://.../product-item.jpg"
              folder="vpstonemason/catalog/product"
            />
            <AdminImageField
              label="Detail Image"
              value={form.imageDetail}
              onChange={(next) => setForm({ ...form, imageDetail: next })}
              placeholder="https://.../product-detail.jpg"
              folder="vpstonemason/catalog/product"
            />
          </div>

          <CloudinaryUpload
            images={form.imageSubItems}
            onChange={(next) => setForm({ ...form, imageSubItems: next })}
            max={10}
            label="Additional Images"
            folder="vpstonemason/catalog/product"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Features & Specifications
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Features (one per line)
            </label>
            <textarea
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          <SpecificationsEditor
            value={form.specifications}
            onChange={(next) => setForm({ ...form, specifications: next })}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Active (visible on site)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handlePreview} variant="adminSoft" size="lg">
            <Eye className="w-4 h-4" /> Preview on Website
          </Button>
          <Button type="submit" disabled={loading} variant="adminPrimary" size="lg">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}{' '}
            {loading ? 'Saving...' : 'Create Product'}
          </Button>
          <Button asChild variant="adminSoft" size="lg">
            <Link href="/admin/stones">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
