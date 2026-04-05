import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface CliOptions {
  inputPath: string;
  apply: boolean;
  skipUpload: boolean;
  uploadOnly: boolean;
  uploadInDryRun: boolean;
  strict: boolean;
  concurrency: number;
  limit?: number;
  hostFilter: string;
  folder: string;
  mappingFile: string;
}

interface SeedItem {
  type?: string;
  url?: string;
  image_main?: string;
  image_item?: string;
  image_detail?: string;
  image_sub?: string[];
  children?: SeedItem[];
}

interface SeedFile {
  tree?: SeedItem;
  items_flat?: SeedItem[];
}

interface MappingEntry {
  secureUrl: string;
  publicId: string;
  uploadedAt: string;
}

interface MappingFileData {
  generatedAt: string;
  cloudinaryFolder: string;
  mappings: Record<string, MappingEntry>;
}

interface CatalogDoc {
  _id: any;
  slug?: string;
  type?: string;
  sourceUrl?: string;
  imageMain?: string;
  imageItem?: string;
  imageDetail?: string;
  imageSub?: string[];
}

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  '../../scripts/scripts/acstone_products_hierarchy_v2.json',
);

const DEFAULT_MAPPING_PATH = path.resolve(
  __dirname,
  'output/cloudinary/acstone-url-map.json',
);

function normalizePathArg(input: string): string {
  if (path.isAbsolute(input)) return input;
  return path.resolve(process.cwd(), input);
}

function parseNumberArg(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);

  const options: CliOptions = {
    inputPath: DEFAULT_INPUT_PATH,
    apply: false,
    skipUpload: false,
    uploadOnly: false,
    uploadInDryRun: false,
    strict: true,
    concurrency: 3,
    hostFilter: 'acstone.com.au',
    folder: 'vpstonemason/catalog/acstone',
    mappingFile: DEFAULT_MAPPING_PATH,
  };

  for (const arg of args) {
    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.apply = false;
      continue;
    }

    if (arg === '--skip-upload') {
      options.skipUpload = true;
      continue;
    }

    if (arg === '--upload-only') {
      options.uploadOnly = true;
      continue;
    }

    if (arg === '--upload-in-dry-run') {
      options.uploadInDryRun = true;
      continue;
    }

    if (arg === '--no-strict') {
      options.strict = false;
      continue;
    }

    if (arg.startsWith('--input=')) {
      options.inputPath = normalizePathArg(arg.slice('--input='.length));
      continue;
    }

    if (arg.startsWith('--mapping=')) {
      options.mappingFile = normalizePathArg(arg.slice('--mapping='.length));
      continue;
    }

    if (arg.startsWith('--folder=')) {
      const value = arg.slice('--folder='.length).trim();
      if (!value) throw new Error('Cloudinary folder cannot be empty');
      options.folder = value;
      continue;
    }

    if (arg.startsWith('--host=')) {
      const value = arg.slice('--host='.length).trim().toLowerCase();
      if (!value) throw new Error('Host filter cannot be empty');
      options.hostFilter = value;
      continue;
    }

    if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseNumberArg(
        arg.slice('--concurrency='.length),
        'concurrency',
      );
      continue;
    }

    if (arg.startsWith('--limit=')) {
      options.limit = parseNumberArg(arg.slice('--limit='.length), 'limit');
      continue;
    }

    if (!arg.startsWith('--')) {
      options.inputPath = normalizePathArg(arg);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeUrl(raw: unknown): string {
  const value = String(raw || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return value;
  } catch {
    return '';
  }
}

function isCloudinaryUrl(urlValue: string): boolean {
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase();
    return hostname === 'res.cloudinary.com' || hostname.endsWith('.cloudinary.com');
  } catch {
    return false;
  }
}

function isAllowedSourceHost(urlValue: string, hostFilter: string): boolean {
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase();
    return hostname === hostFilter || hostname.endsWith(`.${hostFilter}`);
  } catch {
    return false;
  }
}

function normalizeImageArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const unique = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = normalizeUrl(value);
    if (!normalized || unique.has(normalized)) continue;
    unique.add(normalized);
    output.push(normalized);
  }

  return output;
}

function collectItemsFromTree(node: SeedItem | undefined, acc: SeedItem[]): void {
  if (!node) return;

  if (node.type && node.type !== 'home' && node.url) {
    acc.push(node);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectItemsFromTree(child, acc);
    }
  }
}

function readSeedItems(seedData: SeedFile): SeedItem[] {
  if (Array.isArray(seedData.items_flat) && seedData.items_flat.length > 0) {
    return seedData.items_flat.filter((item) => item?.type && item.type !== 'home');
  }

  const fromTree: SeedItem[] = [];
  collectItemsFromTree(seedData.tree, fromTree);
  return fromTree;
}

function extractUniqueImageUrls(items: SeedItem[], hostFilter: string): string[] {
  const uniqueUrls = new Set<string>();

  for (const item of items) {
    const candidates = [
      normalizeUrl(item.image_main),
      normalizeUrl(item.image_item),
      normalizeUrl(item.image_detail),
      ...normalizeImageArray(item.image_sub),
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      if (isCloudinaryUrl(candidate)) continue;
      if (!isAllowedSourceHost(candidate, hostFilter)) continue;
      uniqueUrls.add(candidate);
    }
  }

  return Array.from(uniqueUrls);
}

function sha1(value: string): string {
  return createHash('sha1').update(value).digest('hex');
}

function toCloudinaryPublicId(sourceUrl: string): string {
  let fileName = 'image';

  try {
    const parsed = new URL(sourceUrl);
    const rawName = path.posix.basename(parsed.pathname || '').trim();
    const withoutExt = rawName.replace(/\.[a-zA-Z0-9]{1,8}$/g, '');
    if (withoutExt) {
      fileName = withoutExt;
    }
  } catch {
    // Keep default fileName.
  }

  const slug = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';
  const suffix = sha1(sourceUrl).slice(0, 12);

  return `${slug}-${suffix}`;
}

function inferExtension(contentType: string, sourceUrl: string): string {
  const normalizedType = contentType.toLowerCase();
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };

  if (map[normalizedType]) {
    return map[normalizedType];
  }

  try {
    const parsed = new URL(sourceUrl);
    const ext = path.posix.extname(parsed.pathname || '').replace('.', '').toLowerCase();
    if (/^[a-z0-9]{1,8}$/.test(ext)) {
      return ext;
    }
  } catch {
    // Keep default extension.
  }

  return 'jpg';
}

function buildCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return sha1(`${toSign}${apiSecret}`);
}

