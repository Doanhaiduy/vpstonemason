import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string; rangeSlug: string; productSlug: string };
}): Promise<Metadata> {
  try {
    const data = await api.getCatalogItem(`${params.categorySlug}/${params.rangeSlug}/${params.productSlug}`);

    if (!data || !data.item) {
      return {
        title: 'Product Not Found',
      };
    }

    const { item } = data;

    const keywords = [item.title, 'stone benchtop', 'Melbourne stone'];
    if (item.features && item.features.length > 0) {
      keywords.push(...item.features);
    }

    return {
      title: item.title,
      description: item.description || `View ${item.title} at PVStone. Premium quality stone for benchtops and surfaces.`,
      keywords,
      openGraph: {
        title: item.title,
        description: item.description || `View ${item.title} at PVStone.`,
        images: item.imageMain ? [{ url: item.imageMain }] : undefined,
      },
      alternates: {
        ...buildAlternates(`/catalog/${params.categorySlug}/${params.rangeSlug}/${item.slug}`),
      },
    };
  } catch (error) {
    return {
      title: 'Stone Product',
      description: 'Discover premium stone surfaces by PVStone in Melbourne, Australia.',
      alternates: buildAlternates(
        `/catalog/${params.categorySlug}/${params.rangeSlug}/${params.productSlug}`,
      ),
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { categorySlug: string; rangeSlug: string; productSlug: string };
}) {
  const [catData, rangeData, data] = await Promise.all([
    api.getCatalogItem(params.categorySlug).catch(() => null),
    api.getCatalogItem(`${params.categorySlug}/${params.rangeSlug}`).catch(() => null),
    api.getCatalogItem(`${params.categorySlug}/${params.rangeSlug}/${params.productSlug}`).catch(() => null),
  ]);

  const specs = data?.item?.specifications || {};
  const materialSpec = Object.entries(specs).find(([key]) => /material|type/i.test(key as string));

  return (
    <>
      {data?.item && (
        <>
          {/* BreadcrumbList JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                buildBreadcrumbJsonLd([
                  { name: 'Catalog', url: '/catalog' },
                  { name: catData?.item?.title || params.categorySlug, url: `/catalog/${params.categorySlug}` },
                  { name: rangeData?.item?.title || params.rangeSlug, url: `/catalog/${params.categorySlug}/${params.rangeSlug}` },
                  { name: data.item.title, url: `/catalog/${params.categorySlug}/${params.rangeSlug}/${data.item.slug}` },
                ]),
              ),
            }}
          />
          {/* Product JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: data.item.title,
                image: data.item.imageMain ? [data.item.imageMain] : undefined,
                description: data.item.description || data.item.descriptionItem || `View ${data.item.title} at PVStone.`,
                ...(materialSpec ? { material: materialSpec[1] } : {}),
                brand: {
                  '@type': 'Brand',
                  name: 'PVStone',
                },
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'AUD',
                  availability: 'https://schema.org/InStock',
                  seller: {
                    '@type': 'Organization',
                    name: 'PVStone',
                  },
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
