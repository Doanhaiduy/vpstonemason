export type AdminPreviewType =
  | 'category'
  | 'range'
  | 'product'
  | 'blog'
  | 'contact';

interface AdminPreviewEnvelope<T> {
  type: AdminPreviewType;
  updatedAt: number;
  data: T;
}

const ADMIN_PREVIEW_STORAGE_KEY = 'vpstonemason-admin-preview-draft';

export function slugify(value: string, fallback = 'preview'): string {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || fallback;
}

export function setAdminPreviewDraft<T>(type: AdminPreviewType, data: T): void {
  if (typeof window === 'undefined') return;

  const envelope: AdminPreviewEnvelope<T> = {
    type,
    updatedAt: Date.now(),
    data,
  };

  localStorage.setItem(ADMIN_PREVIEW_STORAGE_KEY, JSON.stringify(envelope));
}

export function getAdminPreviewDraft<T>(type: AdminPreviewType): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(ADMIN_PREVIEW_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AdminPreviewEnvelope<T>;
    if (!parsed || parsed.type !== type) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function openAdminPreview<T>(
  path: string,
  type: AdminPreviewType,
  data: T,
): void {
  if (typeof window === 'undefined') return;

  setAdminPreviewDraft(type, data);

  const [pathname, search] = path.split('?');
  const params = new URLSearchParams(search || '');
  params.set('preview', '1');
  const target = `${pathname}?${params.toString()}`;

  window.open(target, '_blank', 'noopener,noreferrer');
}
