'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogPost } from '@/types';
import { BlogCardSkeleton } from '@/components/ui/Skeletons';
import { BlogCard } from '@/components/blog/BlogCard';

type SortMode = 'newest' | 'oldest' | 'read-time';

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().trim();
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    api
      .getBlogPosts({ limit: '60' })
      .then((res) => setPosts((res.data || []) as BlogPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    posts.forEach((post) => {
      if (post.category?.trim()) values.add(post.category.trim());
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const searchValue = normalizeSearchValue(search);
    const bySearch = posts.filter((post) => {
      if (!searchValue) return true;
      const textBlock = [post.title, post.excerpt, ...(post.tags || [])]
        .join(' ')
        .toLowerCase();
      return textBlock.includes(searchValue);
    });

    const byCategory = bySearch.filter((post) => {
      if (categoryFilter === 'all') return true;
      return (post.category || '').toLowerCase() === categoryFilter.toLowerCase();
    });

    const sorted = [...byCategory].sort((left, right) => {
      const leftDate = new Date(left.publishedAt || left.createdAt).getTime();
      const rightDate = new Date(right.publishedAt || right.createdAt).getTime();
      const leftReadTime = Number(left.readTime || 0);
      const rightReadTime = Number(right.readTime || 0);

      if (sortMode === 'oldest') return leftDate - rightDate;
      if (sortMode === 'read-time') {
        if (rightReadTime !== leftReadTime) return rightReadTime - leftReadTime;
      }
      return rightDate - leftDate;
    });

    return sorted;
  }, [categoryFilter, posts, search, sortMode]);

  const hasActiveFilter =
    search.trim().length > 0 || categoryFilter !== 'all' || sortMode !== 'newest';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSortMode('newest');
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-800 bg-stone-900 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.24),_transparent_44%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_40%)]" />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-accent-gold">
              Stone Insights
            </span>
            <h1 className="mt-4 mb-4 font-display text-display-sm text-white md:text-display">
              Blog & News
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
              Practical renovation guidance, material comparisons, and real-world stone benchtop advice curated for Australian homeowners.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                {posts.length} articles
              </span>
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                {categories.length} categories
              </span>
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                Updated weekly
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="mb-10 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-5"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
              <label className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-stone-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, topic, or tags"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-900"
                />
              </label>

              <label className="relative flex items-center">
                <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4 text-stone-400" />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white pl-10 pr-8 text-sm text-stone-800 outline-none transition-colors focus:border-stone-900"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-900"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="read-time">Longest read</option>
              </select>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilter}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm">
              <p className="mb-2 font-display text-3xl text-stone-900">No matching articles</p>
              <p className="mx-auto max-w-xl text-stone-500">
                Try a different keyword or reset filters to explore all blog content.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <BlogCard
                  key={post._id || post.slug}
                  post={post}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
