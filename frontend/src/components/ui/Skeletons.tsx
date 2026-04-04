'use client';

import { motion } from 'framer-motion';

/** Generic skeleton pulse block */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-stone-200 rounded ${className}`} />
  );
}

/** Stone card skeleton */
export function StoneCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="aspect-[3/4] mb-4 rounded-none" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-10" />
        </div>
      </div>
    </div>
  );
}

/** Stone grid skeleton (multiple cards) */
export function StoneGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <StoneCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Category card skeleton */
export function CategoryCardSkeleton() {
  return (
    <div className="aspect-[4/3] bg-stone-200 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-stone-400/40 to-transparent" />
      <div className="absolute bottom-6 left-6 space-y-2">
        <Skeleton className="h-6 w-28 bg-stone-300" />
        <Skeleton className="h-4 w-40 bg-stone-300" />
      </div>
    </div>
  );
}

/** Category grid skeleton */
export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Project card skeleton */
export function ProjectCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video rounded-none mb-4" />
      <Skeleton className="h-5 w-3/5 mb-2" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

/** Blog card skeleton */
export function BlogCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video rounded-none mb-4" />
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-5 w-4/5 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-1" />
    </div>
  );
}

/** Page-level loading with centered spinner */
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full"
      />
      <p className="mt-4 text-stone-500 text-sm">{text}</p>
    </div>
  );
}

/** Inline loading indicator for buttons */
export function ButtonSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
    />
  );
}

/** Section loading skeleton with header */
export function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="py-8">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-64 mb-8" />
      <StoneGridSkeleton count={4} />
    </div>
  );
}

export { Skeleton };
