import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Stone Collections | Premium Material Catalog',
  description:
    'Explore our curated collections of premium Mineral, Porcelain, and Natural stone surfaces. Crystalline Silica-Free options available.',
  alternates: buildAlternates('/catalog'),
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
