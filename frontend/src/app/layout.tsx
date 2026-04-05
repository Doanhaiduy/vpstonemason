import type { Metadata, ResolvingMetadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { getSiteConfig } from '@/lib/get-site-config';
import { SiteConfigProvider } from '@/lib/SiteConfigContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const META_PIXEL_ID = '914423308090374';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    metadataBase: new URL(config.siteUrl || 'https://vpstonemason.vercel.app'),
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
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
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
        <Analytics />
      </body>
    </html>
  );
}
