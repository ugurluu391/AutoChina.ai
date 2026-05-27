export function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.ElementType }) {
  return (
    <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-content-dim text-sm">{label}</span>
        <Icon size={18} className="text-accent" />
      </div>
      <div className="font-display text-3xl font-bold">{value}</div>
      {sub && <div className="text-content-muted text-xs mt-1">{sub}</div>}
    </div>
  );
}
