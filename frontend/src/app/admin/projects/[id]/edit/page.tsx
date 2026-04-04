'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { CloudinaryUpload } from '@/components/admin/CloudinaryUpload';

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    locationSuburb: '',
    locationState: '',
    applicationType: [] as string[],
    stoneIds: [] as string[],
    isFeatured: false,
    isActive: true,
    images: [] as { url: string; alt: string }[],
  });

  const typeOptions = ['Kitchen', 'Bathroom', 'Vanity', 'Splashback', 'Laundry', 'Outdoor'];

  const toggleType = (value: string) => {
    setForm((prev) => ({
      ...prev,
      applicationType: prev.applicationType.includes(value)
        ? prev.applicationType.filter((item) => item !== value)
        : [...prev.applicationType, value],
    }));
  };

  const toggleStone = (stoneId: string) => {
    setForm((prev) => ({
      ...prev,
      stoneIds: prev.stoneIds.includes(stoneId)
        ? prev.stoneIds.filter((item) => item !== stoneId)
        : [...prev.stoneIds, stoneId],
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';

    Promise.all([
      adminApi
        .getCatalogItems(token, { type: 'product', limit: '600', sort: 'displayOrder' })
        .catch(() => ({ data: [] })),
      adminApi.getProjectById(token, id as string),
    ])
      .then(([productsRes, project]) => {
        setProducts((productsRes as any).data || []);
        setForm({
          name: project.name || '',
          description: project.description || '',
          locationSuburb: project.location?.suburb || '',
          locationState: project.location?.state || '',
          applicationType: project.applicationType || [],
          stoneIds: (project.stoneIds || []).map((stone: any) => stone._id || stone),
          isFeatured: !!project.isFeatured,
          isActive: project.isActive !== false,
          images: (project.images || []).map((img: any) => ({ url: img.url, alt: img.alt || '' })),
        });
      })
      .catch(() => router.push('/admin/projects'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('accessToken') || '';

    try {
      await adminApi.updateProject(token, id as string, {
        name: form.name,
        description: form.description,
        location: {
          suburb: form.locationSuburb,
          state: form.locationState,
        },
        applicationType: form.applicationType,
        stoneIds: form.stoneIds,
        images: form.images,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      });
      router.push('/admin/projects');
    } catch (err: any) {
      alert(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
          <p className="text-slate-500 text-sm mt-0.5">Update project details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Project Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Suburb *</label>
              <input type="text" required value={form.locationSuburb} onChange={(e) => setForm({ ...form, locationSuburb: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">State *</label>
              <input type="text" required value={form.locationState} onChange={(e) => setForm({ ...form, locationState: e.target.value.toUpperCase() })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div>
          </div>

          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" /></div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Project Type</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => (
                <button key={type} type="button" onClick={() => toggleType(type)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${form.applicationType.includes(type) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Linked Products</label>
            {products.length === 0 ? (
              <p className="text-xs text-slate-500">No products found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                  <button key={product._id} type="button" onClick={() => toggleStone(product._id)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${form.stoneIds.includes(product._id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                    {product.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <CloudinaryUpload images={form.images} onChange={(images) => setForm({ ...form, images })} label="Project Photos" max={12} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" /><span className="text-sm text-slate-700">Active</span></label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" /><span className="text-sm text-slate-700">Featured</span></label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/projects" className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
