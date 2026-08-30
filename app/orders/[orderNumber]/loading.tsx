export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="skeleton mb-4 h-6 w-32 rounded" />
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton mt-4 h-56 rounded-2xl" />
    </div>
  );
}
