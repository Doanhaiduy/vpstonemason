import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string; rangeSlug: string };
}): Promise<Metadata> {
  try {
    const data = await api.getCatalogItem(`${params.categorySlug}/${params.rangeSlug}`);

    if (!data || !data.item) {
      return {
        title: 'Range Not Found',
      };
    }

    const { item } = data;

    return {
      title: `${item.title} Range`,
      description: item.description || `Discover the ${item.title} range at PVStone Melbourne.`,
      openGraph: {
        title: `${item.title} Range`,
        description: item.description || `Discover the ${item.title} range.`,
        images: item.imageMain ? [{ url: item.imageMain }] : undefined,
      },
      alternates: {
        ...buildAlternates(`/catalog/${params.categorySlug}/${item.slug}`),
      },
    };
  } catch (error) {
    return {
      title: 'Stone Range',
      description: 'Browse stone ranges by PVStone in Melbourne, Australia.',
      alternates: buildAlternates(`/catalog/${params.categorySlug}/${params.rangeSlug}`),
    };
  }
}

export default async function RangeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { categorySlug: string; rangeSlug: string };
}) {
  const [catData, rangeData] = await Promise.all([
    api.getCatalogItem(params.categorySlug).catch(() => null),
    api.getCatalogItem(`${params.categorySlug}/${params.rangeSlug}`).catch(() => null),
  ]);

  return (
    <>
      {rangeData?.item && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbJsonLd([
                { name: 'Catalog', url: '/catalog' },
                { name: catData?.item?.title || params.categorySlug, url: `/catalog/${params.categorySlug}` },
                { name: rangeData.item.title, url: `/catalog/${params.categorySlug}/${rangeData.item.slug}` },
              ]),
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
