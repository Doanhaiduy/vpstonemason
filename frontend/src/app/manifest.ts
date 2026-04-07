import { MetadataRoute } from 'next';
import { getStaticSiteConfig } from '@/lib/get-site-config';

export default function manifest(): MetadataRoute.Manifest {
  const config = getStaticSiteConfig();

  return {
    name: config.companyName,
    short_name: config.companyName,
    description: config.seo.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: config.themeColor,
    theme_color: config.themeColor,
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
