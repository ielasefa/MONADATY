export default function CustomersLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas px-4 py-7 sm:px-6 lg:px-8 lg:py-10" role="status">
      <span className="sr-only">Loading customers</span>
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-3 w-28 rounded bg-gold/10" />
        <div className="mt-4 h-10 w-80 max-w-full rounded bg-surface" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-surface" />
        <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 rounded-xl border border-line bg-card" />)}
        </div>
        <div className="mt-6 h-[68px] rounded-xl border border-line bg-card" />
        <div className="mt-5 space-y-px overflow-hidden rounded-xl border border-line bg-surface">
          <div className="h-12 bg-card" />
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[76px] bg-card" />)}
        </div>
      </div>
    </div>
  );
}
