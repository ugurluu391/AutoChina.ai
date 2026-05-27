export function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-9">
      <div className="font-display text-[13px] tracking-[2px] uppercase text-accent font-semibold">{eyebrow}</div>
      <h2 className="font-display text-[clamp(26px,4vw,40px)] font-bold mt-2 tracking-tight">{title}</h2>
    </div>
  );
}
