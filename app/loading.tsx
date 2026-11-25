export default function Loading() {
  return (
    <div className="px-4 py-8 sm:px-6" aria-busy="true">
      <div className="mb-12 h-20 max-w-[26ch] animate-pulse rounded-md bg-card" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-md bg-card" />
        ))}
      </div>
    </div>
  );
}
