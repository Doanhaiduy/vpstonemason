import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vpstonemason.vercel.app';

const staticPages = [
  { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/catalog', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/projects', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/showroom', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
];

const catalogCategoryPages = ['/catalog/mineral', '/catalog/porcelain', '/catalog/natural'];

const projectSlugs = [
  'modern-kitchen-renovation-brighton',
  'luxury-bathroom-suite-toorak',
  'outdoor-kitchen-portsea',
  'contemporary-kitchen-south-yarra',
  'family-home-kitchen-geelong',
  'penthouse-kitchen-docklands',
];

const blogSlugs = [
  'how-to-choose-perfect-stone-benchtop',
  'kitchen-benchtop-trends-australia-2025',
  'how-to-care-natural-stone-benchtop',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const pages: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  catalogCategoryPages.forEach((path) => {
    pages.push({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  projectSlugs.forEach((slug) => {
    pages.push({
      url: `${BASE_URL}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  blogSlugs.forEach((slug) => {
    pages.push({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return pages;
}
