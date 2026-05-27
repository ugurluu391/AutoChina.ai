export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="flex-1 h-px bg-[var(--border)]" />
      <span className="text-content-muted text-xs">{text}</span>
      <span className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}
