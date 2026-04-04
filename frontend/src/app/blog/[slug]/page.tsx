'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Calendar, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { PageLoading } from '@/components/ui/Skeletons';
import { getAdminPreviewDraft } from '@/lib/admin-preview';

export default function BlogPostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isPreview = searchParams.get('preview') === '1';

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    if (isPreview) {
      const previewDraft = getAdminPreviewDraft<any>('blog');
      if (previewDraft && previewDraft.slug === slug) {
        setPost({
          ...previewDraft,
          title: previewDraft.title || 'Preview Blog Post',
          excerpt: previewDraft.excerpt || '',
          content: previewDraft.content || '',
          tags: previewDraft.tags || [],
          thumbnail: previewDraft.thumbnail || '',
          createdAt: previewDraft.createdAt || new Date().toISOString(),
          publishedAt: previewDraft.publishedAt || new Date().toISOString(),
          authorId: {
            firstName: 'Preview',
          },
        });
        setLoading(false);
        return;
      }
    }

    api.getBlogPostBySlug(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [isPreview, slug]);

  if (loading) return <PageLoading text="Loading article..." />;
  if (!post) return (
    <div className="pt-32 pb-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Article not found</h1>
      <Link href="/blog" className="btn-secondary">Back to Blog</Link>
    </div>
  );

  return (
    <>
      <section className="pt-24 pb-4 bg-white border-b border-stone-100">
        <div className="container-custom">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </section>

      <article className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 text-sm text-stone-500 mb-4">
                <Calendar className="w-4 h-4" /> 
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                <span className="text-stone-300">|</span>
                <span>By {post.authorId?.firstName || 'Admin'}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-stone-900 mb-6 leading-tight">{post.title}</h1>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map((t: string) => (
                    <span key={t} className="px-3 py-1 bg-stone-100 text-stone-600 text-sm uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {post.thumbnail && (
              <div className="aspect-video bg-stone-200 overflow-hidden mb-10">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${post.thumbnail}')` }} />
              </div>
            )}

            {post.content && (
              <div
                className="prose prose-stone prose-lg max-w-none
                           prose-headings:font-display prose-headings:text-stone-900
                           prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                           prose-p:text-stone-600 prose-p:leading-relaxed
                           prose-strong:text-stone-900
                           prose-a:text-accent-gold prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            <div className="mt-14 p-8 bg-stone-50 text-center">
              <h3 className="font-display text-2xl text-stone-900 mb-3">Ready to Choose Your Stone?</h3>
              <p className="text-stone-500 mb-6">Visit our showroom to see our full range in person.</p>
              <Link href="/showroom" className="btn-gold">Visit Showroom</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
