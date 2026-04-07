import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All Stone Products | Filtered Catalog',
  description:
    'Browse all stone products in one place with modern filtering by collection, range, finish, and keyword.',
  alternates: buildAlternates('/catalog/products'),
};

export default function CatalogProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
