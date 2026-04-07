'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Calendar, ChevronLeft, Clock3, UserRound } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogPost } from '@/types';
import { PageLoading } from '@/components/ui/Skeletons';
import { getAdminPreviewDraft } from '@/lib/admin-preview';
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar';
import {
  TableOfContents,
  TableOfContentsMobile,
} from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import {
  estimateReadTimeFromHtml,
  processBlogHtmlWithHeadings,
} from '@/lib/blog-content';
import { shouldUnoptimizeImage } from '@/lib/image';

function getPostCover(post: BlogPost | null): string {
  if (!post) return '';
  if (post.featuredImage) return post.featuredImage;
  if (post.thumbnail) return post.thumbnail;
  if (Array.isArray(post.images) && post.images.length > 0) return post.images[0];
  return '';
}

function formatDateLabel(value?: string): string {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toNormalizedTagSet(tags: string[] = []): Set<string> {
  return new Set(tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean));
}

function getRelatedScore(current: BlogPost, candidate: BlogPost): number {
  let score = 0;

  if (
    current.category &&
    candidate.category &&
    current.category.toLowerCase() === candidate.category.toLowerCase()
  ) {
    score += 2;
  }

  const currentTags = toNormalizedTagSet(current.tags || []);
  (candidate.tags || []).forEach((tag) => {
    if (currentTags.has(tag.toLowerCase().trim())) {
      score += 1;
    }
  });

  return score;
}

