'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { BlogCardSkeleton } from '@/components/ui/Skeletons';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBlogPosts()
      .then((res) => setPosts(res.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Insights</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">Blog & News</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">Tips, trends, and expert advice for your stone benchtop project.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article key={post.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blog/${post.slug}`} className="group block card-hover bg-white h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden">
                      <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${post.thumbnail || ''}')` }} />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {post.tags?.length > 0 && <span className="text-stone-300">|</span>}
                        {post.tags?.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-accent-gold uppercase tracking-wider">{t}</span>
                        ))}
                      </div>
                      <h2 className="font-display text-xl text-stone-900 mb-3 group-hover:text-accent-gold-dark transition-colors leading-tight">{post.title}</h2>
                      <p className="text-stone-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                      <span className="text-sm font-medium text-stone-900 flex items-center gap-1 group-hover:text-accent-gold transition-colors mt-auto">
                        Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
