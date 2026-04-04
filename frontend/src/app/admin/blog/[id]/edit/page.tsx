'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { CloudinaryUpload } from '@/components/admin/CloudinaryUpload';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

const BLOG_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    status: 'draft',
    images: [] as { url: string; alt: string }[],
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';

    adminApi
      .getBlogPostById(token, id as string)
      .then((post) => {
        setForm({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          tags: (post.tags || []).join(', '),
          status: post.status || 'draft',
          images: post.thumbnail ? [{ url: post.thumbnail, alt: post.title || '' }] : [],
        });
      })
      .catch(() => router.push('/admin/blog'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.updateBlogPost(token, id as string, {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
        status: form.status,
        thumbnail: form.images[0]?.url || '',
      });
      router.push('/admin/blog');
    } catch (err: any) {
      alert(err.message || 'Failed to update post');
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
        <Link href="/admin/blog" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Blog Post</h1>
          <p className="text-slate-500 text-sm mt-0.5">Update article content and status.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={18} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none font-mono" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <CloudinaryUpload images={form.images} onChange={(images) => setForm({ ...form, images })} label="Featured Image" max={1} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
                options={BLOG_STATUS_OPTIONS}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} variant="adminPrimary" size="lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button asChild variant="adminSoft" size="lg">
            <Link href="/admin/blog">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
