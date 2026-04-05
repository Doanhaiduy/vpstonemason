const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const mongoose = require('mongoose');

function readEnvFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function sha1(value) {
  return createHash('sha1').update(value).digest('hex');
}

function normalizeUrl(raw) {
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

function isCloudinaryUrl(urlValue) {
  try {
    const hostname = new URL(urlValue).hostname.toLowerCase();
    return hostname === 'res.cloudinary.com' || hostname.endsWith('.cloudinary.com');
  } catch {
    return false;
  }
}

function buildCloudinarySignature(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return sha1(`${toSign}${apiSecret}`);
}

async function fetchWithTimeout(urlValue, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(urlValue, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadImageUrlToCloudinary(sourceUrl, slug, cloudinaryConfig) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const shortHash = sha1(sourceUrl).slice(0, 10);
  const publicId = `${slug}-${shortHash}`;

  const paramsToSign = {
    folder: cloudinaryConfig.folder,
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  };

  const signature = buildCloudinarySignature(paramsToSign, cloudinaryConfig.apiSecret);

  const form = new FormData();
  form.append('file', sourceUrl);
  form.append('api_key', cloudinaryConfig.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', cloudinaryConfig.folder);
  form.append('overwrite', 'true');
  form.append('public_id', publicId);
  form.append('signature', signature);

  const uploadRes = await fetchWithTimeout(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: 'POST',
      body: form,
    },
    120000,
  );

  const payload = await uploadRes.json().catch(() => ({}));

  if (!uploadRes.ok) {
    const reason = payload?.error?.message || `HTTP ${uploadRes.status}`;
    throw new Error(`Cloudinary upload failed for ${slug}: ${reason}`);
  }

  if (!payload.secure_url || !payload.public_id) {
    throw new Error(`Cloudinary upload missing secure_url/public_id for ${slug}`);
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
  };
}

async function updateRangeImagesViaCloudinary() {
  const envPath = path.resolve(__dirname, '../../.env.vps.prd');
  const env = readEnvFile(envPath);
  const mongoUri = env.MONGODB_URI || env.DATABASE_URL;
  const cloudName = String(env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(env.CLOUDINARY_API_SECRET || '').trim();

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI/DATABASE_URL in .env.vps.prd');
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET in .env.vps.prd',
    );
  }

  const cloudinaryConfig = {
    cloudName,
    apiKey,
    apiSecret,
    folder: 'vpstonemason/catalog/range-hero',
  };

  const updates = {
    'luxury-plus':
      'https://images.unsplash.com/photo-1772567732996-bc693c4a016c?w=2000&q=80&auto=format&fit=crop',
    luxury:
      'https://images.unsplash.com/photo-1772567733061-f7b44c0587b0?w=2000&q=80&auto=format&fit=crop',
    'natural-plus':
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format&fit=crop',
    natural:
      'https://images.unsplash.com/photo-1630699293676-74731c1a0e66?w=2000&q=80&auto=format&fit=crop',
    premium:
      'https://images.unsplash.com/photo-1774578341952-98cbacf88010?w=2000&q=80&auto=format&fit=crop',
    standard:
      'https://images.unsplash.com/photo-1722859179037-ca2c288380c9?w=2000&q=80&auto=format&fit=crop',
    'portofino-20':
      'https://images.unsplash.com/photo-1772567733035-edbd44fb56b1?w=2000&q=80&auto=format&fit=crop',
    'portofino-12':
      'https://images.unsplash.com/photo-1774578341941-cd784a0d41eb?w=2000&q=80&auto=format&fit=crop',
    'portofino-12-1':
      'https://images.unsplash.com/photo-1722942430079-f28164897d25?w=2000&q=80&auto=format&fit=crop',
    limited:
      'https://images.unsplash.com/photo-1772567732923-5ba1956dcd07?w=2000&q=80&auto=format&fit=crop',
    'ultra-thin-natural-surface':
      'https://images.unsplash.com/photo-1722858955108-7c64a34f9c34?w=2000&q=80&auto=format&fit=crop',
  };

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 20000,
  });

  const db = mongoose.connection.db;
  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const catalogCollectionName =
    collections.find((collection) => /catalog/i.test(collection.name))?.name ||
    'catalogitems';

  const catalog = db.collection(catalogCollectionName);
  const slugs = Object.keys(updates);

  const beforeRows = await catalog
    .find({ type: 'range', slug: { $in: slugs } })
    .project({ slug: 1, title: 1, imageMain: 1, imageItem: 1, parentId: 1 })
    .toArray();

  console.log(`Using collection: ${catalogCollectionName}`);
  console.log(`Found target ranges: ${beforeRows.length}`);

  const beforeBySlug = new Map(beforeRows.map((doc) => [doc.slug, doc]));
  const report = [];

  let uploadedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const slug of slugs) {
    const doc = beforeBySlug.get(slug);

    if (!doc) {
      console.log(`SKIP ${slug} (not found)`);
      continue;
    }

    const currentImageMain = normalizeUrl(doc.imageMain || '');
    const sourceImage = updates[slug];

    console.log(`Uploading source image for ${slug}...`);
    const uploaded = await uploadImageUrlToCloudinary(
      sourceImage,
      slug,
      cloudinaryConfig,
    );
    uploadedCount += 1;

    const nextImageMain = uploaded.secureUrl;

    if (currentImageMain === nextImageMain) {
      unchangedCount += 1;
      console.log(`NOCHANGE ${slug}`);
      report.push({
        slug,
        title: String(doc.title || ''),
        sourceImage,
        cloudinaryPublicId: uploaded.publicId,
        previousImageMain: currentImageMain,
        newImageMain: nextImageMain,
        changed: false,
      });
      continue;
    }

    const result = await catalog.updateOne(
      { _id: doc._id, type: 'range', slug },
      {
        $set: {
          imageMain: nextImageMain,
          updatedAt: new Date(),
        },
      },
    );
    updatedCount += result.modifiedCount > 0 ? 1 : 0;

    console.log(
      `UPDATED ${slug} matched=${result.matchedCount} modified=${result.modifiedCount}`,
    );

    report.push({
      slug,
      title: String(doc.title || ''),
      sourceImage,
      cloudinaryPublicId: uploaded.publicId,
      previousImageMain: currentImageMain,
      newImageMain: nextImageMain,
      changed: result.modifiedCount > 0,
    });
  }

  const afterRows = await catalog
    .find({ type: 'range', slug: { $in: slugs } })
    .project({ slug: 1, title: 1, imageMain: 1, imageItem: 1 })
    .toArray();

  console.log('After update snapshot:');
  for (const row of afterRows.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`${row.slug}`);
    console.log(`  imageMain=${row.imageMain}`);
    console.log(`  imageItem=${row.imageItem}`);
  }

  const outputDir = path.resolve(__dirname, 'output/cloudinary');
  fs.mkdirSync(outputDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.resolve(outputDir, `range-hero-update-${stamp}.json`);
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        folder: cloudinaryConfig.folder,
        totalTargets: slugs.length,
        uploadedCount,
        updatedCount,
        unchangedCount,
        report,
      },
      null,
      2,
    )}\n`,
    'utf-8',
  );

  console.log(`Report saved: ${reportPath}`);
  console.log(
    `Summary: targets=${slugs.length}, uploaded=${uploadedCount}, updated=${updatedCount}, unchanged=${unchangedCount}`,
  );

  await mongoose.disconnect();
}

updateRangeImagesViaCloudinary()
  .catch(async (error) => {
    console.error(error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });
