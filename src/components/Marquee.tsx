export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee border-y border-line py-4">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-[13px] font-medium tracking-[0.22em] text-fg/45 uppercase"
          >
            {item}
            <span className="ml-10 text-cyan">◈</span>
          </span>
        ))}
      </div>
    </div>
  );
}
