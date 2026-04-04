'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';

export function ShowroomInfo() {
  const config = useSiteConfig();

  const formattedAddress = `${config.address.street}, ${config.address.suburb} ${config.address.state} ${config.address.postcode}`;
  
  // Format hours concisely for display
  const weekHours = config.openingHours.find(h => h.day === 'Monday')?.open 
    ? `Mon–Fri: ${config.openingHours.find(h => h.day === 'Monday')?.open}–${config.openingHours.find(h => h.day === 'Monday')?.close}`
    : 'Mon–Fri: 9am–5pm';
  const satHours = config.openingHours.find(h => h.day === 'Saturday')?.closed
    ? 'Sat: Closed'
    : `Sat: ${config.openingHours.find(h => h.day === 'Saturday')?.open}–${config.openingHours.find(h => h.day === 'Saturday')?.close}`;

  return (
    <section className="section-padding bg-stone-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map / Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] bg-stone-200 overflow-hidden"
          >
            <iframe
              src={config.googleMapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">
              Come See For Yourself
            </span>
            <h2 className="section-title mt-4 mb-6">Visit Our Showroom</h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8">
              Experience our extensive stone collection in person. Our expert team is ready to
              help you find the perfect stone for your project. Walk-ins welcome — no appointment needed.
            </p>

            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-stone-900 mb-0.5">Address</h4>
                  <p className="text-stone-500">{formattedAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-stone-900 mb-0.5">Opening Hours</h4>
                  <p className="text-stone-500">{weekHours} &nbsp;|&nbsp; {satHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-stone-900 mb-0.5">Call Us</h4>
                  <a href={`tel:${config.phone.replace(/\s+/g, '')}`} className="text-stone-500 hover:text-accent-gold transition-colors">
                    {config.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(formattedAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </a>
              <Link href="/contact" className="btn-secondary">
                Book a Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
