export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="skeleton mb-6 h-7 w-40 rounded" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
