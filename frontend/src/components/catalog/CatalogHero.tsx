'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { CatalogBreadcrumbItem } from '@/types/catalog';
import { CatalogBreadcrumb } from './CatalogBreadcrumb';
import { shouldUnoptimizeImage } from '@/lib/image';

interface Props {
  title: string;
  subtitle?: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  breadcrumb?: CatalogBreadcrumbItem[];
}

export function CatalogHero({
  title,
  subtitle,
  imageUrl,
  fallbackImageUrl,
  breadcrumb,
}: Props) {
  const bgImage = imageUrl || fallbackImageUrl || '';

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background Image with Ken Burns */}
      {bgImage && (
        <div className="absolute inset-0 animate-zoom-subtle">
          <Image
            src={bgImage}
            alt={`${title} background image`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized={shouldUnoptimizeImage(bgImage)}
          />
        </div>
      )}

      {/* Layered Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/30 to-transparent" />

      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20">
        <div className="container-custom">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="mb-6">
              <CatalogBreadcrumb
                items={breadcrumb}
                className="[&_a]:text-white/50 [&_a:hover]:text-accent-gold [&_span]:text-white/50 [&_svg]:text-white/30 [&>span:last-child>span]:text-white/80"
              />
            </div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40, skewY: 2 }}
            animate={{ opacity: 1, y: 0, skewY: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-12 h-[2px] bg-accent-gold mb-5" />
            <h1 className="font-display text-4xl md:text-display-sm lg:text-display text-white mb-4 max-w-3xl">
              {title}
            </h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-lg md:text-xl text-white/60 max-w-2xl font-light leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade for smooth transition to content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
    </section>
  );
}
