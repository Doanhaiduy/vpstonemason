'use client';

import { motion } from 'framer-motion';

interface Props {
  specifications: Record<string, string>;
}

export function ProductSpecs({ specifications }: Props) {
  const entries = Object.entries(specifications);
  if (entries.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-accent-gold">
            Technical Details
          </span>
          <h2 className="font-display text-2xl md:text-display-sm text-stone-900 mt-2">
            Specifications
          </h2>
        </motion.div>

        <div className="max-w-2xl">
          {entries.map(([key, value], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center justify-between py-4 border-b border-stone-200 group hover:border-accent-gold/30 transition-colors duration-300"
            >
              <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">
                {key}
              </span>
              <span className="text-sm font-semibold text-stone-900 text-right">
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
