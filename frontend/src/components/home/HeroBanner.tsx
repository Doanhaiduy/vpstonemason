'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useSiteConfig } from '@/lib/SiteConfigContext';
import { shouldUnoptimizeImage } from '@/lib/image';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80';

export function HeroBanner() {
  const config = useSiteConfig();

  return (
    <section className="relative h-screen min-h-[700px] max-h-[1000px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 scale-105">
          <Image
            src={HERO_IMAGE}
            alt="Premium stone benchtop kitchen"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized={shouldUnoptimizeImage(HERO_IMAGE)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-950/20" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 mt-8 md:mt-10">
        <div className="max-w-3xl">
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-[1px] bg-accent-gold" />
            <span className="text-accent-gold text-sm font-medium tracking-[0.2em] uppercase">
              {config.tagline}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-display-lg text-white mb-6 text-balance"
          >
            {config.hero.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
          >
            {config.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href={config.hero.cta1Link} className="btn-gold group">
              {config.hero.cta1Text}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={config.hero.cta2Link}
              className="btn-secondary !border-white/30 !text-white hover:!bg-white hover:!text-stone-900"
            >
              {config.hero.cta2Text}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex gap-12 mt-16 pt-8 border-t border-white/10"
          >
            {[
              { value: '15+', label: 'Years Experience' },
              { value: '2000+', label: 'Projects Completed' },
              { value: '100+', label: 'Stone Varieties' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl text-white mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm tracking-wide">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
