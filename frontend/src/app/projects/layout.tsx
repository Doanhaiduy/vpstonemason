import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Projects — Kitchen & Bathroom Stone Installations',
  description: 'Explore our portfolio of completed stone benchtop projects across Melbourne and Victoria. Kitchen renovations, bathroom vanities, outdoor kitchens and more featuring premium natural stone.',
  keywords: ['stone benchtop projects', 'kitchen renovation Melbourne', 'stone installation gallery', 'benchtop before after'],
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Our Projects | vpstonemason',
    description: 'See our premium stone benchtop installations across Melbourne homes.',
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
