/** Infinite text band. Pure CSS; stops for reduced-motion users (globals.css). */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden>
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span>{t}</span>
          <span className="text-[0.5em] text-sable">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee flex overflow-hidden ${className}`}>
      <p className="sr-only">{items.join(", ")}</p>
      <div className="marquee-track flex">
        {row}
        {row}
      </div>
    </div>
  );
}
