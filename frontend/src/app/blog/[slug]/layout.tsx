import type { Metadata } from 'next';
import { api } from '@/lib/api';
import type { BlogPost } from '@/types';
import { buildAlternates } from '@/lib/seo';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post: BlogPost = await api.getBlogPostBySlug(params.slug) as BlogPost;

    if (!post) {
      return {
        title: 'Blog Post Not Found',
      };
    }

    const title = `${post.title} | Insights`;
    const description = post.excerpt || `Read ${post.title} on the PVStone blog.`;
    const imageUrl = post.featuredImage || post.thumbnail || (post.images?.[0]) || undefined;

    return {
      title,
      description,
      keywords: post.tags,
      authors: [{ name: post.authorName || 'PVStone' }],
      openGraph: {
        title: post.title,
        description,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
      },
      alternates: {
        ...buildAlternates(`/blog/${params.slug}`),
      },
    };
  } catch (error) {
    return {
      title: 'Blog Insights',
      description: 'Stone benchtop guides, trends, and expert advice for Australian projects.',
      alternates: buildAlternates(`/blog/${params.slug}`),
    };
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pvstone.com.au';

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const post: BlogPost | null = await api.getBlogPostBySlug(params.slug).catch(() => null) as BlogPost | null;

  return (
    <>
      {post && (
        <>
          {/* BreadcrumbList JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                buildBreadcrumbJsonLd([
                  { name: 'Blog', url: '/blog' },
                  { name: post.title, url: `/blog/${params.slug}` },
                ]),
              ),
            }}
          />
          {/* Article JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: post.title,
                image: post.featuredImage ? [post.featuredImage] : undefined,
                datePublished: post.publishedAt || post.createdAt,
                dateModified: post.updatedAt || post.publishedAt || post.createdAt,
                author: [{
                  '@type': 'Person',
                  name: post.authorName || 'PVStone Admin',
                }],
                publisher: {
                  '@type': 'Organization',
                  name: 'PVStone',
                  url: SITE_URL,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/icon0.svg`,
                  },
                },
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `${SITE_URL}/blog/${params.slug}`,
                },
              }),
            }}
          />
        </>
      )}
      {children}
    </>
  );
}
