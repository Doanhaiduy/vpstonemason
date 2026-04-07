'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { CatalogItem } from '@/types/catalog';
import { shouldUnoptimizeImage } from '@/lib/image';

interface Props {
  item: CatalogItem;
  href: string;
  index?: number;
  variant?: 'default' | 'large' | 'featured';
}

export function CatalogCard({ item, href, index = 0, variant = 'default' }: Props) {
  const image = item.imageItem || item.imageMain || '';
  const subtitle = item.descriptionItem || '';
  const typeLabel = item.type === 'category'
    ? 'Collection'
    : item.type === 'range'
    ? 'Range'
    : 'Product';

  const aspectClass = variant === 'large'
    ? 'aspect-[4/5] md:aspect-[3/4]'
    : variant === 'featured'
    ? 'aspect-[16/10] md:aspect-[3/4]'
    : 'aspect-[3/4]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group block relative overflow-hidden"
        id={`catalog-card-${item.slug}`}
      >
        {/* Image Container */}
        <div className={`relative ${aspectClass} bg-stone-200 overflow-hidden`}>
          {image ? (
            <div
              className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-110"
            >
              <Image
                src={image}
                alt={`${item.title} ${typeLabel}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
                unoptimized={shouldUnoptimizeImage(image)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-stone-300">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Type Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-white/10 backdrop-blur-md text-white/90 border border-white/10">
              {typeLabel}
            </span>
          </div>

          {/* Arrow Icon */}
          <div className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-0 translate-x-2">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            {/* Gold accent line */}
            <div className="w-8 h-[2px] bg-accent-gold mb-3 transition-all duration-500 group-hover:w-12" />

            <h3 className="font-display text-xl md:text-2xl text-white mb-1 transition-transform duration-500 group-hover:translate-y-[-2px]">
              {item.title}
            </h3>

            {subtitle && (
              <p className="text-sm text-white/60 font-light tracking-wide line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
