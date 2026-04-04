export default function PageLoading() {
  return (
    <div className="pt-32 pb-20 animate-pulse">
      <div className="container-custom">
        <div className="h-12 bg-stone-200 rounded w-56 mb-6" />
        <div className="h-5 bg-stone-100 rounded w-96 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-stone-200 rounded" />
          <div className="space-y-4">
            <div className="h-4 bg-stone-200 rounded w-full"/>
            <div className="h-4 bg-stone-200 rounded w-5/6"/>
            <div className="h-4 bg-stone-100 rounded w-3/4"/>
            <div className="h-4 bg-stone-100 rounded w-2/3"/>
            <div className="h-10 bg-stone-200 rounded w-40 mt-6"/>
          </div>
        </div>
      </div>
    </div>
  );
}
