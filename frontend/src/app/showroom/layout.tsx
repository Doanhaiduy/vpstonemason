import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visit Our Showroom — Richmond, Melbourne',
  description: 'Visit vpstonemason showroom in Richmond, Melbourne. See our full stone benchtop range in person. Free parking, no appointment needed. Mon-Fri 9-5, Sat 10-2.',
  keywords: ['stone showroom Melbourne', 'stone showroom Richmond', 'visit stone showroom', 'stone benchtop display'],
  alternates: { canonical: '/showroom' },
  openGraph: {
    title: 'Visit Our Showroom | vpstonemason',
    description: 'See our full range of stone benchtops in person at our Richmond showroom.',
  },
};

export default function ShowroomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
