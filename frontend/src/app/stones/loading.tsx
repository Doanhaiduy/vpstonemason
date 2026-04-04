export default function StonesLoading() {
  return (
    <div className="pt-32 pb-20 animate-pulse">
      <div className="container-custom">
        <div className="h-10 bg-stone-200 rounded w-64 mb-4" />
        <div className="h-5 bg-stone-100 rounded w-96 mb-10" />
        <div className="flex gap-3 mb-10">{Array.from({length:6}).map((_,i)=><div key={i} className="h-10 bg-stone-100 rounded-full w-24"/>)}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({length:8}).map((_,i)=>(
            <div key={i}>
              <div className="aspect-[3/4] bg-stone-200 rounded mb-3"/>
              <div className="h-3 bg-stone-200 rounded w-16 mb-2"/>
              <div className="h-5 bg-stone-200 rounded w-32"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
