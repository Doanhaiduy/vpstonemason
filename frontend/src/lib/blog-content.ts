export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugifyHeading(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getUniqueId(baseId: string, used: Map<string, number>): string {
  const normalized = baseId || 'section';
  const count = used.get(normalized) || 0;
  used.set(normalized, count + 1);
  if (count === 0) return normalized;
  return `${normalized}-${count + 1}`;
}

export function processBlogHtmlWithHeadings(html: string): {
  htmlWithIds: string;
  headings: BlogHeading[];
} {
  if (!html || !html.trim()) {
    return { htmlWithIds: '', headings: [] };
  }

  const headingRegex = /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const usedIds = new Map<string, number>();
  const headings: BlogHeading[] = [];

  const htmlWithIds = html.replace(
    headingRegex,
    (_fullMatch, levelRaw: string, attrsRaw: string, innerHtml: string) => {
      const level = Number(levelRaw) as 2 | 3 | 4;
      const attrs = attrsRaw || '';
      const text = stripHtmlTags(innerHtml);
      const existingIdMatch = attrs.match(/\sid\s*=\s*(["'])(.*?)\1/i);

      const baseId =
        existingIdMatch?.[2] ||
        slugifyHeading(text) ||
        `section-${headings.length + 1}`;
      const uniqueId = getUniqueId(baseId, usedIds);

      let nextAttrs = attrs;
      if (existingIdMatch) {
        nextAttrs = attrs.replace(existingIdMatch[0], ` id=\"${uniqueId}\"`);
      } else {
        nextAttrs = `${attrs} id=\"${uniqueId}\"`;
      }

      headings.push({ id: uniqueId, text, level });
      return `<h${level}${nextAttrs}>${innerHtml}</h${level}>`;
    },
  );

  return { htmlWithIds, headings };
}

export function estimateReadTimeFromHtml(html: string): number {
  const words = stripHtmlTags(html)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
