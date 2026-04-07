import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { CategoryDetailClient } from '@/components/catalog/CategoryDetailClient';
import type { CatalogDetailResponse } from '@/types/catalog';

interface PageProps {
  params: { categorySlug: string };
  searchParams: { preview?: string };
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === '1';

  const data = await api.getCatalogItem(params.categorySlug).catch(() => null) as CatalogDetailResponse | null;

  if ((!data || !data.item) && !isPreview) {
    notFound();
  }

  return <CategoryDetailClient initialData={data} categorySlug={params.categorySlug} />;
}
