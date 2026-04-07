import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { RangeDetailClient } from '@/components/catalog/RangeDetailClient';
import type { CatalogDetailResponse } from '@/types/catalog';

interface PageProps {
  params: { categorySlug: string; rangeSlug: string };
  searchParams: { preview?: string };
}

export default async function RangeDetailPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === '1';

  const data = (await api
    .getCatalogItem(`${params.categorySlug}/${params.rangeSlug}`)
    .catch(() => null)) as CatalogDetailResponse | null;

  if ((!data || !data.item) && !isPreview) {
    notFound();
  }

  return <RangeDetailClient initialData={data} categorySlug={params.categorySlug} rangeSlug={params.rangeSlug} />;
}
