'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export function CatalogEmpty({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 md:py-32 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-stone-300" />
      </div>

      <h3 className="font-display text-xl md:text-2xl text-stone-700 mb-3">
        No items yet
      </h3>
      <p className="text-stone-400 text-sm md:text-base max-w-md leading-relaxed mb-8">
        {message || 'This collection is being curated. Check back soon for new additions.'}
      </p>

      <Link href="/catalog" className="btn-secondary">
        Browse Collections
      </Link>
    </motion.div>
  );
}
