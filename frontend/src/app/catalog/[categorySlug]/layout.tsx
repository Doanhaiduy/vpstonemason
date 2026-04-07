import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string };
}): Promise<Metadata> {
  try {
    const data = await api.getCatalogItem(params.categorySlug);

    if (!data || !data.item) {
      return {
        title: 'Category Not Found',
      };
    }

    const { item } = data;

    return {
      title: `${item.title} Collections`,
      description: item.description || item.descriptionItem || `Explore our premium ${item.title} collection at PVStone Melbourne.`,
      openGraph: {
        title: `${item.title} Collections`,
        description: item.description || `Explore our premium ${item.title} collection.`,
        images: item.imageMain ? [{ url: item.imageMain }] : undefined,
      },
      alternates: {
        ...buildAlternates(`/catalog/${item.slug}`),
      },
    };
  } catch (error) {
    return {
      title: 'Stone Collections',
      description: 'Explore premium stone collections from PVStone in Melbourne, Australia.',
      alternates: buildAlternates(`/catalog/${params.categorySlug}`),
    };
  }
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { categorySlug: string };
}) {
  const data = await api.getCatalogItem(params.categorySlug).catch(() => null);

  return (
    <>
      {data?.item && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbJsonLd([
                { name: 'Catalog', url: '/catalog' },
                { name: data.item.title, url: `/catalog/${data.item.slug}` },
              ]),
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
