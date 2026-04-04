/**
 * Seed script to import YDL product data into the CatalogItem collection.
 *
 * Usage:
 *   ts-node scripts/seed-catalog.ts [input.json] [--incremental|--full-refresh]
 *
 * Reads ydl_products_quickcheck.json from the project scripts directory,
 * walks the tree recursively, and creates CatalogItem documents with
 * proper parentId references.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';
import slugify from 'slugify';

interface TreeNode {
  type: string;
  url: string;
  title: string;
  description: string;
  description_item: string;
  image_main: string;
  image_item: string;
  image_detail: string;
  image_sub: string[];
  children: TreeNode[];
  specifications?: Record<string, string>;
  additional_information?: Record<string, string>;
  features?: string[];
  product_meta?: {
    sku?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

interface SeedOptions {
  inputPath?: string;
  incremental: boolean;
}

function parseSeedArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    // Default to incremental so existing correct data is preserved.
    incremental: true,
  };

  for (const arg of args) {
    if (arg === '--full-refresh' || arg === '--mode=full') {
      options.incremental = false;
      continue;
    }

    if (arg === '--incremental' || arg === '--mode=incremental') {
      options.incremental = true;
      continue;
    }

    if (!arg.startsWith('--') && !options.inputPath) {
      options.inputPath = arg;
    }
  }

  return options;
}

function resolveInputJsonPath(inputPath?: string): string {
  // Priority: CLI arg -> AC crawler output -> legacy quickcheck file.
  if (inputPath) {
    return path.isAbsolute(inputPath)
      ? inputPath
      : path.resolve(process.cwd(), inputPath);
  }

  const acstonePath = path.resolve(
    __dirname,
    '../../scripts/scripts/acstone_products_hierarchy_v2.json',
  );
  if (fs.existsSync(acstonePath)) {
    return acstonePath;
  }

  return path.resolve(__dirname, '../../scripts/ydl_products_quickcheck.json');
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const text = String(value || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }

  return result;
}

function normalizeSpecifications(
  primary?: Record<string, string>,
  fallback?: Record<string, string>,
): Record<string, string> {
  const merged = {
    ...(fallback || {}),
    ...(primary || {}),
  };

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    const normalizedKey = String(key || '').trim();
    const normalizedValue = String(value || '').trim();
    if (!normalizedKey || !normalizedValue) continue;
    result[normalizedKey] = normalizedValue;
  }

  return result;
}

function hasSkuLikeKey(specs: Record<string, string>): boolean {
  return Object.keys(specs).some((key) => /sku|code|article/i.test(key));
}

function normalizeString(value: unknown): string {
  return String(value || '').trim();
}

function normalizeSourceUrl(value: unknown): string {
  return normalizeString(value).toLowerCase();
}

function toObjectIdOrNull(value: unknown): Types.ObjectId | null {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value;

  const normalized = normalizeString(value);
  if (!normalized) return null;
  if (!Types.ObjectId.isValid(normalized)) return null;

  return new Types.ObjectId(normalized);
}

function getRangeKey(parentId: any, node: TreeNode): string {
  const normalizedTitle = slugify(node.title || '', {
    lower: true,
    strict: true,
    trim: true,
  });
  const normalizedSubtitle = slugify(node.description_item || node.title || '', {
    lower: true,
    strict: true,
    trim: true,
  });
  return `${String(parentId || 'root')}::${normalizedTitle}::${normalizedSubtitle}`;
}

function getNodeKey(node: TreeNode): string {
  const normalizedTitle = slugify(node.title || '', {
    lower: true,
    strict: true,
    trim: true,
  });
  return `${node.type}:${normalizedTitle}`;
}

async function seedCatalog() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  const options = parseSeedArgs();
  if (options.incremental) {
    console.log('♻️  Incremental seed mode: only missing items will be inserted.');
  } else {
    console.log('🗑️  Clearing existing catalog items (full refresh mode)...');
    await CatalogModel.deleteMany({});
  }

  // Read JSON data
  const jsonPath = resolveInputJsonPath(options.inputPath);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Seed input file not found: ${jsonPath}`);
  }

  console.log(`📄 Reading seed data from: ${jsonPath}`);
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);
  const tree: TreeNode = data.tree;

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalReused = 0;
  const seenProductUrls = new Set<string>();
  const rangeByParentAndTitle = new Map<string, string>();
  const reservedSlugs = new Set<string>();
  const existingProductUrls = new Set<string>();
  const existingRangesByParentAndTitle = new Map<
    string,
    Array<{
      id: string;
      subtitleKey: string;
    }>
  >();
  const claimedRangeIdsByParentAndTitle = new Map<string, Set<string>>();
  const existingProductUrlsByRangeId = new Map<string, Set<string>>();
  const existingProductByUrl = new Map<
    string,
    {
      id: string;
      parentId: string;
    }
  >();

  if (options.incremental) {
    const existingDocs = await CatalogModel.find({})
      .select('_id slug sourceUrl type parentId title descriptionItem')
      .lean();

    for (const doc of existingDocs) {
      if (doc.slug) {
        reservedSlugs.add(String(doc.slug));
      }

      if (doc.type === 'product' && doc.sourceUrl) {
        const normalizedProductUrl = normalizeSourceUrl(doc.sourceUrl);
        existingProductUrls.add(normalizedProductUrl);
        existingProductByUrl.set(normalizedProductUrl, {
          id: String(doc._id),
          parentId: String(doc.parentId || ''),
        });

        if (doc.parentId) {
          const rangeId = String(doc.parentId);
          if (!existingProductUrlsByRangeId.has(rangeId)) {
            existingProductUrlsByRangeId.set(rangeId, new Set<string>());
          }
          existingProductUrlsByRangeId
            .get(rangeId)
            ?.add(normalizedProductUrl);
        }
      }

      if (doc.type === 'range') {
        const parentKey = String(doc.parentId || 'root');
        const titleKey = slugify(String(doc.title || ''), {
          lower: true,
          strict: true,
          trim: true,
        });
        const subtitleKey = slugify(
          normalizeString(doc.descriptionItem || doc.title),
          {
            lower: true,
            strict: true,
            trim: true,
          },
        );

        const mapKey = `${parentKey}::${titleKey}`;
        if (!existingRangesByParentAndTitle.has(mapKey)) {
          existingRangesByParentAndTitle.set(mapKey, []);
        }

        existingRangesByParentAndTitle.get(mapKey)?.push({
          id: String(doc._id),
          subtitleKey,
        });
      }
    }
  }

  function markRangeAsClaimed(mapKey: string, rangeId: string): void {
    if (!claimedRangeIdsByParentAndTitle.has(mapKey)) {
      claimedRangeIdsByParentAndTitle.set(mapKey, new Set<string>());
    }
    claimedRangeIdsByParentAndTitle.get(mapKey)?.add(rangeId);
  }

  async function resolveExistingCategoryId(node: TreeNode): Promise<string | null> {
    const sourceUrl = normalizeString(node.url);
    if (sourceUrl) {
      const bySource = await CatalogModel.findOne({
        type: 'category',
        sourceUrl,
      })
        .select('_id')
        .lean();
      const bySourceDoc = bySource as { _id?: unknown } | null;

      if (bySourceDoc?._id) {
        return String(bySourceDoc._id);
      }
    }

    const bySlug = await CatalogModel.findOne({
      type: 'category',
      slug: slugify(node.title || '', { lower: true, strict: true, trim: true }),
    })
      .select('_id')
      .lean();
    const bySlugDoc = bySlug as { _id?: unknown } | null;

    if (bySlugDoc?._id) {
      return String(bySlugDoc._id);
    }

    const byTitle = await CatalogModel.findOne({
      type: 'category',
      title: node.title,
    })
      .select('_id')
      .lean();
    const byTitleDoc = byTitle as { _id?: unknown } | null;

    return byTitleDoc?._id ? String(byTitleDoc._id) : null;
  }

  async function resolveExistingRangeId(
    node: TreeNode,
    parentId: any,
  ): Promise<string | null> {
    const titleKey = slugify(node.title || '', {
      lower: true,
      strict: true,
      trim: true,
    });
    const subtitleKey = slugify(node.description_item || node.title || '', {
      lower: true,
      strict: true,
      trim: true,
    });
    const mapKey = `${String(parentId || 'root')}::${titleKey}`;
    const candidates = existingRangesByParentAndTitle.get(mapKey) || [];
    const claimedIds = claimedRangeIdsByParentAndTitle.get(mapKey) || new Set<string>();

    if (candidates.length === 0) {
      return null;
    }

    const exact = candidates.find((candidate) => candidate.subtitleKey === subtitleKey);
    if (exact?.id) {
      markRangeAsClaimed(mapKey, exact.id);
      return exact.id;
    }

    const incomingProductUrls = new Set(
      (node.children || [])
        .filter((child) => child.type === 'product')
        .map((child) => normalizeSourceUrl(child.url))
        .filter(Boolean),
    );

    if (incomingProductUrls.size > 0) {
      for (const candidate of candidates) {
        if (claimedIds.has(candidate.id)) {
          continue;
        }

        const existingChildren = existingProductUrlsByRangeId.get(candidate.id);
        const hasOverlap =
          !!existingChildren &&
          Array.from(incomingProductUrls).some((url) => existingChildren.has(url));

        if (!hasOverlap) {
          continue;
        }

        const expectedDescriptionItem = normalizeString(
          node.description_item || node.title,
        );
        if (expectedDescriptionItem && candidate.subtitleKey !== subtitleKey) {
          await CatalogModel.updateOne(
            { _id: candidate.id },
            { $set: { descriptionItem: expectedDescriptionItem } },
          );
          candidate.subtitleKey = subtitleKey;
        }

        markRangeAsClaimed(mapKey, candidate.id);
        return candidate.id;
      }
    }

    return null;
  }

  /**
   * Recursively walk the tree and create CatalogItem documents.
   * Returns the created document's _id so children can reference it.
   */
  async function walkTree(
    node: TreeNode,
    parentId: any,
    order: number,
  ): Promise<void> {
    // Skip the root 'home' node — start with its children
    if (node.type === 'home') {
      const seenTopLevel = new Set<string>();
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const key = getNodeKey(child);
        if (seenTopLevel.has(key)) {
          totalSkipped++;
          console.log(`⚠️  Skipping duplicate top-level node: ${child.title}`);
          continue;
        }
        seenTopLevel.add(key);
        await walkTree(child, null, i);
      }
      return;
    }

    const sourceUrl = String(node.url || '').trim();

    if (node.type === 'category' && options.incremental) {
      const existingCategoryId = await resolveExistingCategoryId(node);
      if (existingCategoryId) {
        totalReused++;
        console.log(`♻️  Reusing existing category: ${node.title}`);

        const seenChildren = new Set<string>();
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const childKey = `${child.type}:${child.url || child.title}`;
          if (seenChildren.has(childKey)) continue;
          seenChildren.add(childKey);
          await walkTree(child, existingCategoryId, i);
        }
        return;
      }
    }

    if (node.type === 'range') {
      const rangeKey = getRangeKey(parentId, node);
      const rangeTitleMapKey = `${String(parentId || 'root')}::${slugify(node.title || '', {
        lower: true,
        strict: true,
        trim: true,
      })}`;

      let existingRangeId = rangeByParentAndTitle.get(rangeKey);
      if (!existingRangeId && options.incremental) {
        existingRangeId = await resolveExistingRangeId(node, parentId) || undefined;
        if (existingRangeId) {
          rangeByParentAndTitle.set(rangeKey, existingRangeId);
        }
      }

      if (existingRangeId) {
        markRangeAsClaimed(rangeTitleMapKey, existingRangeId);
        totalReused++;
        console.log(
          `♻️  Reusing existing range: ${node.title}${
            node.description_item ? ` [${node.description_item}]` : ''
          }`,
        );

        const seenChildren = new Set<string>();
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const childKey = `${child.type}:${child.url || child.title}`;
          if (seenChildren.has(childKey)) continue;
          seenChildren.add(childKey);
          await walkTree(child, existingRangeId, i);
        }
        return;
      }
    }

    if (node.type === 'product' && sourceUrl) {
      const normalizedSourceUrl = normalizeSourceUrl(sourceUrl);

      if (seenProductUrls.has(normalizedSourceUrl)) {
        totalSkipped++;
        console.log(`⚠️  Skipping duplicate product URL: ${sourceUrl}`);
        return;
      }

      seenProductUrls.add(normalizedSourceUrl);

      if (options.incremental && existingProductUrls.has(normalizedSourceUrl)) {
        const existingProduct = existingProductByUrl.get(normalizedSourceUrl);
        const nextParentId = String(parentId || '');

        if (
          existingProduct &&
          nextParentId &&
          existingProduct.parentId !== nextParentId
        ) {
          const nextParentObjectId = toObjectIdOrNull(nextParentId);
          await CatalogModel.updateOne(
            { _id: existingProduct.id },
            { $set: { parentId: nextParentObjectId } },
          );

          if (existingProduct.parentId) {
            existingProductUrlsByRangeId
              .get(existingProduct.parentId)
              ?.delete(normalizedSourceUrl);
          }
          if (!existingProductUrlsByRangeId.has(nextParentId)) {
            existingProductUrlsByRangeId.set(nextParentId, new Set<string>());
          }
          existingProductUrlsByRangeId
            .get(nextParentId)
            ?.add(normalizedSourceUrl);

          existingProduct.parentId = nextParentId;
        }

        totalReused++;
        return;
      }
    }

    // Generate a unique slug
    const baseSlugRaw = slugify(node.title, { lower: true, strict: true });
    const baseSlug = baseSlugRaw || node.type;

    // Ensure uniqueness by checking existing
    let slug = baseSlug;
    let suffix = 1;
    while (reservedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }
    reservedSlugs.add(slug);

    const normalizedSpecifications =
      node.type === 'product'
        ? normalizeSpecifications(node.specifications, node.additional_information)
        : {};

    if (
      node.type === 'product' &&
      node.product_meta?.sku &&
      !hasSkuLikeKey(normalizedSpecifications)
    ) {
      normalizedSpecifications.SKU = String(node.product_meta.sku).trim();
    }

    const normalizedFeatures =
      node.type === 'product'
        ? normalizeStringArray(
            (node.features && node.features.length > 0
              ? node.features
              : node.product_meta?.tags) || [],
          )
        : [];

    const doc = await CatalogModel.create({
      type: node.type,
      title: node.title,
      slug,
      description: node.description || '',
      descriptionItem: node.description_item || '',
      imageMain: node.image_main || '',
      imageItem: node.image_item || '',
      imageDetail: node.image_detail || '',
      imageSub: node.image_sub || [],
      parentId: toObjectIdOrNull(parentId),
      sourceUrl,
      specifications: normalizedSpecifications,
      features: normalizedFeatures,
      displayOrder: order,
      isActive: true,
    });

    if (node.type === 'range') {
      const rangeKey = getRangeKey(parentId, node);
      rangeByParentAndTitle.set(rangeKey, doc._id.toString());

      const parentKey = String(parentId || 'root');
      const titleKey = slugify(node.title || '', {
        lower: true,
        strict: true,
        trim: true,
      });
      const subtitleKey = slugify(node.description_item || node.title || '', {
        lower: true,
        strict: true,
        trim: true,
      });
      const mapKey = `${parentKey}::${titleKey}`;
      if (!existingRangesByParentAndTitle.has(mapKey)) {
        existingRangesByParentAndTitle.set(mapKey, []);
      }
      existingRangesByParentAndTitle.get(mapKey)?.push({
        id: doc._id.toString(),
        subtitleKey,
      });
      markRangeAsClaimed(mapKey, doc._id.toString());
    }

    if (node.type === 'product' && sourceUrl) {
      const normalizedProductUrl = normalizeSourceUrl(sourceUrl);
      existingProductUrls.add(normalizedProductUrl);
      existingProductByUrl.set(normalizedProductUrl, {
        id: doc._id.toString(),
        parentId: String(parentId || ''),
      });

      const rangeId = String(parentId || '');
      if (rangeId) {
        if (!existingProductUrlsByRangeId.has(rangeId)) {
          existingProductUrlsByRangeId.set(rangeId, new Set<string>());
        }
        existingProductUrlsByRangeId
          .get(rangeId)
          ?.add(normalizedProductUrl);
      }
    }

    totalCreated++;
    const indent = node.type === 'category' ? '' : node.type === 'range' ? '  ' : '    ';
    console.log(`${indent}✅ [${node.type}] ${node.title} → slug: ${slug}`);

    // Recurse into children
    if (node.children && node.children.length > 0) {
      const seenChildren = new Set<string>();
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childKey = `${child.type}:${child.url || child.title}`;
        if (seenChildren.has(childKey)) {
          totalSkipped++;
          continue;
        }
        seenChildren.add(childKey);
        await walkTree(child, doc._id, i);
      }
    }
  }

  console.log('\n🌱 Seeding catalog from YDL data...\n');
  await walkTree(tree, null, 0);

  console.log(
    `\n🎉 Catalog seed complete! ${totalCreated} items created, ${totalSkipped} duplicate nodes skipped, ${totalReused} existing nodes reused.\n`,
  );

  await app.close();
  process.exit(0);
}

seedCatalog().catch((err) => {
  console.error('❌ Catalog seed failed:', err);
  process.exit(1);
});
