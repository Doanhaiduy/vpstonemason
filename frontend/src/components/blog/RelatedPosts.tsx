'use client';

import { Sparkles } from 'lucide-react';
import type { BlogPost } from '@/types';
import { BlogCard } from '@/components/blog/BlogCard';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-stone-200 pt-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-accent-gold-dark">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="font-display text-3xl text-stone-900">Related Articles</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post._id || post.slug} post={post} index={index} compact />
        ))}
      </div>
    </section>
  );
}