export function BlogDetailClient({ initialPost, slug }: { initialPost: BlogPost | null, slug: string }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';

  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [loading, setLoading] = useState(isPreview);

  useEffect(() => {
    if (isPreview) {
      const previewDraft = getAdminPreviewDraft<any>('blog');
      if (previewDraft && previewDraft.slug === slug) {
        setPost({
          _id: previewDraft._id || 'preview-blog-post',
          ...previewDraft,
          title: previewDraft.title || 'Preview Blog Post',
          slug: previewDraft.slug || slug,
          excerpt: previewDraft.excerpt || '',
          content: previewDraft.content || '',
          tags: previewDraft.tags || [],
          featuredImage:
            previewDraft.featuredImage || previewDraft.thumbnail || '',
          thumbnail:
            previewDraft.thumbnail || previewDraft.featuredImage || '',
          images: previewDraft.images || [],
          authorName:
            previewDraft.authorName ||
            previewDraft.authorId?.firstName ||
            'Preview',
          category: previewDraft.category || 'Preview',
          status: 'published',
          createdAt: previewDraft.createdAt || new Date().toISOString(),
          publishedAt: previewDraft.publishedAt || new Date().toISOString(),
          readTime: previewDraft.readTime,
        });
      }
      setLoading(false);
    }
  }, [isPreview, slug]);

  useEffect(() => {
    if (!post?._id) return;

    api
      .getBlogPosts({ limit: '60' })
      .then((res) => {
        const allPosts = (res.data || []) as BlogPost[];
        const withoutCurrent = allPosts.filter((item) => item.slug !== post.slug);

        const ranked = withoutCurrent
          .map((candidate) => ({
            candidate,
            score: getRelatedScore(post, candidate),
          }))
          .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            const leftDate = new Date(
              left.candidate.publishedAt || left.candidate.createdAt,
            ).getTime();
            const rightDate = new Date(
              right.candidate.publishedAt || right.candidate.createdAt,
            ).getTime();
            return rightDate - leftDate;
          });

        const positiveMatches = ranked
          .filter((entry) => entry.score > 0)
          .map((entry) => entry.candidate);
        const fallbackMatches = ranked.map((entry) => entry.candidate);

        setRelatedPosts(
          (positiveMatches.length > 0 ? positiveMatches : fallbackMatches).slice(0, 3),
        );
      })
      .catch(() => setRelatedPosts([]));
  }, [post]);

  const processedContent = useMemo(
    () => processBlogHtmlWithHeadings(post?.content || ''),
    [post?.content],
  );

  useEffect(() => {
    const headings = processedContent.headings;
    if (headings.length === 0) {
      setActiveHeadingId('');
      return;
    }

    setActiveHeadingId(headings[0].id);

    // Give it a tiny delay for React to render the dangerouslySetInnerHTML
    const timeout = setTimeout(() => {
      const elements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter(Boolean) as HTMLElement[];

      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

          if (visible[0]?.target?.id) {
            setActiveHeadingId(visible[0].target.id);
          }
        },
        {
          rootMargin: '-24% 0px -62% 0px',
          threshold: [0, 0.2, 0.5, 1],
        },
      );

      elements.forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeout);
  }, [processedContent.htmlWithIds, processedContent.headings]);

  const readTime = useMemo(() => {
    if (!post) return 1;
    if (Number(post.readTime || 0) > 0) return Number(post.readTime);
    return estimateReadTimeFromHtml(post.content || '');
  }, [post]);

  const articleCover = useMemo(() => getPostCover(post), [post]);

  const articleUrl = useMemo(() => {
    if (!slug) return '';
    if (typeof window === 'undefined') return `/blog/${slug}`;
    return `${window.location.origin}/blog/${slug}`;
  }, [slug]);

  if (loading) return <PageLoading text="Loading article..." />;

  if (!post)
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="mb-4 text-2xl font-bold">Article not found</h1>
        <Link href="/blog" className="btn-secondary">
          Back to Blog
        </Link>
      </div>
    );

  return (
    <>
      <ReadingProgressBar />

      <section className="pt-24 pb-4 bg-white border-b border-stone-100">
        <div className="container-custom">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </section>

      <article className="bg-white py-12">
        <div className="container-custom">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                  <span className="rounded-full bg-accent-gold/12 px-3 py-1 font-medium uppercase tracking-[0.1em] text-accent-gold-dark">
                    {post.category || 'Stone insights'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <Calendar className="h-4 w-4" />
                    {formatDateLabel(post.publishedAt || post.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <Clock3 className="h-4 w-4" />
                    {readTime} min read
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <UserRound className="h-4 w-4" />
                    {post.authorName || post.authorId?.firstName || 'Admin'}
                  </span>
                </div>

                <h1 className="mb-5 font-display text-4xl leading-tight text-stone-900 md:text-5xl">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mb-6 text-lg leading-relaxed text-stone-600">{post.excerpt}</p>
                )}

                {post.tags?.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-stone-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <ShareButtons
                  title={post.title}
                  description={post.excerpt}
                  url={articleUrl}
                  className="mb-8"
                />
              </motion.div>

              {articleCover && (
                <div className="mb-10 overflow-hidden rounded-2xl bg-stone-200 shadow-lg">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={articleCover}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1280px) 70vw, 100vw"
                      className="object-cover"
                      unoptimized={shouldUnoptimizeImage(articleCover)}
                    />
                  </div>
                </div>
              )}

              {processedContent.htmlWithIds && (
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{
                    __html: processedContent.htmlWithIds,
                  }}
                />
              )}

              <div className="mt-14 rounded-2xl bg-stone-50 p-8 text-center">
                <h3 className="mb-3 font-display text-2xl text-stone-900">
                  Ready to Choose Your Stone?
                </h3>
                <p className="mb-6 text-stone-500">
                  Visit our showroom to see our full range in person.
                </p>
                <Link href="/showroom" className="btn-gold">
                  Visit Showroom
                </Link>
              </div>

              <RelatedPosts posts={relatedPosts} />
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-28 space-y-4">
                <TableOfContents
                  headings={processedContent.headings}
                  activeId={activeHeadingId}
                />
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                    Share article
                  </p>
                  <ShareButtons
                    title={post.title}
                    description={post.excerpt}
                    url={articleUrl}
                  />
                </div>
              </div>
            </aside>
          </div>

          <TableOfContentsMobile
            headings={processedContent.headings}
            activeId={activeHeadingId}
          />

          <ShareButtons
            title={post.title}
            description={post.excerpt}
            url={articleUrl}
            variant="floating"
          />
          <div className="h-16 xl:h-0" />
        </div>
      </article>
    </>
  );
}
