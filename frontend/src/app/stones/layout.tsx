import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Stone Catalogue Moved',
  description: 'The stone catalogue has moved to our new collection routes.',
  alternates: buildAlternates('/catalog'),
  robots: {
    index: false,
    follow: true,
  },
};

export default function StonesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
