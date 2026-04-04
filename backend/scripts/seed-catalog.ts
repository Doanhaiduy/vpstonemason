/**
 * Seed script to import YDL product data into the CatalogItem collection.
 *
 * Usage: ts-node scripts/seed-catalog.ts
 *
 * Reads ydl_products_quickcheck.json from the project scripts directory,
 * walks the tree recursively, and creates CatalogItem documents with
 * proper parentId references.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
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
  features?: string[];
}

async function seedCatalog() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  console.log('🗑️  Clearing existing catalog items...');
  await CatalogModel.deleteMany({});

  // Read JSON data
  const jsonPath = path.resolve(
    __dirname,
    '../../scripts/ydl_products_quickcheck.json',
  );
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);
  const tree: TreeNode = data.tree;

  let totalCreated = 0;

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
      for (let i = 0; i < node.children.length; i++) {
        await walkTree(node.children[i], null, i);
      }
      return;
    }

    // Generate a unique slug
    let baseSlug = slugify(node.title, { lower: true, strict: true });

    // Ensure uniqueness by checking existing
    let slug = baseSlug;
    let suffix = 1;
    while (await CatalogModel.findOne({ slug }).exec()) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

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
      parentId: parentId || null,
      sourceUrl: node.url || '',
      specifications: node.specifications || {},
      features: node.features || [],
      displayOrder: order,
      isActive: true,
    });

    totalCreated++;
    const indent = node.type === 'category' ? '' : node.type === 'range' ? '  ' : '    ';
    console.log(`${indent}✅ [${node.type}] ${node.title} → slug: ${slug}`);

    // Recurse into children
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        await walkTree(node.children[i], doc._id, i);
      }
    }
  }

  console.log('\n🌱 Seeding catalog from YDL data...\n');
  await walkTree(tree, null, 0);

  console.log(`\n🎉 Catalog seed complete! ${totalCreated} items created.\n`);

  await app.close();
  process.exit(0);
}

seedCatalog().catch((err) => {
  console.error('❌ Catalog seed failed:', err);
  process.exit(1);
});
