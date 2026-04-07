/**
 * Fix range images — replace duplicated slab images with Unsplash lifestyle photos.
 *
 * Problem: Every range has imageMain === imageItem (same slab Cloudinary URL).
 *          The range hero image should be an aspirational lifestyle photo (luxury kitchen,
 *          bathroom etc.) — NOT a product slab image.
 *
 * Solution: Assign curated Unsplash lifestyle images to each range's imageMain.
 *           Keep imageItem as the original slab thumbnail.
 *
 * Usage: npx ts-node scripts/fix-range-images.ts [--dry-run]
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

/* ═══════════════════════════════════════════════════════════════
   CURATED UNSPLASH LIFESTYLE IMAGES — one per range
   All images: luxury stone/marble homes, photorealistic interiors
   ═══════════════════════════════════════════════════════════════ */
const RANGE_LIFESTYLE_IMAGES: Record<
  string,
  { imageMain: string; imageDetail: string }
> = {
  'luxury-plus': {
    // Luxury kitchen with marble island
    imageMain:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format',
    // Close-up marble countertop detail
    imageDetail:
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=85&auto=format',
  },
  luxury: {
    // Modern white kitchen with stone benchtops
    imageMain:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85&auto=format',
    // Elegant bathroom vanity with marble
    imageDetail:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85&auto=format',
  },
  'natural-plus': {
    // Open-plan kitchen/living with stone island
    imageMain:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85&auto=format',
    // Bright kitchen with waterfall benchtop
    imageDetail:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=85&auto=format',
  },
  natural: {
    // Minimalist white kitchen stone surfaces
    imageMain:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=85&auto=format',
    // Soft grey bathroom with marble
    imageDetail:
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85&auto=format',
  },
  premium: {
    // Contemporary kitchen renovation
    imageMain:
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=85&auto=format',
    // Stone detail in modern space
    imageDetail:
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=85&auto=format',
  },
  standard: {
    // Family kitchen with clean stone surfaces
    imageMain:
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=85&auto=format',
    // Kitchen island with pendant lights
    imageDetail:
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=85&auto=format',
  },
  'portofino-20': {
    // Luxury living room with stone feature wall
    imageMain:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85&auto=format',
    // Spa-style bathroom with large format tiles
    imageDetail:
      'https://images.unsplash.com/photo-1600566753376-12c8ab7c5a38?w=1200&q=85&auto=format',
  },
  'portofino-12': {
    // Modern bathroom with porcelain surfaces
    imageMain:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85&auto=format',
    // Elegant foyer with stone flooring
    imageDetail:
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&q=85&auto=format',
  },
  'portofino-12-1': {
    // Outdoor entertainment area with stone
    imageMain:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85&auto=format',
    // Kitchen benchtop close-up
    imageDetail:
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200&q=85&auto=format',
  },
  limited: {
    // Penthouse kitchen with dramatic stone
    imageMain:
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=85&auto=format',
    // Reception desk / commercial stone surface
    imageDetail:
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&q=85&auto=format',
  },
  'ultra-thin-natural-surface': {
    // Modern architecture with thin stone panels
    imageMain:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85&auto=format',
    // Feature wall with large format thin surfaces
    imageDetail:
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200&q=85&auto=format',
  },
};

async function fixRangeImages() {
  const dryRun = process.argv.includes('--dry-run');
  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  console.log(`\n🔍 Range Image Fix — Unsplash Lifestyle Images ${dryRun ? '(DRY RUN)' : ''}\n`);

  const ranges = await CatalogModel.find({ type: 'range' }).lean().exec();
  let fixedCount = 0;
  let skippedCount = 0;

  for (const range of ranges) {
    const slug = range.slug as string;
    const lifestyleImages = RANGE_LIFESTYLE_IMAGES[slug];

    if (!lifestyleImages) {
      skippedCount++;
      console.log(`⚠️  ${range.title} (${slug}) — no lifestyle image mapped`);
      continue;
    }

    const currentMain = (range.imageMain || '').trim();
    const currentItem = (range.imageItem || '').trim();

    const updates: Record<string, string> = {};

    // Set imageMain to lifestyle photo (NOT a slab image)
    updates.imageMain = lifestyleImages.imageMain;

    // Set imageDetail to a different lifestyle photo
    updates.imageDetail = lifestyleImages.imageDetail;

    // Keep imageItem as original slab thumbnail (for card views)
    // If imageItem is same as imageMain (the dup problem), it stays as the slab image
    // which is correct — imageItem IS the product thumbnail

    if (!dryRun) {
      await CatalogModel.updateOne({ _id: range._id }, { $set: updates });
    }

    fixedCount++;
    console.log(`✅ ${range.title} (${slug}):`);
    console.log(`   imageMain  → ${lifestyleImages.imageMain.substring(0, 70)}...`);
    console.log(`   imageDetail → ${lifestyleImages.imageDetail.substring(0, 70)}...`);
    console.log(`   imageItem  → (kept as original slab: ${currentItem.substring(0, 50)}...)`);
  }

  console.log(
    `\n🎉 Done! Fixed: ${fixedCount}, Skipped: ${skippedCount}, Total: ${ranges.length}\n`,
  );

  await app.close();
  process.exit(0);
}

fixRangeImages().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});
