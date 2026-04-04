import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, Clock, Youtube } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';

const footerLinks = {
  'Collections': [
    { href: '/catalog/mineral', label: 'Mineral' },
    { href: '/catalog/porcelain', label: 'Porcelain' },
    { href: '/catalog/natural', label: 'Natural' },
    { href: '/catalog', label: 'All Collections' },
  ],
  'Services': [
    { href: '/catalog/mineral', label: 'Kitchen Benchtops' },
    { href: '/catalog/porcelain', label: 'Bathroom Vanities' },
    { href: '/catalog/natural', label: 'Splashbacks' },
    { href: '/catalog', label: 'Laundry Benchtops' },
    { href: '/catalog', label: 'Outdoor Kitchens' },
  ],
  'Company': [
    { href: '/about', label: 'About Us' },
    { href: '/projects', label: 'Our Projects' },
    { href: '/showroom', label: 'Visit Showroom' },
    { href: '/blog', label: 'Blog & News' },
    { href: '/contact', label: 'Contact Us' },
  ],
};

export function Footer() {
  const config = useSiteConfig();
  
  const weekHours = config.openingHours.find(h => h.day === 'Monday')?.open 
    ? `Mon–Fri: ${config.openingHours.find(h => h.day === 'Monday')?.open.replace(':00', '')}–${config.openingHours.find(h => h.day === 'Monday')?.close.replace(':00', '')}`
    : 'Mon–Fri: 9am–5pm';
  const satHours = config.openingHours.find(h => h.day === 'Saturday')?.closed
    ? 'Sat: Closed'
    : `Sat: ${config.openingHours.find(h => h.day === 'Saturday')?.open.replace(':00', '')}–${config.openingHours.find(h => h.day === 'Saturday')?.close.replace(':00', '')}`;

  return (
    <footer className="bg-stone-900 text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="container-custom py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl mb-3">
                Ready to Transform Your Space?
              </h2>
              <p className="text-stone-400 text-lg">
                Visit our showroom or request a free quote today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" prefetch className="btn-gold whitespace-nowrap">
                Request a Quote
              </Link>
              <Link href="/showroom" prefetch className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-stone-900 whitespace-nowrap">
                Visit Showroom
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" prefetch className="inline-block mb-6">
              <span className="font-display text-3xl font-bold">{config.companyName}</span>
              <span className="block text-xs tracking-[0.3em] uppercase text-stone-500 mt-1">
                {config.tagline.split(' ').slice(0, 3).join(' ')}
              </span>
            </Link>
            <p className="text-stone-400 leading-relaxed mb-8 max-w-sm">
              {config.aboutShort}
            </p>

            <div className="space-y-3">
              <a href={`tel:${config.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-stone-300 hover:text-accent-gold transition-colors">
                <Phone className="w-4 h-4 text-accent-gold" />
                {config.phone}
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center gap-3 text-stone-300 hover:text-accent-gold transition-colors">
                <Mail className="w-4 h-4 text-accent-gold" />
                {config.email}
              </a>
              <div className="flex items-start gap-3 text-stone-300">
                <MapPin className="w-4 h-4 text-accent-gold mt-0.5" />
                <span>{config.address.street}<br />{config.address.suburb} {config.address.state} {config.address.postcode}</span>
              </div>
              <div className="flex items-start gap-3 text-stone-300">
                <Clock className="w-4 h-4 text-accent-gold mt-0.5" />
                <span>{weekHours}<br />{satHours}</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-6 text-white">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch
                      className="text-stone-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm">
            © {new Date().getFullYear()} {config.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {config.socialLinks.instagram && (
              <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {config.socialLinks.facebook && (
              <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {config.socialLinks.youtube && (
              <a href={config.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
