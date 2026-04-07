import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { getSiteConfig } from '@/lib/get-site-config';
import { toGoogleMapsEmbedUrl } from '@/lib/google-maps';
import { toPhoneHref } from '@/lib/phone';
import { AnimateOnView } from '@/components/ui/AnimateOnView';
import { ContactFormClient } from '@/components/ui/ContactFormClient';

export default async function ContactPage() {
  const config = await getSiteConfig();
  const mapEmbedUrl = toGoogleMapsEmbedUrl(config.googleMapsEmbed, config.googleMapsEmbed);
  const localityLine = [config.address.suburb, config.address.state, config.address.postcode]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="container-custom relative z-10 text-center">
          <AnimateOnView animateOnMount>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Get In Touch</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">Contact Us</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Have a question or ready to start your project? We&apos;d love to hear from you.
            </p>
          </AnimateOnView>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Contact Info — SSR rendered */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl text-stone-900 mb-8">Let&apos;s Talk</h2>
              <div className="space-y-6 mb-10">
                <a href={toPhoneHref(config.phone)} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 mb-0.5">Call Us</p>
                    <p className="text-stone-500">{config.phone}</p>
                  </div>
                </a>
                <a href={`mailto:${config.email}`} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold group-hover:bg-accent-gold group-hover:text-white transition-all flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 mb-0.5">Email Us</p>
                    <p className="text-stone-500">{config.email}</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 mb-0.5">Visit Our Showroom</p>
                    <p className="text-stone-500">{config.address.street}<br />{localityLine}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-stone-100 text-accent-gold flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 mb-0.5">Opening Hours</p>
                    {config.openingHours.map(h => (
                      <p key={h.day} className="text-stone-500 text-sm">{h.day}: {h.closed ? 'Closed' : `${h.open} – ${h.close}`}</p>
                    ))}
                  </div>
                </div>
              </div>
              <a href={toPhoneHref(config.phone)} className="btn-gold w-full lg:hidden mb-8">
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </a>
            </div>

            {/* Contact Form — Client Component */}
            <div className="lg:col-span-3">
              <ContactFormClient />
            </div>
          </div>
        </div>
      </section>

      <section className="h-[400px] bg-stone-200">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="PVStone Location — Google Maps"
        />
      </section>
    </>
  );
}
