'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { BlogPost } from '@/types';
import { BlogCard } from '@/components/blog/BlogCard';

type SortMode = 'newest' | 'oldest' | 'read-time';

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().trim();
}

interface BlogListClientProps {
  initialPosts: BlogPost[];
}

export function BlogListClient({ initialPosts }: BlogListClientProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const categories = useMemo(() => {
    const values = new Set<string>();
    initialPosts.forEach((post) => {
      if (post.category?.trim()) values.add(post.category.trim());
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    const searchValue = normalizeSearchValue(search);
    const bySearch = initialPosts.filter((post) => {
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
  }, [categoryFilter, initialPosts, search, sortMode]);

  const hasActiveFilter =
    search.trim().length > 0 || categoryFilter !== 'all' || sortMode !== 'newest';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSortMode('newest');
  };

  return (
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

        {filteredPosts.length === 0 ? (
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
  );
}
