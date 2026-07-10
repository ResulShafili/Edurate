type ContentSkeletonProps = {
  count?: number;
  compact?: boolean;
};

export function ContentSkeleton({ count = 3, compact = false }: ContentSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <article
          aria-hidden="true"
          className={`animate-pulse rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
            compact ? "min-h-[190px]" : "min-h-[230px]"
          }`}
          key={`content-skeleton-${index + 1}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="h-11 w-11 rounded-2xl bg-slate-100" />
            <div className="h-10 w-20 rounded-2xl bg-slate-100" />
          </div>
          <div className="mt-6 h-4 w-2/3 rounded-full bg-slate-100" />
          <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-100" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="h-14 rounded-2xl bg-slate-100" />
          </div>
        </article>
      ))}
    </>
  );
}
