export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-borda p-4">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-borda">
      <div className="divide-y divide-borda/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 p-3 animate-pulse">
            <Skeleton className="col-span-1 h-4 w-8" />
            <Skeleton className="col-span-5 h-4 w-3/4" />
            <Skeleton className="col-span-2 h-4 w-16" />
            <Skeleton className="col-span-2 h-4 w-24" />
            <Skeleton className="col-span-2 h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-azul-claro" />
        <div className="text-texto/60 text-sm">Carregando...</div>
      </div>
    </div>
  );
}
