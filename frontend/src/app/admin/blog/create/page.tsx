'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  Eye,
  Loader2,
  Save,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { CloudinaryUpload } from '@/components/admin/CloudinaryUpload';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { openAdminPreview, slugify } from '@/lib/admin-preview';

const BLOG_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

type AIGeneratedData = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  totalTokens: number;
  totalCost: number;
};

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGeneratedData, setAiGeneratedData] = useState<AIGeneratedData | null>(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', tags: '',
    status: 'draft',
    images: [] as { url: string; alt: string }[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      await adminApi.createBlogPost(token, {
        ...form,
        thumbnail: form.images[0]?.url || '',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      router.push('/admin/blog');
    } catch (err: any) { alert(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) { alert('Enter a topic first.'); return; }
    setGeneratingAi(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      if (!token) {
        alert('Please log in again to use AI generation.');
        return;
      }

      const data = await adminApi.generateFullBlogPostAI(token, {
        topic: aiTopic,
      });

      setAiGeneratedData({
        title: data.title || '',
        description: data.description || '',
        content: data.content || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        totalTokens: data.totalTokens || 0,
        totalCost: data.totalCost || 0,
      });
    } catch (err: any) {
      alert(err?.message || 'AI generation failed.');
    }
    finally { setGeneratingAi(false); }
  };

  const handleApplyAi = (field: 'title' | 'excerpt' | 'content' | 'tags' | 'all') => {
    if (!aiGeneratedData) return;

    if (field === 'all') {
      setForm((prev) => ({
        ...prev,
        title: aiGeneratedData.title || prev.title,
        excerpt: aiGeneratedData.description || prev.excerpt,
        content: aiGeneratedData.content || prev.content,
        tags: aiGeneratedData.tags.length > 0 ? aiGeneratedData.tags.join(', ') : prev.tags,
      }));
      return;
    }

    if (field === 'title') {
      setForm((prev) => ({ ...prev, title: aiGeneratedData.title || prev.title }));
      return;
    }

    if (field === 'excerpt') {
      setForm((prev) => ({
        ...prev,
        excerpt: aiGeneratedData.description || prev.excerpt,
      }));
      return;
    }

    if (field === 'content') {
      setForm((prev) => ({
        ...prev,
        content: aiGeneratedData.content || prev.content,
      }));
      return;
    }

    if (field === 'tags') {
      setForm((prev) => ({
        ...prev,
        tags: aiGeneratedData.tags.length > 0 ? aiGeneratedData.tags.join(', ') : prev.tags,
      }));
    }
  };

  const handlePreview = () => {
    const previewSlug = slugify(form.title, 'preview-blog');
    openAdminPreview(`/blog/${previewSlug}`, 'blog', {
      slug: previewSlug,
      title: form.title || 'Preview Blog Post',
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      status: form.status,
      thumbnail: form.images[0]?.url || '',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Blog Post</h1>
          <p className="text-slate-500 text-sm mt-0.5">Write and publish a new article.</p>
        </div>
      </div>

      {/* AI Blog Generator */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/60 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">AI Blog Generator</h3>
        </div>
        <p className="text-sm text-indigo-600/80 mb-4">Enter a topic, generate content, then review and apply fields below.</p>
        <div className="flex gap-3">
          <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g., How to choose kitchen benchtop stone" className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiGenerate(); } }} />
          <Button
            type="button"
            onClick={handleAiGenerate}
            disabled={generatingAi}
            variant="adminPrimary"
            size="lg"
          >
            {generatingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generatingAi ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      {aiGeneratedData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">AI Generated Content Preview</h2>
              <p className="text-sm text-slate-500 mt-1">Review first, then apply each field or apply all at once.</p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Tokens: {aiGeneratedData.totalTokens} | Cost: ${aiGeneratedData.totalCost.toFixed(6)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-medium text-slate-900">Title</h3>
              <Button type="button" variant="adminSoft" size="sm" onClick={() => handleApplyAi('title')}>
                <Check className="w-4 h-4" /> Apply Title
              </Button>
            </div>
            <p className="text-slate-700">{aiGeneratedData.title || '-'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-medium text-slate-900">Excerpt</h3>
              <Button type="button" variant="adminSoft" size="sm" onClick={() => handleApplyAi('excerpt')}>
                <Check className="w-4 h-4" /> Apply Excerpt
              </Button>
            </div>
            <p className="text-slate-700">{aiGeneratedData.description || '-'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-medium text-slate-900">Tags</h3>
              <Button type="button" variant="adminSoft" size="sm" onClick={() => handleApplyAi('tags')}>
                <Check className="w-4 h-4" /> Apply Tags
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiGeneratedData.tags.length > 0 ? (
                aiGeneratedData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No tags generated.</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-medium text-slate-900">Content</h3>
              <Button type="button" variant="adminSoft" size="sm" onClick={() => handleApplyAi('content')}>
                <Check className="w-4 h-4" /> Apply Content
              </Button>
            </div>
            <div
              className="blog-prose max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4 max-h-[420px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: aiGeneratedData.content || '<p>No content generated.</p>' }}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="button" variant="adminPrimary" size="lg" onClick={() => handleApplyAi('all')}>
              <Check className="w-4 h-4" /> Apply All
            </Button>
            <Button type="button" variant="adminSoft" size="lg" onClick={() => setAiGeneratedData(null)}>
              <X className="w-4 h-4" /> Clear Preview
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Post title" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} placeholder="Short preview text..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Content *</label>
            <textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={18} placeholder="Write your article content here (HTML supported)..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none font-mono" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <CloudinaryUpload images={form.images} onChange={images => setForm({...form, images})} label="Featured Image" max={1} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="guide, kitchen, tips" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
                options={BLOG_STATUS_OPTIONS}
                className="w-full"
              /></div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handlePreview} variant="adminSoft" size="lg">
            <Eye className="w-4 h-4" /> Preview on Website
          </Button>
          <Button type="submit" disabled={loading} variant="adminPrimary" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {loading ? 'Saving...' : 'Create Post'}
          </Button>
          <Button asChild variant="adminSoft" size="lg">
            <Link href="/admin/blog">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
