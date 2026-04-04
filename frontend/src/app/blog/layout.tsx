import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Stone Benchtop Tips, Trends & Guides',
  description: 'Read expert advice on stone benchtops. Guides on choosing the right stone, maintenance tips, kitchen trends in Australia, and inspiration for your renovation project.',
  keywords: ['stone benchtop blog', 'kitchen benchtop tips', 'stone care guide', 'kitchen trends Australia 2025'],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog & News | vpstonemason',
    description: 'Tips, trends and expert guides for your stone benchtop project.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
