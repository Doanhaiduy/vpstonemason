import { api } from '@/lib/api';
import type { BlogPost } from '@/types';
import { AnimateOnView } from '@/components/ui/AnimateOnView';
import { BlogListClient } from '@/components/blog/BlogListClient';

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    const res = await api.getBlogPosts({ limit: '60' });
    posts = (res.data || []) as BlogPost[];
  } catch {
    posts = [];
  }

  const categories = new Set<string>();
  posts.forEach((post) => {
    if (post.category?.trim()) categories.add(post.category.trim());
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-800 bg-stone-900 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.24),_transparent_44%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_40%)]" />

        <div className="container-custom relative z-10">
          <AnimateOnView animateOnMount duration={0.4} className="mx-auto max-w-4xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-accent-gold">
              Stone Insights
            </span>
            <h1 className="mt-4 mb-4 font-display text-display-sm text-white md:text-display">
              Blog &amp; News
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-stone-300 md:text-lg">
              Practical renovation guidance, material comparisons, and real-world stone benchtop advice curated for Australian homeowners.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                {posts.length} articles
              </span>
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                {categories.size} categories
              </span>
              <span className="rounded-full border border-stone-700 bg-stone-800/70 px-4 py-2 text-stone-200">
                Updated weekly
              </span>
            </div>
          </AnimateOnView>
        </div>
      </section>

      <BlogListClient initialPosts={posts} />
    </>
  );
}
