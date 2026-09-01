export default function SearchBox({
  defaultValue = "",
  autoFocus = false,
  className = "",
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <form action="/search" method="GET" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="دوّر على منتج... مثلاً: كارت أعمال"
        className="w-full rounded-xl border border-line bg-surface py-2.5 ps-4 pe-11 text-sm text-fg transition-colors placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="بحث"
        className="absolute inset-y-0 end-0 grid w-11 place-items-center text-muted transition-colors hover:text-fg"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
    }
