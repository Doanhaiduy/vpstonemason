'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { num: '01', title: 'Consultation', desc: 'Visit our showroom or schedule a call to discuss your project requirements, style preferences, and budget.' },
  { num: '02', title: 'Stone Selection', desc: 'Browse our extensive range and select the perfect stone. Our experts will guide you through options and finishes.' },
  { num: '03', title: 'Template & Measure', desc: 'Our team visits your home for precise digital templating to ensure a perfect fit for your benchtops.' },
  { num: '04', title: 'Fabrication', desc: 'Your stone is cut and finished to perfection in our state-of-the-art CNC workshop right here in Australia.' },
  { num: '05', title: 'Installation', desc: 'Our experienced installers fit your new stone benchtops with precision and care, leaving your space spotless.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-stone-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')` }} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Our Story</span>
            <h1 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">About vpstonemason</h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto">
              Family-owned craftsmanship, serving Australian homes for over 15 years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="aspect-[4/5] bg-stone-200 overflow-hidden">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80')` }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">Est. 2009</span>
              <h2 className="section-title mt-4 mb-6">Craftsmanship Meets Innovation</h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  vpstonemason was founded with a simple vision: to bring the world&apos;s finest natural and
                  engineered stones to Australian homes, backed by exceptional craftsmanship and customer service.
                </p>
                <p>
                  Over 15 years later, we&apos;ve grown from a small workshop into one of the most trusted stone
                  fabrication and installation companies in Victoria. Our state-of-the-art facility houses the
                  latest CNC machinery, allowing us to achieve precision cuts and flawless finishes.
                </p>
                <p>
                  We service homeowners, builders, cabinet makers, interior designers, and architects across
                  Melbourne and regional Victoria. Whether you&apos;re renovating a family kitchen or fitting out
                  a luxury penthouse, our team delivers the same dedication to quality.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-stone-100">
                {[
                  { val: '15+', label: 'Years' },
                  { val: '2000+', label: 'Projects' },
                  { val: '100+', label: 'Stone Types' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-display text-3xl text-stone-900">{s.val}</div>
                    <div className="text-stone-500 text-sm mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">How We Work</span>
              <h2 className="section-title mt-4">Our Process</h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="font-display text-5xl text-stone-200 mb-4">{step.num}</div>
                <h3 className="font-display text-xl text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-stone-300 mx-auto mt-4 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-900 text-center">
        <div className="container-custom">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">Ready to Start Your Project?</h2>
          <p className="text-stone-400 text-lg mb-8">Visit our showroom or get in touch for a free consultation.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold">Get a Free Quote</Link>
            <Link href="/showroom" className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-stone-900">Visit Showroom</Link>
          </div>
        </div>
      </section>
    </>
  );
}
