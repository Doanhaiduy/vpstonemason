'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageSquare,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CatalogBreadcrumb } from '@/components/catalog/CatalogBreadcrumb';
import { CatalogLoading } from '@/components/catalog/CatalogLoading';
import { CatalogError } from '@/components/catalog/CatalogError';
import { useSiteConfig } from '@/lib/SiteConfigContext';
import { getAdminPreviewDraft } from '@/lib/admin-preview';
import { shouldUnoptimizeImage } from '@/lib/image';
import { toPhoneHref } from '@/lib/phone';
import type { CatalogDetailResponse } from '@/types/catalog';

interface ClientProps {
  initialData: CatalogDetailResponse | null;
  categorySlug: string;
  rangeSlug: string;
  productSlug: string;
}

function parseDelimitedValues(value: string): string[] {
  return value
    .split(/[;,|/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProductDetailClient({ initialData, categorySlug, rangeSlug, productSlug }: ClientProps) {
  const searchParams = useSearchParams();
  const config = useSiteConfig();
  const isPreview = searchParams.get('preview') === '1';
  
  const [data, setData] = useState<CatalogDetailResponse | null>(initialData);
  const [loading, setLoading] = useState(isPreview);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [subGalleryIndex, setSubGalleryIndex] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await api.getCatalogItem(
        `${categorySlug}/${rangeSlug}/${productSlug}`,
      );
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, productSlug, rangeSlug]);

  useEffect(() => {
    if (!isPreview) {
      if (!initialData) fetchData();
      return;
    }

    const previewDraft = getAdminPreviewDraft<any>('product');
    if (!previewDraft || previewDraft.slug !== productSlug) {
      fetchData();
      return;
    }

    const now = new Date().toISOString();
    setData({
      item: {
        _id: 'preview-product',
        type: 'product',
        title: previewDraft.title || 'Preview Product',
        slug: previewDraft.slug,
        description: previewDraft.description || '',
        descriptionItem: previewDraft.descriptionItem || '',
        imageMain: previewDraft.imageMain || '',
        imageItem: previewDraft.imageItem || '',
        imageDetail: previewDraft.imageDetail || previewDraft.imageMain || '',
        imageSub: previewDraft.imageSub || [],
        parentId: previewDraft.rangeId || null,
        sourceUrl: previewDraft.sourceUrl || '',
        specifications: previewDraft.specifications || {},
        features: previewDraft.features || [],
        displayOrder: Number(previewDraft.displayOrder) || 0,
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
          title: previewDraft.rangeTitle || 'Range',
          slug: previewDraft.rangeSlug || rangeSlug,
          type: 'range',
        },
        {
          title: previewDraft.title || 'Preview Product',
          slug: previewDraft.slug,
          type: 'product',
        },
      ],
      siblings: [],
    });
    setError(false);
    setLoading(false);
  }, [categorySlug, fetchData, initialData, isPreview, productSlug, rangeSlug]);

  const item = data?.item;
  const breadcrumb = data?.breadcrumb || [];
  const siblings = data?.siblings || [];

  const galleryImages = useMemo(
    () =>
      Array.from(
        new Set(
          [item?.imageMain, ...(item?.imageSub || [])].filter(
            (image): image is string => Boolean(image),
          ),
        ),
      ),
    [item?.imageMain, item?.imageSub],
  );
  const thumbnailImages = galleryImages.slice(0, 4);
  const verticalGalleryImages = galleryImages.slice(4);

  useEffect(() => {
    if (activeImage >= galleryImages.length && galleryImages.length > 0) {
      setActiveImage(0);
    }
  }, [activeImage, galleryImages.length]);

  useEffect(() => {
    if (subGalleryIndex >= verticalGalleryImages.length && verticalGalleryImages.length > 0) {
      setSubGalleryIndex(0);
    }
  }, [subGalleryIndex, verticalGalleryImages.length]);

  const specEntries = Object.entries(item?.specifications || {}).filter(([, value]) =>
    String(value || '').trim(),
  );

  const getSpecValue = (keywords: string[]): string => {
    const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
    const match = specEntries.find(([key]) =>
      lowerKeywords.some((keyword) => key.toLowerCase().includes(keyword)),
    );
    return match ? String(match[1]) : '';
  };

  const productCode = getSpecValue(['code', 'sku', 'article']);
  const finish = getSpecValue(['finish', 'surface']);
  const thickness = getSpecValue(['thickness']);
  const colours = parseDelimitedValues(getSpecValue(['colour', 'color'])).slice(0, 6);
  const applications = parseDelimitedValues(
    getSpecValue(['application', 'suitable', 'recommended use', 'use']),
  );
  const features = Array.from(
    new Set(
      (item?.features || [])
        .map((feature) => String(feature || '').trim())
        .filter(Boolean),
    ),
  );
  const edgeProfiles = parseDelimitedValues(getSpecValue(['edge']));
  const careInstructions = getSpecValue(['care']);

  const summarySpecs = specEntries
    .filter(
      ([key]) =>
        !['application', 'suitable', 'edge', 'care', 'feature'].some((word) =>
          key.toLowerCase().includes(word),
        ),
    )
    .slice(0, 4);

  const relatedProducts = siblings
    .filter((sibling) => sibling.slug !== productSlug)
    .slice(0, 4);

  const rangeLabel =
    breadcrumb.length >= 2 ? breadcrumb[breadcrumb.length - 2]?.title : 'Range';

  if (loading) return <CatalogLoading />;
  if (error || !item) {
    return (
      <div className="min-h-screen bg-stone-50 pt-32">
        <CatalogError onRetry={fetchData} />
      </div>
    );
  }

  return (
    <>
      <section className="pt-24 pb-4 bg-white border-b border-stone-100">
        <div className="container-custom">
          <div className="mb-8">
            <CatalogBreadcrumb items={breadcrumb} />
          </div>

          <Link
            href={`/catalog/${categorySlug}/${rangeSlug}`}
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {rangeLabel}
          </Link>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {galleryImages.length > 0 ? (
                <>
                  <motion.div
                    className="relative aspect-square bg-stone-100 overflow-hidden mb-4 cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      key={galleryImages[activeImage]}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={galleryImages[activeImage]}
                        alt={`${item.title} image ${activeImage + 1}`}
                        fill
                        priority={activeImage === 0}
                        sizes="(min-width: 1024px) 48vw, 100vw"
                        className="object-cover"
                        unoptimized={shouldUnoptimizeImage(galleryImages[activeImage])}
                      />
                    </motion.div>
                  </motion.div>

                  {thumbnailImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {thumbnailImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          onClick={() => setActiveImage(index)}
                          className={`relative aspect-square overflow-hidden border-2 transition-all ${
                            index === activeImage
                              ? 'border-stone-900'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${item.title} thumbnail ${index + 1}`}
                            fill
                            sizes="(min-width: 1024px) 12vw, 20vw"
                            className="object-cover"
                            unoptimized={shouldUnoptimizeImage(image)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-stone-100 flex items-center justify-center text-stone-400">
                  No Image Available
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-accent-gold/10 text-accent-gold text-xs font-medium tracking-wider uppercase">
                  {breadcrumb[0]?.title || 'Product'}
                </span>
                {productCode && <span className="text-stone-400 text-sm">Code: {productCode}</span>}
              </div>

              <h1 className="font-display text-4xl md:text-5xl text-stone-900 mb-6">
                {item.title}
              </h1>

              {item.description && (
                <p className="text-stone-600 leading-relaxed whitespace-pre-line mb-8">
                  {item.description}
                </p>
              )}

              {(finish || thickness || colours.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {finish && (
                    <div className="p-4 bg-stone-50">
                      <span className="text-xs text-stone-500 uppercase tracking-wider">Finish</span>
                      <p className="font-medium text-stone-900 mt-1">{finish}</p>
                    </div>
                  )}

                  {thickness && (
                    <div className="p-4 bg-stone-50">
                      <span className="text-xs text-stone-500 uppercase tracking-wider">Thickness</span>
                      <p className="font-medium text-stone-900 mt-1">{thickness}</p>
                    </div>
                  )}

                  {colours.length > 0 && (
                    <div className="p-4 bg-stone-50 col-span-2">
                      <span className="text-xs text-stone-500 uppercase tracking-wider">Colours</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                         {colours.map((colour) => (
                           <span
                             key={colour}
                             className="px-2 py-0.5 bg-white border border-stone-200 text-stone-700 text-xs capitalize"
                           >
                             {colour}
                           </span>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {applications.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-xl text-stone-900 mb-3">Suitable Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {applications.map((application) => (
                      <span
                        key={application}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-700 text-sm capitalize"
                      >
                        <Check className="w-3.5 h-3.5 text-accent-gold" />
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {features.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-xl text-stone-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                      <span
                        key={feature}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-700 text-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-accent-gold" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {edgeProfiles.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-xl text-stone-900 mb-3">Available Edge Profiles</h3>
                  <div className="flex flex-wrap gap-2">
                    {edgeProfiles.map((edge) => (
                      <span
                        key={edge}
                        className="px-3 py-1.5 border border-stone-200 text-stone-600 text-sm capitalize"
                      >
                        {edge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summarySpecs.length > 0 && (
                <div className="mb-8 p-5 bg-stone-50 border border-stone-100 space-y-3">
                  {summarySpecs.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 text-sm">
                      <span className="text-stone-500 uppercase tracking-wide">{key}</span>
                      <span className="text-stone-900 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-100">
                <button onClick={() => setShowEnquiry(true)} className="btn-gold flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enquire About This Stone
                </button>
                <a
                  href={toPhoneHref(config.phone)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>

          {verticalGalleryImages.length > 0 && (
            <div className="mt-12 pt-12 border-t border-stone-100">
              <div className="mb-6">
                <h3 className="font-display text-2xl text-stone-900">More Views</h3>
                <p className="text-stone-500 text-sm mt-1">Browse additional photos.</p>
              </div>

              <div className="relative">
                {verticalGalleryImages.length > 1 && (
                  <button
                    onClick={() =>
                      setSubGalleryIndex(
                        (subGalleryIndex - 1 + verticalGalleryImages.length) %
                          verticalGalleryImages.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-white"
                    aria-label="Previous gallery image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveImage(subGalleryIndex + thumbnailImages.length);
                    setLightboxOpen(true);
                  }}
                  className="group relative block w-full aspect-[16/9] overflow-hidden bg-stone-100"
                  aria-label={`Open gallery image ${subGalleryIndex + 1}`}
                >
                  <motion.div
                    key={`${verticalGalleryImages[subGalleryIndex]}-${subGalleryIndex}`}
                    initial={{ opacity: 0.35 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  >
                    <Image
                      src={verticalGalleryImages[subGalleryIndex]}
                      alt={`${item.title} gallery image ${subGalleryIndex + 1}`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized={shouldUnoptimizeImage(verticalGalleryImages[subGalleryIndex])}
                    />
                  </motion.div>
                </button>

                {verticalGalleryImages.length > 1 && (
                  <button
                    onClick={() => {
                      setSubGalleryIndex((subGalleryIndex + 1) % verticalGalleryImages.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-white"
                    aria-label="Next gallery image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {verticalGalleryImages.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {verticalGalleryImages.map((_, index) => (
                      <button
                        key={`gallery-dot-${index}`}
                        onClick={() => setSubGalleryIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          index === subGalleryIndex ? 'bg-stone-900' : 'bg-stone-300 hover:bg-stone-500'
                        }`}
                        aria-label={`Go to gallery image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {careInstructions && (
            <div className="mt-16 pt-16 border-t border-stone-100 max-w-3xl">
              <h3 className="font-display text-2xl text-stone-900 mb-6">Care Instructions</h3>
              <p className="text-stone-600 leading-relaxed">{careInstructions}</p>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section-padding bg-stone-50">
          <div className="container-custom">
            <h2 className="font-display text-3xl text-stone-900 mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => {
                const relatedImage =
                  related.imageMain || related.imageDetail || related.imageItem || '';

                return (
                  <Link
                    key={related._id}
                    href={`/catalog/${categorySlug}/${rangeSlug}/${related.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden mb-3">
                      {relatedImage ? (
                        <Image
                          src={relatedImage}
                          alt={related.title}
                          fill
                          sizes="(min-width: 1024px) 24vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized={shouldUnoptimizeImage(relatedImage)}
                        />
                      ) : (
                        <div className="absolute inset-0" />
                      )}
                    </div>
                    <span className="text-xs text-accent-gold uppercase tracking-wider">{rangeLabel}</span>
                    <h3 className="font-display text-lg text-stone-900 group-hover:text-accent-gold-dark transition-colors">
                      {related.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {showEnquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm"
            onClick={() => setShowEnquiry(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display text-2xl">Enquire About</h3>
                  <p className="text-accent-gold">{item.title}</p>
                </div>
                <button onClick={() => setShowEnquiry(false)} aria-label="Close enquiry modal">
                  <X className="w-6 h-6 text-stone-400 hover:text-stone-900" />
                </button>
              </div>

              <p className="text-stone-600 mb-6">
                Send us your project details and our team will get back to you with pricing,
                lead time, and sample availability.
              </p>

              <div className="space-y-3">
                <Link
                  href={`/contact?product=${encodeURIComponent(item.title)}`}
                  className="btn-gold w-full justify-center"
                  onClick={() => setShowEnquiry(false)}
                >
                  Go to Enquiry Form
                </Link>
                <a
                  href={toPhoneHref(config.phone)}
                  className="btn-secondary w-full justify-center"
                >
                  Call {config.phone}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-6 right-6 text-white/60 hover:text-white"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage((activeImage - 1 + galleryImages.length) % galleryImages.length);
              }}
              className="absolute left-6 text-white/60 hover:text-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <div
              className="max-w-5xl max-h-[80vh] w-full mx-16"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative w-full h-[80vh]">
                <Image
                  src={galleryImages[activeImage]}
                  alt={`${item.title} full image ${activeImage + 1}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  unoptimized={shouldUnoptimizeImage(galleryImages[activeImage])}
                />
              </div>
            </div>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage((activeImage + 1) % galleryImages.length);
              }}
              className="absolute right-6 text-white/60 hover:text-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
