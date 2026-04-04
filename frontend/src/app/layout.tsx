import type { Metadata, ResolvingMetadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { getSiteConfig } from '@/lib/get-site-config';
import { SiteConfigProvider } from '@/lib/SiteConfigContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    metadataBase: new URL(config.siteUrl || 'https://pvstone.com.au'),
    title: {
      default: `${config.companyName} | ${config.tagline}`,
      template: `%s | ${config.companyName}`,
    },
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    authors: [{ name: config.companyName }],
    creator: config.companyName,
    publisher: config.companyName,
    formatDetection: { telephone: true, email: true },
    openGraph: {
      type: 'website',
      locale: config.seo.locale,
      url: '/',
      siteName: config.companyName,
      title: `${config.companyName} | ${config.tagline}`,
      description: config.seo.defaultDescription,
      images: [{ url: config.seo.ogImage, width: 1200, height: 630, alt: config.companyName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.companyName} | ${config.tagline}`,
      description: config.seo.defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: { canonical: '/' },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content={config.themeColor} />
        <meta name="geo.region" content={config.geo.region} />
        <meta name="geo.placename" content={config.geo.placename} />
      </head>
      <body className="font-sans antialiased">
        <SiteConfigProvider config={config}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SiteConfigProvider>

        {/* LocalBusiness JSON-LD — dynamically populated from DB Config */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': config.siteUrl,
              name: config.companyName,
              description: config.seo.defaultDescription,
              url: config.siteUrl,
              telephone: config.phone,
              email: config.email,
              address: { 
                '@type': 'PostalAddress', 
                streetAddress: config.address.street, 
                addressLocality: config.address.suburb, 
                addressRegion: config.address.state, 
                postalCode: config.address.postcode, 
                addressCountry: 'AU' 
              },
              geo: { 
                '@type': 'GeoCoordinates', 
                latitude: config.geo.latitude, 
                longitude: config.geo.longitude 
              },
              openingHoursSpecification: config.openingHours
                .filter(h => !h.closed)
                .map(h => ({
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: h.day,
                  opens: h.open.replace(' AM', ':00').replace(' PM', ':00'), // Simplified map
                  closes: h.close.replace(' AM', ':00').replace(' PM', ':00'),
                })),
              priceRange: '$$',
              sameAs: Object.values(config.socialLinks).filter(link => link !== ''),
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Stone Benchtops',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Benchtops' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bathroom Vanities' } },
                ],
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
