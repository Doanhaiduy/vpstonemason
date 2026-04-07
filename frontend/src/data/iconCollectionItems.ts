import { IconColourItem } from '@/types/gallery';

/**
 * Stone Collection Gallery items — mapped to real catalog products.
 *
 * URL format: /catalog/{category-slug}/{range-slug}/{product-slug}
 * Images: Using high-quality Unsplash photos as placeholders until
 *         AI-generated lifestyle/slab images are available.
 */
export const ICON_COLLECTION_ITEMS: IconColourItem[] = [
  {
    id: 'calacatta-pv6011',
    index: 1,
    surfaceLabel: 'Artscut Zero — Classic',
    code: 'PV6011',
    name: 'Calacatta',
    slabImage: '/images/gallery/slab-white.png',
    lifestyleImage: '/images/gallery/lifestyle-1.png',
    thumbnailImage:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    url: '/catalog/artscut-zero/standard/calacatta-pv6011',
  },
  {
    id: 'carrara-or-pv6012',
    index: 2,
    surfaceLabel: 'Artscut Zero — Classic',
    code: 'PV6012',
    name: 'Carrara',
    slabImage: '/images/gallery/slab-warm.png',
    lifestyleImage: '/images/gallery/lifestyle-2.png',
    thumbnailImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
    url: '/catalog/artscut-zero/standard/carrara-or-pv6012',
  },
  {
    id: 'statuario-pv6015',
    index: 3,
    surfaceLabel: 'Artscut Zero — Luxury',
    code: 'PV6015',
    name: 'Statuario',
    slabImage: '/images/gallery/slab-grey.png',
    lifestyleImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    thumbnailImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
    url: '/catalog/artscut-zero/luxury/statuario-pv6015',
  },
  {
    id: 'amazonite-or-pv1017',
    index: 4,
    surfaceLabel: 'Artscut Zero — Luxury Plus',
    code: 'PV1017',
    name: 'Amazonite',
    slabImage: '/images/gallery/slab-cream.png',
    lifestyleImage:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    thumbnailImage:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80',
    url: '/catalog/artscut-zero/luxury-plus/amazonite-or-pv1017',
  },
  {
    id: 'calacatta-gold-pv6016',
    index: 5,
    surfaceLabel: 'Artscut Zero — Luxury',
    code: 'PV6016',
    name: 'Calacatta Gold',
    slabImage: '/images/gallery/slab-white.png',
    lifestyleImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    thumbnailImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80',
    url: '/catalog/artscut-zero/luxury/calacatta-gold-pv6016',
  },
];
