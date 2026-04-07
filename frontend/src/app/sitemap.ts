import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pvstone.com.au';
const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  `${BASE_URL}/api`;
const SITEMAP_FETCH_TIMEOUT_MS = Number(
  process.env.SITEMAP_FETCH_TIMEOUT_MS || '8000',
);
const SHOULD_LOG_SITEMAP_WARNINGS =
  process.env.SITEMAP_LOG_WARNINGS === '1' ||
  process.env.NODE_ENV !== 'production';

export const revalidate = 3600;

type CatalogNode = {
  slug?: string;
  type?: 'category' | 'range' | 'product' | string;
  updatedAt?: string;
  children?: CatalogNode[];
};

type ListResponse<T> = {
  data?: T[];
};

function logSitemapWarning(message: string, error?: unknown) {
  if (!SHOULD_LOG_SITEMAP_WARNINGS) return;
  if (typeof error === 'undefined') {
    console.warn(message);
    return;
  }
  console.warn(message, error);
}

async function fetchJsonWithTimeout<T>(endpoint: string, fallback: T): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEMAP_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      logSitemapWarning(`Sitemap fetch failed (${response.status}) for ${endpoint}`);
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    logSitemapWarning(`Sitemap fetch timeout/failure for ${endpoint}`, error);
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeIsoDate(value: unknown, fallbackIso: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return fallbackIso;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackIso;
  }

  return parsed.toISOString();
}

const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/catalog', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/catalog/products', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/projects', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/showroom', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const pages: MetadataRoute.Sitemap = [];
  const seenUrls = new Set<string>();

  const addPage = ({
    url,
    lastModified,
    changeFrequency,
    priority,
  }: {
    url: string;
    lastModified: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }) => {
    if (seenUrls.has(url)) return;
    seenUrls.add(url);
    pages.push({ url, lastModified, changeFrequency, priority });
  };

  staticPages.forEach((page) => {
    addPage({
      url: `${BASE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  });

  try {
    const [tree, projectsRes, blogsRes] = await Promise.all([
      fetchJsonWithTimeout<CatalogNode[]>('/catalog/tree', []),
      fetchJsonWithTimeout<ListResponse<{ slug?: string; updatedAt?: string }>>(
        '/projects?limit=500',
        { data: [] },
      ),
      fetchJsonWithTimeout<
        ListResponse<{ slug?: string; updatedAt?: string; publishedAt?: string }>
      >('/blog-posts?limit=500', { data: [] }),
    ]);
    
    const traverseTree = (nodes: CatalogNode[], basePath: string) => {
      nodes.forEach((node) => {
        if (!node.slug) return;

        const currentPath = `${basePath}/${node.slug}`;

        let priority = 0.8;
        if (node.type === 'range') priority = 0.7;
        if (node.type === 'product') priority = 0.6;

        addPage({
          url: `${BASE_URL}${currentPath}`,
          lastModified: normalizeIsoDate(node.updatedAt, now),
          changeFrequency: 'weekly',
          priority,
        });

        if (node.children && node.children.length > 0) {
          traverseTree(node.children, currentPath);
        }
      });
    };

    traverseTree(tree, '/catalog');

    (projectsRes.data || []).forEach((project) => {
      if (!project.slug) return;
      addPage({
        url: `${BASE_URL}/projects/${project.slug}`,
        lastModified: normalizeIsoDate(project.updatedAt, now),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    (blogsRes.data || []).forEach((blog) => {
      if (!blog.slug) return;
      addPage({
        url: `${BASE_URL}/blog/${blog.slug}`,
        lastModified: normalizeIsoDate(blog.updatedAt || blog.publishedAt, now),
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
  } catch (error) {
    logSitemapWarning(
      'Sitemap generation encountered a warning while fetching dynamic data.',
      error,
    );
  }

  return pages;
}
