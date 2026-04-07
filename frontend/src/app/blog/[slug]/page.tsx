import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { BlogDetailClient } from '@/components/blog/BlogDetailClient';
import type { BlogPost } from '@/types';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  try {
    const res = await api.getBlogPosts({ limit: '200' });
    const posts = (res.data || []) as BlogPost[];
    return posts
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === '1';
  
  // Wait for post data from the server
  const post = await api.getBlogPostBySlug(params.slug).catch(() => null) as BlogPost | null;

  // If no post and we are NOT in preview mode, respond with HTTP 404
  if (!post && !isPreview) {
    notFound();
  }

  return <BlogDetailClient initialPost={post} slug={params.slug} />;
}
