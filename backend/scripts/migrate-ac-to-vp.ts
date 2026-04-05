/**
 * Migration script: Change product code prefix from AC → VP in the database.
 *
 * What it changes:
 * - title: "Amazonite | AC1017" → "Amazonite | VP1017"
 * - slug: "amazonite-or-ac1017" → "amazonite-or-vp1017"
 * - specifications.SKU: "AC1017" → "VP1017"
 *
 * What it KEEPS:
 * - sourceUrl: unchanged (still points to acstone.com.au)
 * - description: unchanged (still mentions AC Stone for search-ability)
 * - All other fields unchanged
 *
 * Usage:
 *   npx ts-node scripts/migrate-ac-to-vp.ts [--dry-run]
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

async function migrateAcToVp() {
  const isDryRun = process.argv.includes('--dry-run');
  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  console.log(isDryRun ? '🔍 DRY RUN MODE' : '🚀 LIVE MODE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find all products with AC prefix in title
  const products = await CatalogModel.find({
    type: 'product',
    title: { $regex: /\bAC\d{3,5}\b/i },
  }).lean();

  console.log(`\n📦 Found ${products.length} products with AC prefix\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const oldTitle = String(product.title || '');
    const oldSlug = String(product.slug || '');
    const oldSku = product.specifications?.SKU || '';

    // Replace AC prefix with VP in title (e.g., AC1017 → VP1017)
    const newTitle = oldTitle.replace(/\bAC(\d{3,5})\b/gi, 'VP$1');
    // Replace in slug (e.g., ac1017 → vp1017)
    const newSlug = oldSlug.replace(/\bac(\d{3,5})\b/gi, 'vp$1');
    // Replace in SKU
    const newSku = oldSku ? oldSku.replace(/\bAC(\d{3,5})\b/gi, 'VP$1') : '';

    if (newTitle === oldTitle && newSlug === oldSlug) {
      skipped++;
      continue;
    }

    console.log(`  📝 ${oldTitle} → ${newTitle}`);
    console.log(`     slug: ${oldSlug} → ${newSlug}`);
    if (oldSku) console.log(`     SKU: ${oldSku} → ${newSku}`);

    if (!isDryRun) {
      const updateFields: Record<string, any> = {
        title: newTitle,
        slug: newSlug,
      };

      if (newSku) {
        updateFields['specifications.SKU'] = newSku;
      }

      await CatalogModel.updateOne(
        { _id: product._id },
        { $set: updateFields },
      );
    }

    updated++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ ${updated} products ${isDryRun ? 'would be' : ''} updated`);
  console.log(`⏭️  ${skipped} products skipped (no AC prefix)`);
  console.log(`\n💡 Note: sourceUrl and descriptions are kept unchanged`);
  console.log(`   so AI search can still find products by AC code.`);

  await app.close();
  process.exit(0);
}

migrateAcToVp().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
