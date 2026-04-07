'use client';

/**
 * IconCollectionGallery — Caesarstone-style "card stacking" gallery.
 *
 * APPROACH:
 * Each slide is a full-viewport div with `position: sticky; top: 0`.
 * As the user scrolls, each subsequent slide rises from below and physically
 * covers (wipes over) the previous one — creating the signature "card stacking"
 * effect seen on the Caesarstone ICON 2025 page.
 *
 * NO crossfade. NO opacity animation. Pure CSS sticky stacking.
 * Each slide contains its own slab background, lifestyle image, text & button.
 * They all move together as ONE unit when the slide scrolls/sticks.
 *
 * The outer container height = N × 100vh, giving the browser enough scroll
 * distance for each slide to enter, stick, and be covered by the next.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { IconColourItem } from '@/types/gallery';
import { ICON_COLLECTION_ITEMS } from '@/data/iconCollectionItems';
import styles from './IconCollectionGallery.module.css';

interface IconCollectionGalleryProps {
  items?: IconColourItem[];
}

export default function IconCollectionGallery({
  items = ICON_COLLECTION_ITEMS,
}: IconCollectionGalleryProps) {
  const totalItems = items.length;

  return (
    <section
      className={styles.galleryOuter}
      style={{ height: `${totalItems * 100}vh` }}
      id="icon-collection-gallery"
      aria-label="Stone Collection Gallery"
    >
      {items.map((item, idx) => (
        <GallerySlide
          key={item.id}
          item={item}
          index={idx}
          totalItems={totalItems}
        />
      ))}
    </section>
  );
}

/* ═══════════════════════════════════════
   Individual Gallery Slide
   Each slide is self-contained and sticky.
   ═══════════════════════════════════════ */

interface GallerySlideProps {
  item: IconColourItem;
  index: number;
  totalItems: number;
}

function GallerySlide({ item, index, totalItems }: GallerySlideProps) {
  const current = String(index + 1).padStart(2, '0');
  const total = String(totalItems).padStart(2, '0');

  return (
    <div
      className={styles.gallerySlide}
      data-slide-index={index}
      aria-label={`${item.name} - ${current} of ${total}`}
    >
      {/* Slab texture background */}
      <div className={styles.slabBg}>
        <Image
          src={item.slabImage}
          alt=""
          className={styles.slabBgImage}
          fill
          priority={index === 0}
          sizes="100vw"
          loading={index === 0 ? 'eager' : 'lazy'}
          aria-hidden="true"
          draggable={false}
        />
      </div>

      {/* Content layer */}
      <div className={styles.slideInner}>
        {/* Top row: label — code + name — counter */}
        <div className={styles.topRow}>
          <div className={styles.topLeft}>
            <p className={styles.surfaceLabel}>{item.surfaceLabel}</p>
          </div>

          <div className={styles.topCenter}>
            <p className={styles.stoneCode}>{item.code}</p>
            <h3 className={styles.stoneName}>{item.name}</h3>
          </div>

          <div className={styles.topRight}>
            <div className={styles.counter}>
              <span className={styles.counterCurrent}>{current}</span>
              <span className={styles.counterTotal}>/{total}</span>
            </div>
          </div>
        </div>

        {/* Center: lifestyle image */}
        <div className={styles.lifestyleCenter}>
          <div className={styles.lifestyleFrame}>
            <Image
              src={item.lifestyleImage}
              alt={`${item.name} lifestyle scene`}
              className={styles.lifestyleImage}
              fill
              priority={index === 0}
              sizes="(max-width: 480px) 85vw, (max-width: 768px) 70vw, 38vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        </div>

        {/* Bottom: CTA button */}
        <div className={styles.bottomRow}>
          <Link href={item.url} className={styles.viewColourBtn}>
            Explore This Stone
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
