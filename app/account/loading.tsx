export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton mt-6 h-28 rounded-2xl" />
      <div className="skeleton mt-8 h-6 w-32 rounded" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
