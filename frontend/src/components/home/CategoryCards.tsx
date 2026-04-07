'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CategoryCardSkeleton } from '@/components/ui/Skeletons';
import { shouldUnoptimizeImage } from '@/lib/image';

const CATEGORY_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80';

export function CategoryCards() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCatalogCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Our Collection</span>
            <h2 className="section-title mt-4 mb-4">Explore Our Collections</h2>
            <p className="section-subtitle mx-auto">Browse our Mineral, Porcelain, and Natural ranges to find the right surface for your project.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <CategoryCardSkeleton key={i} />)
            : categories.map((cat, i) => (
              <motion.div key={cat._id || cat.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Link href={`/catalog/${cat.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-stone-200">
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                    <Image
                      src={cat.imageDetail || cat.imageMain || CATEGORY_FALLBACK_IMAGE}
                      alt={cat.title}
                      fill
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized={shouldUnoptimizeImage(
                        cat.imageDetail || cat.imageMain || CATEGORY_FALLBACK_IMAGE,
                      )}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent transition-all duration-500 group-hover:from-stone-950/90" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="font-display text-2xl text-white mb-1">{cat.title}</h3>
                    <p className="text-white/60 text-sm mb-3">{cat.descriptionItem || cat.description}</p>
                    <div className="flex items-center gap-2 text-accent-gold text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore Collection <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
