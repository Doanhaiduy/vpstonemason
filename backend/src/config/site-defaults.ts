/**
 * Backend Site Config Defaults
 * Same values as frontend/src/lib/site-config.ts
 * Used by ShowroomService when creating initial DB settings
 */
export const siteDefaults = {
  companyName: 'vpstonemason',
  tagline: 'Premium Stone Benchtops in Australia',
  phone: '(03) 9000 0000',
  email: 'info@pvstone.com.au',
  address: {
    street: '123 Stone Avenue',
    suburb: 'Richmond',
    state: 'VIC',
    postcode: '3121',
  },
  openingHours: [
    { day: 'Monday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Tuesday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Wednesday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Thursday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Friday', open: '9:00 AM', close: '5:00 PM', closed: false },
    { day: 'Saturday', open: '10:00 AM', close: '2:00 PM', closed: false },
    { day: 'Sunday', open: '', close: '', closed: true },
  ],
  heroTitle: 'Exceptional Stone Benchtops',
  heroSubtitle:
    'Premium natural & engineered stone for Australian kitchens, bathrooms & beyond.',
  heroCta1Text: 'View Stone Range',
  heroCta1Link: '/catalog',
  heroCta2Text: 'Visit Our Showroom',
  heroCta2Link: '/showroom',
  aboutShort:
    'Family-owned and operated in Australia, we bring over 15 years of expertise in stone fabrication and installation to every project.',
  whyChooseUs: [
    {
      title: 'Local Fabrication',
      description:
        'All stones are fabricated in our local Australian workshop.',
      icon: 'factory',
    },
    {
      title: 'Quality Guaranteed',
      description: 'We use only premium materials with full warranty.',
      icon: 'shield',
    },
    {
      title: 'Quick Turnaround',
      description:
        'From template to installation in as little as 5 business days.',
      icon: 'clock',
    },
    {
      title: 'Expert Team',
      description:
        'Our team of qualified stonemasons brings decades of experience.',
      icon: 'users',
    },
  ],
};
