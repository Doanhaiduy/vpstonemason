import { permanentRedirect } from 'next/navigation';
import { api } from '@/lib/api';
import type { CatalogDetailResponse } from '@/types/catalog';

interface PageProps {
  params: { slug: string };
}

export default async function CatalogProductLookupPage({ params }: PageProps) {
  const { slug } = params;

  try {
    const data = (await api.getCatalogItem(slug)) as CatalogDetailResponse;
    const breadcrumbSlugs = (data?.breadcrumb || [])
      .filter((crumb) => crumb.type !== 'home')
      .map((crumb) => crumb.slug);
    const itemSlug = data?.item?.slug || slug;

    const slugs = breadcrumbSlugs.includes(itemSlug)
      ? breadcrumbSlugs
      : [...breadcrumbSlugs, itemSlug];

    if (slugs.length > 0) {
      permanentRedirect(`/catalog/${slugs.join('/')}`);
    }
  } catch {
    // Ignore and fallback to catalog root.
  }

  permanentRedirect('/catalog');
}