async function fetchWithTimeout(
  urlValue: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(urlValue, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadImageToCloudinary(
  sourceUrl: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  folder: string,
): Promise<{ secureUrl: string; publicId: string }> {
  const downloadRes = await fetchWithTimeout(sourceUrl, { method: 'GET' }, 120000);
  if (!downloadRes.ok) {
    throw new Error(`Failed to download image: HTTP ${downloadRes.status}`);
  }

  const contentType = (downloadRes.headers.get('content-type') || 'image/jpeg')
    .split(';')[0]
    .trim();

  if (!contentType.startsWith('image/') && contentType !== 'application/octet-stream') {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  const imageBuffer = Buffer.from(await downloadRes.arrayBuffer());
  if (imageBuffer.length === 0) {
    throw new Error('Downloaded image is empty');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = toCloudinaryPublicId(sourceUrl);

  const paramsToSign: Record<string, string> = {
    folder,
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  };

  const signature = buildCloudinarySignature(paramsToSign, apiSecret);

  const extension = inferExtension(contentType, sourceUrl);
  const form = new FormData();
  form.append(
    'file',
    new Blob([imageBuffer], { type: contentType }),
    `${publicId}.${extension}`,
  );
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('overwrite', 'true');
  form.append('public_id', publicId);
  form.append('signature', signature);

  const uploadRes = await fetchWithTimeout(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: form,
    },
    120000,
  );

  const uploadPayload = (await uploadRes.json().catch(() => ({}))) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!uploadRes.ok) {
    const reason = uploadPayload.error?.message || `HTTP ${uploadRes.status}`;
    throw new Error(`Cloudinary upload failed: ${reason}`);
  }

  if (!uploadPayload.secure_url || !uploadPayload.public_id) {
    throw new Error('Cloudinary upload response missing secure_url/public_id');
  }

  return {
    secureUrl: uploadPayload.secure_url,
    publicId: uploadPayload.public_id,
  };
}

function readMappingFile(mappingPath: string, folder: string): MappingFileData {
  if (!fs.existsSync(mappingPath)) {
    return {
      generatedAt: new Date().toISOString(),
      cloudinaryFolder: folder,
      mappings: {},
    };
  }

  const raw = fs.readFileSync(mappingPath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<MappingFileData>;
  return {
    generatedAt: new Date().toISOString(),
    cloudinaryFolder: folder,
    mappings: parsed.mappings || {},
  };
}

function writeMappingFile(mappingPath: string, data: MappingFileData): void {
  ensureDirectory(path.dirname(mappingPath));
  fs.writeFileSync(mappingPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

async function mapWithConcurrency<T>(
  values: T[],
  limit: number,
  worker: (value: T, index: number) => Promise<void>,
): Promise<void> {
  if (values.length === 0) return;

  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const current = cursor;
      cursor += 1;
      await worker(values[current], current);
    }
  });

  await Promise.all(workers);
}

function replaceIfMapped(
  value: string,
  mappings: Record<string, MappingEntry>,
): { nextValue: string; changed: boolean; missingSource?: string } {
  const current = normalizeUrl(value);
  if (!current) {
    return { nextValue: value || '', changed: false };
  }

  const mapped = mappings[current];
  if (!mapped) {
    return { nextValue: value || '', changed: false, missingSource: current };
  }

  if (mapped.secureUrl === current) {
    return { nextValue: value || '', changed: false };
  }

  return { nextValue: mapped.secureUrl, changed: true };
}

async function runMigration(): Promise<void> {
  const options = parseCliArgs();

  if (!fs.existsSync(options.inputPath)) {
    throw new Error(`Input JSON file not found: ${options.inputPath}`);
  }

  console.log(`📄 Input file: ${options.inputPath}`);
  console.log(`🧪 Mode: ${options.apply ? 'APPLY (writes DB)' : 'DRY-RUN (no DB writes)'}`);
  console.log(`☁️  Cloudinary folder: ${options.folder}`);

  const rawJson = fs.readFileSync(options.inputPath, 'utf-8');
  const seedData = JSON.parse(rawJson) as SeedFile;
  const seedItems = readSeedItems(seedData);

  if (seedItems.length === 0) {
    throw new Error('No seed items found in JSON file');
  }

  const uniqueImageUrls = extractUniqueImageUrls(seedItems, options.hostFilter);
  const scopedImageUrls =
    typeof options.limit === 'number' && options.limit > 0
      ? uniqueImageUrls.slice(0, options.limit)
      : uniqueImageUrls;

  console.log(`🧱 Parsed items: ${seedItems.length}`);
  console.log(`🖼️  Unique source images (host=${options.hostFilter}): ${uniqueImageUrls.length}`);
  if (typeof options.limit === 'number') {
    console.log(`🔢 Limited processing to first ${scopedImageUrls.length} images`);
  }

  const mappingData = readMappingFile(options.mappingFile, options.folder);

  const pendingUploads = scopedImageUrls.filter((urlValue) => !mappingData.mappings[urlValue]);
  console.log(`🗂️  Existing mapped URLs: ${scopedImageUrls.length - pendingUploads.length}`);
  console.log(`⬆️  Pending uploads: ${pendingUploads.length}`);

  const shouldUpload =
    !options.skipUpload &&
    pendingUploads.length > 0 &&
    (options.apply || options.uploadOnly || options.uploadInDryRun);

  if (shouldUpload) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
      );
    }

    const uploadErrors: Array<{ url: string; error: string }> = [];
    let uploadedCount = 0;

    await mapWithConcurrency(pendingUploads, options.concurrency, async (urlValue, index) => {
      try {
        const uploaded = await uploadImageToCloudinary(
          urlValue,
          cloudName,
          apiKey,
          apiSecret,
          options.folder,
        );
        mappingData.mappings[urlValue] = {
          secureUrl: uploaded.secureUrl,
          publicId: uploaded.publicId,
          uploadedAt: new Date().toISOString(),
        };

        uploadedCount += 1;
        if (uploadedCount % 10 === 0 || uploadedCount === pendingUploads.length) {
          console.log(
            `   Uploaded ${uploadedCount}/${pendingUploads.length} (${index + 1} processed)`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        uploadErrors.push({ url: urlValue, error: message });
        console.error(`   ❌ Upload failed for ${urlValue}: ${message}`);
      }
    });

    mappingData.generatedAt = new Date().toISOString();
    mappingData.cloudinaryFolder = options.folder;
    writeMappingFile(options.mappingFile, mappingData);

    console.log(`✅ Uploaded images: ${uploadedCount}`);
    if (uploadErrors.length > 0) {
      console.log(`⚠️  Upload failures: ${uploadErrors.length}`);
      if (options.strict) {
        throw new Error('Upload failures detected in strict mode; aborting before DB update.');
      }
    }
  } else {
    writeMappingFile(options.mappingFile, mappingData);
    if (options.skipUpload) {
      console.log('⏭️  Skipped uploads by flag (--skip-upload)');
    } else if (!options.apply && !options.uploadOnly && !options.uploadInDryRun) {
      console.log('⏭️  Dry-run upload is disabled (use --upload-in-dry-run to enable)');
    } else {
      console.log('⏭️  No pending uploads');
    }
  }

  if (options.uploadOnly) {
    console.log('🏁 Upload-only mode complete. No DB update performed.');
    console.log(`🗺️  Mapping file: ${options.mappingFile}`);
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const CatalogModel = app.get<Model<any>>(getModelToken('CatalogItem'));

  try {
    const scopedUrlSet = new Set(scopedImageUrls);
    const scopedUrlList = Array.from(scopedUrlSet);

    if (scopedUrlList.length === 0) {
      console.log('ℹ️  No eligible source images found. Nothing to update.');
      return;
    }

    const docs = (await CatalogModel.find({
      $or: [
        { imageMain: { $in: scopedUrlList } },
        { imageItem: { $in: scopedUrlList } },
        { imageDetail: { $in: scopedUrlList } },
        { imageSub: { $in: scopedUrlList } },
      ],
    })
      .select('_id slug type sourceUrl imageMain imageItem imageDetail imageSub')
      .lean()) as CatalogDoc[];

    console.log(`🧩 Matched catalog docs in DB: ${docs.length}`);

    const updates: Array<{ id: string; before: CatalogDoc; after: CatalogDoc }> = [];
    const missingMappings = new Set<string>();

    for (const doc of docs) {
      const imageMain = replaceIfMapped(doc.imageMain || '', mappingData.mappings);
      const imageItem = replaceIfMapped(doc.imageItem || '', mappingData.mappings);
      const imageDetail = replaceIfMapped(doc.imageDetail || '', mappingData.mappings);

      const imageSubBefore = Array.isArray(doc.imageSub) ? doc.imageSub : [];
      const imageSubAfter: string[] = [];
      let imageSubChanged = false;

      for (const subImage of imageSubBefore) {
        const replaced = replaceIfMapped(subImage, mappingData.mappings);
        imageSubAfter.push(replaced.nextValue);
        if (replaced.changed) imageSubChanged = true;
        if (replaced.missingSource && scopedUrlSet.has(replaced.missingSource)) {
          missingMappings.add(replaced.missingSource);
        }
      }

      for (const candidate of [imageMain, imageItem, imageDetail]) {
        if (candidate.missingSource && scopedUrlSet.has(candidate.missingSource)) {
          missingMappings.add(candidate.missingSource);
        }
      }

      const changed =
        imageMain.changed ||
        imageItem.changed ||
        imageDetail.changed ||
        imageSubChanged;

      if (!changed) continue;

      const nextDoc: CatalogDoc = {
        ...doc,
        imageMain: imageMain.nextValue,
        imageItem: imageItem.nextValue,
        imageDetail: imageDetail.nextValue,
        imageSub: imageSubAfter,
      };

      updates.push({
        id: String(doc._id),
        before: doc,
        after: nextDoc,
      });
    }

    console.log(`🛠️  Docs requiring image updates: ${updates.length}`);
    console.log(`❓ Missing URL mappings referenced by DB: ${missingMappings.size}`);

    const outputDir = path.resolve(__dirname, 'output/cloudinary');
    ensureDirectory(outputDir);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');

    const planPath = path.resolve(outputDir, `migration-plan-${stamp}.json`);
    fs.writeFileSync(
      planPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          inputPath: options.inputPath,
          apply: options.apply,
          skipUpload: options.skipUpload,
          uploadOnly: options.uploadOnly,
          strict: options.strict,
          hostFilter: options.hostFilter,
          folder: options.folder,
          mappingFile: options.mappingFile,
          scopedImages: scopedUrlList.length,
          updates: updates.map((item) => ({
            id: item.id,
            slug: item.before.slug || '',
            type: item.before.type || '',
            sourceUrl: item.before.sourceUrl || '',
            before: {
              imageMain: item.before.imageMain || '',
              imageItem: item.before.imageItem || '',
              imageDetail: item.before.imageDetail || '',
              imageSub: item.before.imageSub || [],
            },
            after: {
              imageMain: item.after.imageMain || '',
              imageItem: item.after.imageItem || '',
              imageDetail: item.after.imageDetail || '',
              imageSub: item.after.imageSub || [],
            },
          })),
          missingMappings: Array.from(missingMappings),
        },
        null,
        2,
      )}\n`,
      'utf-8',
    );

    console.log(`🧾 Migration plan saved: ${planPath}`);

    if (!options.apply) {
      console.log('🏁 Dry-run complete. No database changes were made.');
      return;
    }

    if (updates.length === 0) {
      console.log('🏁 Nothing to update. Database already in sync.');
      return;
    }

    if (missingMappings.size > 0 && options.strict) {
      throw new Error(
        'Missing mappings detected in strict mode. Resolve mappings first or rerun with --no-strict.',
      );
    }

    const backupPath = path.resolve(outputDir, `migration-backup-${stamp}.json`);
    fs.writeFileSync(
      backupPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          inputPath: options.inputPath,
          docs: updates.map((item) => item.before),
        },
        null,
        2,
      )}\n`,
      'utf-8',
    );
    console.log(`💾 Backup saved: ${backupPath}`);

    const session = await CatalogModel.db.startSession();
    try {
      session.startTransaction();

      const bulkOps = updates.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: {
              imageMain: item.after.imageMain || '',
              imageItem: item.after.imageItem || '',
              imageDetail: item.after.imageDetail || '',
              imageSub: item.after.imageSub || [],
            },
          },
        },
      }));

      const result = await CatalogModel.bulkWrite(bulkOps, { session });
      await session.commitTransaction();

      console.log(
        `✅ DB update complete. matched=${result.matchedCount} modified=${result.modifiedCount}`,
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } finally {
    await app.close();
  }

  console.log('🎉 Migration finished successfully.');
}

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});