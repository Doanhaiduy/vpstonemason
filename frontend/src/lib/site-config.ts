/**
 * Site Configuration Defaults (Fallback Layer)
 * 
 * Priority: DB (ShowroomSettings) → site.config.ts → these defaults
 * 
 * Admin can override ALL values via /admin/settings/showroom
 * which saves to MongoDB ShowroomSettings collection.
 */

export interface SiteConfig {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  siteUrl: string;
  apiUrl: string;
  openingHours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  socialLinks: {
    facebook: string;
    instagram: string;
    pinterest: string;
    youtube: string;
  };
  seo: {
    titleSuffix: string;
    defaultDescription: string;
    ogImage: string;
    locale: string;
    keywords: string[];
  };
  hero: {
    title: string;
    subtitle: string;
    cta1Text: string;
    cta1Link: string;
    cta2Text: string;
    cta2Link: string;
  };
  aboutShort: string;
  geo: {
    latitude: number;
    longitude: number;
    region: string;
    placename: string;
  };
  googleMapsEmbed: string;
  themeColor: string;
  aiEnabled: boolean;
}

const siteConfig: SiteConfig = {
  companyName: 'PVStone',
  tagline: 'Premium Stone Benchtops Melbourne',
  phone: '0450 938 079',
  email: 'info@pvstone.com.au',
  address: {
    street: '32 Spalding Ave',
    suburb: 'Sunshine North',
    state: 'VIC',
    postcode: '3020',
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://pvstone.com.au',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://pvstone.com.au/api',
  openingHours: [
    { day: 'Monday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Tuesday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Wednesday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Thursday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Friday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Saturday', open: '10:00 AM', close: '2:00 PM', closed: false },
    { day: 'Sunday', open: '', close: '', closed: true },
  ],
  socialLinks: {
    facebook: 'https://www.facebook.com/PVStonemason',
    instagram: '',
    pinterest: '',
    youtube: '',
  },
  seo: {
    titleSuffix: 'PVStone Melbourne',
    defaultDescription: 'Premium natural and engineered stone benchtops in Melbourne. Visit our Sunshine North showroom to explore granite, marble, quartz, porcelain and CSF-compliant stone.',
    ogImage: '/web-app-manifest-512x512.png',
    locale: 'en_AU',
    keywords: [
      'stone benchtops Melbourne', 'kitchen benchtops Australia', 'marble benchtops Melbourne',
      'granite benchtops Melbourne', 'quartz benchtops Victoria', 'stone showroom Melbourne',
      'stone benchtops Sunshine North', 'custom stone benchtops', 'porcelain benchtops Melbourne',
      'premium stone benchtops', 'kitchen renovations Melbourne'
    ],
  },
  hero: {
    title: 'Exceptional Stone Benchtops',
    subtitle: 'Premium natural & engineered stone for Australian kitchens, bathrooms & beyond.',
    cta1Text: 'View Collections',
    cta1Link: '/catalog',
    cta2Text: 'Visit Our Showroom',
    cta2Link: '/showroom',
  },
  aboutShort: 'Family-owned and operated in Australia, we bring over 15 years of expertise in stone fabrication and installation to every project.',
  geo: {
    latitude: -37.7639,
    longitude: 144.8338,
    region: 'AU-VIC',
    placename: 'Sunshine North, Melbourne',
  },
  googleMapsEmbed: 'https://www.google.com/maps?q=32+Spalding+Ave+Sunshine+North+VIC&output=embed',
  themeColor: '#1F1D1B',
  aiEnabled: true,
};

export default siteConfig;
