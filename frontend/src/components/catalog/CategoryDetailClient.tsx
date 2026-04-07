'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { CatalogHero } from '@/components/catalog/CatalogHero';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import { CatalogGallery } from '@/components/catalog/CatalogGallery';
import { CatalogLoading } from '@/components/catalog/CatalogLoading';
import { CatalogEmpty } from '@/components/catalog/CatalogEmpty';
import { CatalogError } from '@/components/catalog/CatalogError';
import { getAdminPreviewDraft } from '@/lib/admin-preview';
import type { CatalogDetailResponse } from '@/types/catalog';

interface ClientProps {
  initialData: CatalogDetailResponse | null;
  categorySlug: string;
}

export function CategoryDetailClient({ initialData, categorySlug }: ClientProps) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CatalogDetailResponse | null>(initialData);
  const isPreview = searchParams.get('preview') === '1';
  const [loading, setLoading] = useState(isPreview);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await api.getCatalogItem(categorySlug);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (!isPreview) {
      if (!initialData) fetchData();
      return;
    }

    const previewDraft = getAdminPreviewDraft<any>('category');
    if (!previewDraft || previewDraft.slug !== categorySlug) {
      fetchData();
      return;
    }

    const now = new Date().toISOString();
    setData({
      item: {
        _id: 'preview-category',
        type: 'category',
        title: previewDraft.title || 'Preview Category',
        slug: previewDraft.slug,
        description: previewDraft.description || '',
        descriptionItem: previewDraft.descriptionItem || '',
        imageMain: previewDraft.imageMain || '',
        imageItem: previewDraft.imageItem || '',
        imageDetail: previewDraft.imageDetail || previewDraft.imageMain || '',
        imageSub: previewDraft.imageSub || [],
        parentId: null,
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
          title: previewDraft.title || 'Preview Category',
          slug: previewDraft.slug,
          type: 'category',
        },
      ],
      siblings: [],
    });
    setError(false);
    setLoading(false);
  }, [categorySlug, fetchData, initialData, isPreview]);

  if (loading) return <CatalogLoading />;
  if (error || !data) return (
    <div className="min-h-screen bg-stone-50 pt-32">
      <CatalogError onRetry={fetchData} />
    </div>
  );

  const { item, children, breadcrumb } = data;

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
                    About this Collection
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

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
              {children.length} {children.length === 1 ? 'Range' : 'Ranges'} Available
            </span>
            <h2 className="font-display text-2xl md:text-display-sm text-stone-900 mt-2">
              Explore {item.title} Ranges
            </h2>
          </motion.div>

          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {children.map((range, i) => (
                <CatalogCard
                  key={range._id}
                  item={range}
                  href={`/catalog/${categorySlug}/${range.slug}`}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <CatalogEmpty message="Ranges for this collection are coming soon." />
          )}
        </div>
      </section>

      {item.imageSub && item.imageSub.length > 0 && (
        <CatalogGallery
          images={item.imageSub}
          title={`${item.title} in Context`}
        />
      )}
    </>
  );
}
