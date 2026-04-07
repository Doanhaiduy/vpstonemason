const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pvstone.com.au';

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Build a BreadcrumbList JSON-LD object for structured data.
 * Always prepends "Home" as the first item.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const allItems = [{ name: 'Home', url: '/' }, ...items];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
