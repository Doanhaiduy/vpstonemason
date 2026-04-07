import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import { AnimateOnView } from '@/components/ui/AnimateOnView';
import { shouldUnoptimizeImage } from '@/lib/image';
import type { CatalogItem } from '@/types/catalog';

export default async function CatalogPage() {
  let categories: CatalogItem[] = [];
  try {
    categories = await api.getCatalogCategories();
  } catch {
    categories = [];
  }

  return (
    <>
      {/* Cinematic Hero */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-stone-900">
        {/* Background collage — use the first category's image */}
        {categories[0]?.imageDetail && (
          <div className="absolute inset-0 animate-zoom-subtle opacity-40">
            <Image
              src={categories[0].imageDetail || categories[0].imageMain}
              alt={categories[0].title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized={shouldUnoptimizeImage(
                categories[0].imageDetail || categories[0].imageMain,
              )}
            />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/30 to-stone-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/50 to-transparent" />

        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="container-custom">
            <AnimateOnView animateOnMount duration={1} className="max-w-3xl">
              <AnimateOnView animateOnMount delay={0.3} duration={0.6} direction="right" distance={20}>
                <span className="inline-block text-accent-gold text-xs font-semibold tracking-[0.3em] uppercase mb-6">
                  Our Collections
                </span>
              </AnimateOnView>

              <h1 className="font-display text-4xl sm:text-5xl md:text-display lg:text-display-lg text-white mb-6 leading-[1.1]">
                Surfaces that
                <br />
                <span className="italic text-accent-gold-light">define</span> spaces
              </h1>

              <AnimateOnView animateOnMount delay={0.5} duration={0.8} direction="none">
                <p className="text-white/50 text-lg md:text-xl max-w-xl font-light leading-relaxed mb-10">
                  Discover our curated range of premium stone surfaces — from innovative Crystalline Silica-Free minerals to timeless natural stone.
                </p>
              </AnimateOnView>

              <AnimateOnView animateOnMount delay={0.7} duration={0.6}>
                <div className="flex flex-wrap items-center gap-5">
                  <a
                    href="#collections"
                    className="inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-accent-gold transition-colors duration-300 group"
                  >
                    Explore Collections
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <Link
                    href="/catalog/products"
                    className="inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-white/70 hover:text-accent-gold transition-colors duration-300 group"
                  >
                    Browse All Products
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimateOnView>
            </AnimateOnView>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Collections Grid — Asymmetric Editorial Layout */}
      <section id="collections" className="bg-stone-50 pb-24 md:pb-32 -mt-8">
        <div className="container-custom">
          <AnimateOnView className="mb-12 md:mb-16">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
              Material Categories
            </span>
            <h2 className="font-display text-2xl md:text-display-sm text-stone-900 mt-2">
              Browse by Collection
            </h2>
          </AnimateOnView>

          {/* Asymmetric Grid: first card large, rest smaller */}
          {categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              {/* Featured / First Category — Large */}
              <div className="md:col-span-7 lg:col-span-8">
                <CatalogCard
                  item={categories[0]}
                  href={`/catalog/${categories[0].slug}`}
                  index={0}
                  variant="large"
                />
              </div>

              {/* Remaining Categories — Stacked */}
              <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4 md:gap-6">
                {categories.slice(1).map((cat, i) => (
                  <CatalogCard
                    key={cat._id}
                    item={cat}
                    href={`/catalog/${cat.slug}`}
                    index={i + 1}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Editorial CTA Section */}
      <section className="py-20 md:py-28 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, rgba(201,169,110,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(201,169,110,0.15) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <AnimateOnView>
            <h2 className="font-display text-2xl md:text-display-sm text-white mb-4">
              Need guidance choosing the right surface?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Our stone specialists are here to help you find the perfect match for your project.
            </p>
            <Link href="/contact" className="btn-gold">
              Get Expert Advice
            </Link>
          </AnimateOnView>
        </div>
      </section>
    </>
  );
}
