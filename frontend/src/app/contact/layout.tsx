import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Get a Free Stone Benchtop Quote',
  description: 'Contact vpstonemason for a free stone benchtop quote. Call (03) 9000 0000, email us, or fill out our online form. Kitchen, bathroom, and outdoor stone benchtops in Melbourne.',
  keywords: ['stone benchtop quote', 'contact stone company Melbourne', 'free kitchen benchtop quote', 'stone benchtop price'],
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | vpstonemason',
    description: 'Get a free quote for premium stone benchtops. Call or enquire online.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
