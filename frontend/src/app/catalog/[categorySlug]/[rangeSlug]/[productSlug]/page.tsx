import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/catalog/ProductDetailClient';
import type { CatalogDetailResponse } from '@/types/catalog';

interface PageProps {
  params: { categorySlug: string; rangeSlug: string; productSlug: string };
  searchParams: { preview?: string };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === '1';

  // Wait for product data on the server
  const data = await api.getCatalogItem(
    `${params.categorySlug}/${params.rangeSlug}/${params.productSlug}`
  ).catch(
    () => null
  ) as CatalogDetailResponse | null;

  // React properly with 404 for invalid catalog combinations
  if ((!data || !data.item) && !isPreview) {
    notFound();
  }

  return (
    <ProductDetailClient
      initialData={data}
      categorySlug={params.categorySlug}
      rangeSlug={params.rangeSlug}
      productSlug={params.productSlug}
    />
  );
}
