import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const folder = typeof body?.folder === 'string' && body.folder.trim() !== ''
      ? body.folder.trim()
      : 'vpstonemason';

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}
