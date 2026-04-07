import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { getSiteConfig } from '@/lib/get-site-config';
import { SiteConfigProvider } from '@/lib/SiteConfigContext';
import { buildAlternates } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const META_PIXEL_ID = '914423308090374';

const formatTime24h = (time12h: string): string => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const normalizePhoneForSchema = (phone: string): string => {
  const value = String(phone || '').trim();
  if (!value) return '';

  if (value.startsWith('+')) {
    return `+${value.slice(1).replace(/\D/g, '')}`;
  }

  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('0')) {
    return `+61${digits.slice(1)}`;
  }

  return digits;
};

const normalizeStateForSchema = (state: string): string => {
  return String(state || '')
    .split('(')[0]
    .trim();
};

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
    alternates: buildAlternates('/'),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <html lang="en-AU" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="theme-color" content={config.themeColor} />
        <meta name="language" content="en-AU" />
        <meta name="geo.region" content={config.geo.region} />
        <meta name="geo.placename" content={config.geo.placename} />
        <meta name="geo.position" content={`${config.geo.latitude};${config.geo.longitude}`} />
        <meta name="ICBM" content={`${config.geo.latitude}, ${config.geo.longitude}`} />
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

        {/* LocalBusiness + WebSite JSON-LD — @graph array */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'LocalBusiness',
                  '@id': `${config.siteUrl}/#business`,
                  name: config.companyName,
                  description: config.seo.defaultDescription,
                  inLanguage: 'en-AU',
                  url: config.siteUrl,
                  logo: `${config.siteUrl}/icon0.svg`,
                  image: `${config.siteUrl}/web-app-manifest-512x512.png`,
                  telephone: normalizePhoneForSchema(config.phone),
                  email: config.email,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: config.address.street,
                    addressLocality: config.address.suburb,
                    addressRegion: normalizeStateForSchema(config.address.state),
                    postalCode: config.address.postcode,
                    addressCountry: 'AU',
                  },
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: config.geo.latitude,
                    longitude: config.geo.longitude,
                  },
                  openingHoursSpecification: config.openingHours
                    .filter(h => !h.closed)
                    .map(h => ({
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: h.day,
                      opens: formatTime24h(h.open),
                      closes: formatTime24h(h.close),
                    })),
                  areaServed: ['Australia', 'Victoria', 'Melbourne'],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    telephone: normalizePhoneForSchema(config.phone),
                    email: config.email,
                    areaServed: 'AU',
                    availableLanguage: ['en-AU', 'en'],
                  },
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
                },
                {
                  '@type': 'WebSite',
                  '@id': `${config.siteUrl}/#website`,
                  url: config.siteUrl,
                  name: config.companyName,
                  publisher: { '@id': `${config.siteUrl}/#business` },
                  inLanguage: 'en-AU',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: `${config.siteUrl}/catalog/products?search={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />

        {/* Meta Pixel — deferred to after interactive */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
