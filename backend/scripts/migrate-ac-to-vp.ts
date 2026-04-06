/**
 * Migration script: normalize product code prefix to PV in the database.
 *
 * What it changes:
 * - title: "Amazonite | AC1017" or "Amazonite | VP1017" → "Amazonite | PV1017"
 * - slug: "amazonite-or-ac1017" or "amazonite-or-vp1017" → "amazonite-or-pv1017"
 * - specifications.SKU: "AC1017" or "VP1017" → "PV1017"
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

function normalizeCodeToPvUpper(value: string): string {
  return value.replace(/\b(?:AC|VP)([-A-Z0-9]{2,})\b/g, 'PV$1');
}

function normalizeCodeToPvLower(value: string): string {
  return value.replace(/\b(?:ac|vp)([-a-z0-9]{2,})\b/g, 'pv$1');
}

async function migrateAcOrVpToPv() {
  const isDryRun = process.argv.includes('--dry-run');
  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  console.log(isDryRun ? '🔍 DRY RUN MODE' : '🚀 LIVE MODE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Find all products that still carry AC/VP prefixed codes in title/slug/SKU.
  const products = await CatalogModel.find({
    type: 'product',
    $or: [
      { title: { $regex: /\b(?:AC|VP)[-A-Z0-9]{2,}\b/i } },
      { slug: { $regex: /\b(?:ac|vp)[-a-z0-9]{2,}\b/i } },
      { 'specifications.SKU': { $regex: /\b(?:AC|VP)[-A-Z0-9]{2,}\b/i } },
    ],
  }).lean();

  console.log(`\n📦 Found ${products.length} products with AC/VP prefix\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const oldTitle = String(product.title || '');
    const oldSlug = String(product.slug || '');
    const oldSku = product.specifications?.SKU || '';

    const newTitle = normalizeCodeToPvUpper(oldTitle);
    const newSlug = normalizeCodeToPvLower(oldSlug);
    const newSku = oldSku ? normalizeCodeToPvUpper(oldSku) : '';

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

      if (newSku && newSku !== oldSku) {
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
  console.log(`⏭️  ${skipped} products skipped (already PV or no AC/VP prefix)`);
  console.log(`\n💡 Note: sourceUrl and descriptions are kept unchanged`);
  console.log(`   so AI search can still find products by AC code.`);

  await app.close();
  process.exit(0);
}

migrateAcOrVpToPv().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
