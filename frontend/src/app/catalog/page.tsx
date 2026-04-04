'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import { CatalogLoading } from '@/components/catalog/CatalogLoading';
import { CatalogError } from '@/components/catalog/CatalogError';
import type { CatalogItem } from '@/types/catalog';

export default function CatalogPage() {
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCatalogCategories();
      setCategories(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <CatalogLoading />;
  if (error) return (
    <div className="min-h-screen bg-stone-50 pt-32">
      <CatalogError onRetry={fetchCategories} />
    </div>
  );

  return (
    <>
      {/* Cinematic Hero */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-stone-900">
        {/* Background collage — use the first category's image */}
        {categories[0]?.imageDetail && (
          <div
            className="absolute inset-0 bg-cover bg-center animate-zoom-subtle opacity-40"
            style={{ backgroundImage: `url('${categories[0].imageDetail || categories[0].imageMain}')` }}
          />
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
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-block text-accent-gold text-xs font-semibold tracking-[0.3em] uppercase mb-6"
              >
                Our Collections
              </motion.span>

              <h1 className="font-display text-4xl sm:text-5xl md:text-display lg:text-display-lg text-white mb-6 leading-[1.1]">
                Surfaces that
                <br />
                <span className="italic text-accent-gold-light">define</span> spaces
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-white/50 text-lg md:text-xl max-w-xl font-light leading-relaxed mb-10"
              >
                Discover our curated range of premium stone surfaces — from innovative Crystalline Silica-Free minerals to timeless natural stone.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap items-center gap-5"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Collections Grid — Asymmetric Editorial Layout */}
      <section id="collections" className="bg-stone-50 pb-24 md:pb-32 -mt-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
              Material Categories
            </span>
            <h2 className="font-display text-2xl md:text-display-sm text-stone-900 mt-2">
              Browse by Collection
            </h2>
          </motion.div>

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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-display-sm text-white mb-4">
              Need guidance choosing the right surface?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              Our stone specialists are here to help you find the perfect match for your project.
            </p>
            <Link href="/contact" className="btn-gold">
              Get Expert Advice
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
