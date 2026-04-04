export function CatalogLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Skeleton */}
      <div className="relative h-[70vh] min-h-[500px] max-h-[800px] bg-stone-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-4">
          <div className="w-12 h-[2px] bg-stone-300" />
          <div className="h-10 w-72 bg-stone-300/50 rounded" />
          <div className="h-5 w-96 bg-stone-300/30 rounded" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container-custom py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-0">
              <div className="aspect-[3/4] bg-stone-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer" style={{ backgroundSize: '200% 100%', animationDelay: `${i * 200}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-0">
          <div className="aspect-[3/4] bg-stone-200 overflow-hidden relative">
            <div
              className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer"
              style={{ backgroundSize: '200% 100%', animationDelay: `${i * 150}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
