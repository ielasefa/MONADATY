export default function AdminInvoicesLoading() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-white/5" />
      <div className="glass overflow-hidden rounded-xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-white/[0.04] px-4 py-3">
            <div className="h-4 w-4 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
