'use client';

import { motion } from 'framer-motion';
import { Factory, Shield, Clock, Users, Award, Truck } from 'lucide-react';

const reasons = [
  { icon: Factory, title: 'Local Fabrication', desc: 'All stones are fabricated in our Australian workshop using state-of-the-art CNC machinery.' },
  { icon: Shield, title: 'Quality Guaranteed', desc: 'We use only premium materials backed by manufacturer warranties and our own workmanship guarantee.' },
  { icon: Clock, title: 'Quick Turnaround', desc: 'From template to installation in as little as 5 business days for most projects.' },
  { icon: Users, title: 'Expert Team', desc: 'Our qualified stonemasons bring decades of combined experience to every project.' },
  { icon: Award, title: 'Industry Accredited', desc: 'Members of Master Builders Australia and certified for workplace safety compliance.' },
  { icon: Truck, title: 'Full Service', desc: 'From free consultation through to fabrication, delivery and professional installation.' },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-stone-900 text-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">
              Why Partner With Us
            </span>
            <h2 className="font-display text-display-sm md:text-display text-white mt-4 mb-4">
              Why Choose PVStone
            </h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              We combine Australian craftsmanship with premium materials to deliver
              exceptional results for every project.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 border border-white/10 hover:border-accent-gold/30
                           transition-all duration-500 hover:bg-white/5"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-accent-gold/10
                               text-accent-gold mb-6 group-hover:bg-accent-gold group-hover:text-white
                               transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl text-white mb-3">{reason.title}</h3>
                <p className="text-stone-400 leading-relaxed">{reason.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
