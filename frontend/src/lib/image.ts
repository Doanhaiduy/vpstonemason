const OPTIMIZABLE_HOSTS = new Set([
  'res.cloudinary.com',
  'images.unsplash.com',
  'www.ydlstone.com.au',
]);

export function shouldUnoptimizeImage(src: string): boolean {
  const value = String(src || '').trim();

  if (!value) {
    return true;
  }

  if (value.startsWith('/')) {
    return false;
  }

  if (value.startsWith('data:') || value.startsWith('blob:')) {
    return true;
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return !OPTIMIZABLE_HOSTS.has(hostname);
  } catch {
    return true;
  }
}