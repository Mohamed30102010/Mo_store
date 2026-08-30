export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton mb-6 h-4 w-40 rounded" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-12 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
