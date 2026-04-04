export default function ProjectsLoading() {
  return (
    <div className="pt-32 pb-20 animate-pulse">
      <div className="container-custom">
        <div className="h-10 bg-stone-200 rounded w-48 mb-4" />
        <div className="h-5 bg-stone-100 rounded w-80 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i}>
              <div className="aspect-video bg-stone-200 rounded mb-4"/>
              <div className="h-3 bg-stone-200 rounded w-24 mb-2"/>
              <div className="h-6 bg-stone-200 rounded w-48 mb-2"/>
              <div className="h-4 bg-stone-100 rounded w-32"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
