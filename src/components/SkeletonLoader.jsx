export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 animate-pulse shadow-ambient">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-low" />
        <div className="flex-1">
          <div className="h-3 bg-surface-container-low rounded-xl w-24 mb-4" />
          <div className="h-8 bg-surface-container-low rounded-xl w-36 mb-3" />
          <div className="h-2.5 bg-surface-container-low rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 animate-pulse shadow-ambient">
      <div className="h-3 bg-surface-container-low rounded-lg w-40 mb-8" />
      <div className="flex items-end gap-3 h-36">
        {[60, 80, 50, 90, 70, 85, 55].map((h, i) => (
          <div key={i} className="flex-1 bg-surface-container-low rounded-t-2xl" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-surface-container-low rounded-lg w-36 mb-2" />
        <div className="h-2.5 bg-surface-container-low rounded-lg w-24" />
      </div>
      <div className="h-4 bg-surface-container-low rounded-lg w-20" />
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <div className="animate-pulse">
        <div className="h-8 bg-surface-container-low rounded-xl w-48 mb-3" />
        <div className="h-4 bg-surface-container-low rounded-lg w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><SkeletonChart /></div>
        <SkeletonChart />
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 animate-pulse shadow-ambient">
        <div className="h-3 bg-surface-container-low rounded-lg w-44 mb-6" />
        {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
