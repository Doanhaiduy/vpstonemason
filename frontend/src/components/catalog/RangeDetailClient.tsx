'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import { CatalogGallery } from '@/components/catalog/CatalogGallery';
import { CatalogLoading } from '@/components/catalog/CatalogLoading';
import { CatalogEmpty } from '@/components/catalog/CatalogEmpty';
import { CatalogError } from '@/components/catalog/CatalogError';
import { getAdminPreviewDraft } from '@/lib/admin-preview';
import { shouldUnoptimizeImage } from '@/lib/image';
import type { CatalogDetailResponse } from '@/types/catalog';

interface ClientProps {
  initialData: CatalogDetailResponse | null;
  categorySlug: string;
  rangeSlug: string;
}

export function RangeDetailClient({ initialData, categorySlug, rangeSlug }: ClientProps) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CatalogDetailResponse | null>(initialData);
  const isPreview = searchParams.get('preview') === '1';
  const [loading, setLoading] = useState(isPreview);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await api.getCatalogItem(`${categorySlug}/${rangeSlug}`);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, rangeSlug]);

  useEffect(() => {
    if (!isPreview) {
      if (!initialData) fetchData();
      return;
    }

    const previewDraft = getAdminPreviewDraft<any>('range');
    if (!previewDraft || previewDraft.slug !== rangeSlug) {
      fetchData();
      return;
    }

    const now = new Date().toISOString();
    setData({
      item: {
        _id: 'preview-range',
        type: 'range',
        title: previewDraft.title || 'Preview Range',
        slug: previewDraft.slug,
        description: previewDraft.description || '',
        descriptionItem: previewDraft.descriptionItem || '',
        imageMain: previewDraft.imageMain || '',
        imageItem: previewDraft.imageItem || '',
        imageDetail: previewDraft.imageDetail || previewDraft.imageMain || '',
        imageSub: previewDraft.imageSub || [],
        parentId: previewDraft.categoryId || null,
        sourceUrl: '',
        specifications: {},
        features: [],
        displayOrder: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      children: [],
      breadcrumb: [
        {
          title: previewDraft.categoryTitle || 'Category',
          slug: previewDraft.categorySlug || categorySlug,
          type: 'category',
        },
        {
          title: previewDraft.title || 'Preview Range',
          slug: previewDraft.slug,
          type: 'range',
        },
      ],
      siblings: [],
    });
    setError(false);
    setLoading(false);
  }, [categorySlug, fetchData, initialData, isPreview, rangeSlug]);

  if (loading) return <CatalogLoading />;
  if (error || !data) return (
    <div className="min-h-screen bg-stone-50 pt-32">
      <CatalogError onRetry={fetchData} />
    </div>
  );

  const { item, children, breadcrumb, siblings } = data;

  return (
    <>
      <CatalogHero
        title={item.title}
        subtitle={item.descriptionItem || undefined}
        imageUrl={item.imageDetail}
        fallbackImageUrl={item.imageMain}
        breadcrumb={breadcrumb}
      />

      {item.description && (
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
              >
                <div className="md:col-span-4">
                  <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
                    About this Range
                  </span>
                  <div className="w-8 h-[2px] bg-accent-gold mt-3" />
                </div>
                <div className="md:col-span-8">
                  <p className="text-stone-600 text-base md:text-lg leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {item.imageMain && (
        <section className="bg-white">
          <div className="container-custom py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/7] overflow-hidden bg-stone-100"
            >
              <Image
                src={item.imageMain}
                alt={`${item.title} range banner`}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized={shouldUnoptimizeImage(item.imageMain)}
              />
            </motion.div>
          </div>
        </section>
      )}

      {children.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 md:mb-16"
            >
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
                {children.length} {children.length === 1 ? 'Product' : 'Products'}
              </span>
              <h2 className="font-display text-2xl md:text-display-sm text-stone-900 mt-2">
                Products in {item.title}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {children.map((product, i) => (
                <CatalogCard
                  key={product._id}
                  item={product}
                  href={`/catalog/${categorySlug}/${rangeSlug}/${product.slug}`}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {children.length === 0 && (
        <section className="py-8 md:py-12 bg-white">
          <div className="container-custom">
            <CatalogEmpty message="Products for this range are being prepared. Contact us for availability." />
          </div>
        </section>
      )}

      {item.imageSub && item.imageSub.length > 0 && (
        <CatalogGallery
          images={item.imageSub}
          title={`${item.title} Inspiration`}
        />
      )}

      {siblings && siblings.length > 0 && (
        <section className="py-16 md:py-24 bg-stone-900">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
                More Ranges
              </span>
              <h2 className="font-display text-2xl md:text-display-sm text-white mt-2">
                Explore Other Ranges
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {siblings.slice(0, 3).map((sibling, i) => (
                <CatalogCard
                  key={sibling._id}
                  item={sibling}
                  href={`/catalog/${categorySlug}/${sibling.slug}`}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20 bg-stone-50">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xl md:text-2xl text-stone-900 mb-4">
              Interested in {item.title}?
            </h3>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              Get in touch with our team for samples, pricing, and expert recommendations.
            </p>
            <Link href="/contact" className="btn-primary">
              Request a Quote
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
