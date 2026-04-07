import type { Metadata } from 'next';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Visit Our Showroom — Sunshine North, Melbourne',
  description: 'Visit the PVStone showroom in Sunshine North, Melbourne. Explore our full stone benchtop range in person. Free parking, no appointment needed. Mon-Fri 9-5, Sat 10-2.',
  keywords: ['stone showroom Melbourne', 'stone showroom Sunshine North', 'visit stone showroom', 'stone benchtop display'],
  alternates: buildAlternates('/showroom'),
  openGraph: {
    title: 'Visit Our Showroom | PVStone',
    description: 'See our full range of stone benchtops in person at our Sunshine North showroom.',
  },
};

export default function ShowroomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
