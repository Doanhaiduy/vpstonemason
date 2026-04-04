'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function CatalogError({ message, onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 md:py-32 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-300" />
      </div>

      <h3 className="font-display text-xl md:text-2xl text-stone-700 mb-3">
        Something went wrong
      </h3>
      <p className="text-stone-400 text-sm md:text-base max-w-md leading-relaxed mb-8">
        {message || "We couldn't load this collection. Please try again."}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
