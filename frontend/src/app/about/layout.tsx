import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — 15+ Years of Australian Stone Craftsmanship',
  description: 'Learn about vpstonemason, a family-owned stone fabrication and installation company in Melbourne. Over 15 years of expertise, 2000+ completed projects, and 100+ stone varieties.',
  keywords: ['about stone and co', 'stone fabrication Melbourne', 'stonemason Melbourne', 'stone benchtop company'],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About vpstonemason',
    description: 'Family-owned Australian stone experts with 15+ years of experience.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
