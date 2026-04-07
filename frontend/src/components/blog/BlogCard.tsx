'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock3 } from 'lucide-react';
import type { BlogPost } from '@/types';
import { cn } from '@/lib/utils';
import { shouldUnoptimizeImage } from '@/lib/image';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  compact?: boolean;
}

function getPostCover(post: BlogPost): string {
  if (post.featuredImage) return post.featuredImage;
  if (post.thumbnail) return post.thumbnail;
  if (Array.isArray(post.images) && post.images.length > 0) return post.images[0];
  return '';
}

export function BlogCard({ post, index = 0, compact = false }: BlogCardProps) {
  const coverUrl = getPostCover(post);
  const dateValue = new Date(post.publishedAt || post.createdAt);
  const readTime = Math.max(1, Number(post.readTime || 0));

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-gold/60 hover:shadow-xl"
      >
        <div className={cn('relative overflow-hidden bg-stone-200', compact ? 'aspect-[16/9]' : 'aspect-[16/10]')}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={post.title}
              fill
              sizes={compact ? '(min-width: 1024px) 33vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized={shouldUnoptimizeImage(coverUrl)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-900 to-stone-700 p-8 text-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-200">
              {post.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            {post.category && (
              <span className="rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white">
                {post.category}
              </span>
            )}
            {readTime > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white">
                <Clock3 className="h-3 w-3" />
                {readTime} min
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-stone-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {dateValue.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <h2 className="mb-3 line-clamp-2 font-display text-xl leading-tight text-stone-900 transition-colors group-hover:text-accent-gold-dark">
            {post.title}
          </h2>

          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
            {post.excerpt}
          </p>

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-stone-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-stone-900 transition-colors group-hover:text-accent-gold-dark">
            Read more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
