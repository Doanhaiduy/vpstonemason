'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { StoneCardSkeleton } from '@/components/ui/Skeletons';
import { shouldUnoptimizeImage } from '@/lib/image';

interface FeaturedProduct {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  categoryTitle: string;
  finish?: string;
  colours: string[];
}

function parseValues(raw: string): string[] {
  return raw
    .split(/[;,|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildFeaturedProducts(tree: any[]): FeaturedProduct[] {
  const featured: FeaturedProduct[] = [];

  for (const category of tree || []) {
    const ranges = Array.isArray(category?.children) ? category.children : [];

    for (const range of ranges) {
      const products = Array.isArray(range?.children) ? range.children : [];

      for (const product of products) {
        if (!product?.slug) continue;

        const specs = product.specifications || {};
        const specEntries = Object.entries(specs) as Array<[string, string]>;

        const finish =
          specEntries.find(([key]) => /finish|surface/i.test(key))?.[1] || '';
        const coloursRaw =
          specEntries.find(([key]) => /colour|color/i.test(key))?.[1] || '';

        featured.push({
          id: product._id || `${category.slug}-${range.slug}-${product.slug}`,
          title: product.title,
          imageUrl:
            product.imageMain ||
            product.imageDetail ||
            product.imageItem ||
            'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80',
          href: `/catalog/${category.slug}/${range.slug}/${product.slug}`,
          categoryTitle: category.title || 'Collection',
          finish,
          colours: parseValues(coloursRaw).slice(0, 3),
        });
      }
    }
  }

  return featured;
}

export function FeaturedStones() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCatalogTree()
      .then((data) => setProducts(buildFeaturedProducts(data).slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-stone-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">
              Popular Selections
            </span>
            <h2 className="section-title mt-4">Featured Stones</h2>
          </motion.div>
          <Link
            href="/catalog"
            className="text-stone-900 text-sm font-medium tracking-wider uppercase flex items-center gap-2 hover:text-accent-gold transition-colors"
          >
            View All Collections <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <StoneCardSkeleton key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={product.href} className="group block">
                    <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden mb-4">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized={shouldUnoptimizeImage(product.imageUrl)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-accent-gold uppercase tracking-wider">
                          {product.categoryTitle}
                        </span>
                        {product.finish && (
                          <>
                            <span className="text-stone-300">-</span>
                            <span className="text-xs text-stone-400 uppercase tracking-wider">
                              {product.finish}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-xl text-stone-900 group-hover:text-accent-gold-dark transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex gap-1.5 pt-1">
                        {product.colours.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 bg-stone-100 text-stone-500 text-[11px] uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
