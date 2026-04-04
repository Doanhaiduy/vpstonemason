import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { ShowroomInfo } from '@/components/home/ShowroomInfo';
import { FeaturedStones } from '@/components/home/FeaturedStones';
import IconCollectionGallery from '@/components/home/IconCollectionGallery';

export const metadata: Metadata = {
  title: 'vpstonemason | Premium Stone Benchtops Melbourne, Australia',
  description: 'Discover premium granite, marble, quartz, porcelain & CSF stone benchtops at our Melbourne showroom. Expert fabrication & installation for kitchens, bathrooms & beyond. Free quotes available.',
  alternates: { canonical: '/' },
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
