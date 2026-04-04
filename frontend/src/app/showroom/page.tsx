'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, Phone, Car, Navigation, CalendarCheck } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';
import { toGoogleMapsEmbedUrl } from '@/lib/google-maps';

const showroomImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
];

export default function ShowroomPage() {
  const config = useSiteConfig();
  const formattedAddress = `${config.address.street}, ${config.address.suburb} ${config.address.state} ${config.address.postcode}`;
  const mapEmbedUrl = toGoogleMapsEmbedUrl(config.googleMapsEmbed);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${showroomImages[0]}')` }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Visit Us</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">Our Showroom</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Experience our entire stone range in person. Touch, compare, and find your perfect stone.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Gallery */}
            <div className="space-y-4">
              {showroomImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`overflow-hidden bg-stone-200 ${i === 0 ? 'aspect-video' : 'aspect-[2/1]'}`}
                >
                  <div className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${img}')` }} />
                </motion.div>
              ))}
            </div>

            {/* Info */}
            <div>
              <h2 className="font-display text-3xl text-stone-900 mb-6">Find Us</h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                Our spacious showroom features a curated collection of natural and engineered stones displayed
                as full slabs and installed benchtop samples. Our knowledgeable team is on hand to help you
                navigate options, discuss your project, and provide expert recommendations.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4 p-4 bg-stone-50">
                  <MapPin className="w-5 h-5 text-accent-gold mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900">Address</h4>
                    <p className="text-stone-600">{formattedAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-stone-50">
                  <Clock className="w-5 h-5 text-accent-gold mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900">Opening Hours</h4>
                    <div className="text-stone-600 text-sm space-y-1 mt-1">
                      {config.openingHours.map(h => (
                        <p key={h.day}>{h.day}: {h.closed ? 'Closed' : `${h.open} – ${h.close}`}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-stone-50">
                  <Phone className="w-5 h-5 text-accent-gold mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900">Phone</h4>
                    <a href={`tel:${config.phone.replace(/\s+/g, '')}`} className="text-stone-600 hover:text-accent-gold transition-colors">{config.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-stone-50">
                  <Car className="w-5 h-5 text-accent-gold mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900">Parking</h4>
                    <p className="text-stone-600">Free parking available on site. Walk-ins welcome — no appointment needed.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(formattedAddress)}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <Navigation className="w-4 h-4 mr-2" /> Get Directions
                </a>
                <Link href="/contact" className="btn-gold">
                  <CalendarCheck className="w-4 h-4 mr-2" /> Book Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[450px] bg-stone-200">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </section>
    </>
  );
}
