import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ShowroomInfo } from '@/components/home/ShowroomInfo';
import { FeaturedStones } from '@/components/home/FeaturedStones';
import IconCollectionGallery from '@/components/home/IconCollectionGallery';
import { buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Premium Stone Benchtops Melbourne',
  description: 'Discover premium granite, marble, quartz, porcelain and CSF-compliant stone benchtops at our Sunshine North Melbourne showroom. Expert fabrication and installation with free quotes.',
  alternates: buildAlternates('/'),
};

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryCards />
      <FeaturedStones />
      <IconCollectionGallery />
      <FeaturedProjects />
      <WhyChooseUs />
      <ShowroomInfo />
    </>
  );
}
