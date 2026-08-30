export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* هيكل الهيرو */}
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="skeleton h-7 w-48 rounded-full" />
        <div className="skeleton h-12 w-72 rounded-xl sm:h-14 sm:w-96" />
        <div className="skeleton h-5 w-64 rounded-lg" />
      </div>

      {/* هيكل شبكة المنتجات */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="skeleton aspect-square" />
            <div className="flex flex-col gap-2 p-4">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="mt-2 skeleton h-6 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
