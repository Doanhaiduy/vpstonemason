import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Us — 15+ Years of Australian Stone Craftsmanship',
  description: 'Learn about PVStone, a family-owned stone fabrication and installation company in Melbourne. Over 15 years of expertise, 2000+ completed projects, and 100+ stone varieties.',
  keywords: ['PVStone', 'stone fabrication Melbourne', 'stonemason Melbourne', 'Sunshine North stone showroom'],
  alternates: buildAlternates('/about'),
  openGraph: {
    title: 'About PVStone',
    description: 'Family-owned Australian stone experts with 15+ years of experience.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
