export default function AdminDashboardLoading() {
  return (
    <div aria-live="polite" aria-busy="true" className="container-shell space-y-8">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded bg-surface" />
        <div className="mt-3 h-9 w-64 rounded-lg bg-surface" />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-surface" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-${i}`} className="animate-pulse rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-lg bg-surface" />
              <div className="h-7 w-24 rounded bg-surface" />
            </div>
            <div className="mt-4 h-2 w-20 rounded bg-surface" />
            <div className="mt-2 h-7 w-28 rounded bg-surface" />
            <div className="mt-3 h-4 w-32 rounded bg-surface" />
          </div>
        ))}
      </div>

      {/* Status + highlights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="animate-pulse rounded-xl border border-line bg-surface lg:col-span-2">
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`status-${i}`} className="h-28 bg-surface p-5">
                <div className="h-2 w-16 rounded bg-surface" />
                <div className="mt-3 h-6 w-10 rounded bg-surface" />
              </div>
            ))}
          </div>
          <div className="px-6 py-5">
            <div className="h-3 w-40 rounded bg-surface" />
            <div className="mt-3 h-1.5 w-full rounded bg-surface" />
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-surface p-6">
          <div className="mb-5 h-2 w-20 rounded bg-surface" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`hl-${i}`} className="mb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-surface" />
              <div className="flex-1">
                <div className="h-2 w-20 rounded bg-surface" />
                <div className="mt-1.5 h-3 w-28 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="animate-pulse rounded-xl border border-line bg-surface p-6">
        <div className="h-3 w-24 rounded bg-surface" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`qa-${i}`} className="rounded-lg border border-line bg-card p-4">
              <div className="h-9 w-9 rounded-lg bg-surface" />
              <div className="mt-3 h-2 w-20 rounded bg-surface" />
              <div className="mt-1.5 h-2 w-16 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`chart-top-${i}`} className="animate-pulse rounded-xl border border-line bg-surface p-6">
            <div className="mb-4 h-3 w-32 rounded bg-surface" />
            <div className="h-48 rounded bg-surface" />
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="animate-pulse rounded-xl border border-line bg-surface lg:col-span-2">
          <div className="border-b border-line px-6 py-4">
            <div className="h-3 w-32 rounded bg-surface" />
          </div>
          <div className="space-y-3 px-6 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`ord-${i}`} className="h-9 rounded bg-surface" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-line bg-surface p-6">
          <div className="mb-5 h-3 w-28 rounded bg-surface" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`tp-${i}`}>
                <div className="h-2 w-24 rounded bg-surface" />
                <div className="mt-2 h-1.5 w-full rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
