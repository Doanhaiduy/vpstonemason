import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stone Catalogue Moved | vpstonemason',
  description: 'The stone catalogue has moved to our new collection routes.',
  alternates: { canonical: '/catalog' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function StonesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
