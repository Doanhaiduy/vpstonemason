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
  companyName: 'vpstonemason',
  tagline: 'Premium Stone Benchtops in Australia',
  phone: '(03) 9000 0000',
  email: 'info@vpstonemason.com',
  address: {
    street: '123 Stone Avenue',
    suburb: 'Richmond',
    state: 'VIC',
    postcode: '3121',
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://vpstonemason.vercel.app',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://vpstonemason-api.vercel.app/api',
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
    facebook: 'https://www.facebook.com/vpstonemason',
    instagram: 'https://www.instagram.com/vpstonemason',
    pinterest: '',
    youtube: '',
  },
  seo: {
    titleSuffix: 'vpstonemason Australia',
    defaultDescription: 'Premium natural & engineered stone benchtops for Australian kitchens, bathrooms & beyond. Visit our Melbourne showroom to explore granite, marble, quartz, porcelain & CSF stone.',
    ogImage: '/og-image.jpg',
    locale: 'en_AU',
    keywords: [
      'stone benchtops Melbourne', 'kitchen benchtops Australia', 'marble benchtops Melbourne',
      'granite benchtops Melbourne', 'quartz benchtops Victoria', 'stone showroom Melbourne',
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
    latitude: -37.8172,
    longitude: 144.9559,
    region: 'AU-VIC',
    placename: 'Richmond, Melbourne',
  },
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509198!2d144.9537353!3d-37.8172099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ5JzAyLjAiUyAxNDTCsDU3JzEzLjUiRQ!5e0!3m2!1sen!2sau!4v1234567890',
  themeColor: '#1F1D1B',
  aiEnabled: true,
};

export default siteConfig;
