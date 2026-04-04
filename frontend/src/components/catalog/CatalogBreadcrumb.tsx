'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CatalogBreadcrumbItem } from '@/types/catalog';

interface Props {
  items: CatalogBreadcrumbItem[];
  className?: string;
}

export function CatalogBreadcrumb({ items, className = '' }: Props) {
  // Build the href for each breadcrumb level based on type
  function buildHref(index: number): string {
    // Collect slug segments from root to current index
    const segments = items.slice(0, index + 1)
      .filter(item => item.type !== 'home')
      .map(item => item.slug);
    return '/catalog' + (segments.length > 0 ? '/' + segments.join('/') : '');
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 ${className}`}
    >
      <Link
        href="/catalog"
        className="text-sm font-medium tracking-wider uppercase text-stone-400 hover:text-accent-gold transition-colors duration-300"
      >
        Collections
      </Link>

      {items.map((item, index) => (
        <span key={item.slug} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          {index === items.length - 1 ? (
            <span className="text-sm font-medium tracking-wider uppercase text-stone-700">
              {item.title}
            </span>
          ) : (
            <Link
              href={buildHref(index)}
              className="text-sm font-medium tracking-wider uppercase text-stone-400 hover:text-accent-gold transition-colors duration-300"
            >
              {item.title}
            </Link>
          )}
        </span>
      ))}
    </motion.nav>
  );
}
