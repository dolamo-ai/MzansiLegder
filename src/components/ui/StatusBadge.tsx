export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    reviewed: { tone: 'success', label: 'Reviewed' },
    pending: { tone: 'warning', label: 'Pending' },
    flagged: { tone: 'danger', label: 'Flagged' },
    duplicate: { tone: 'danger', label: 'Duplicate' },
  };
  const cfg = map[status] ?? { tone: 'neutral' as const, label: status };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        cfg.tone === 'success'
          ? 'bg-success/15 text-[#6ee7b7] border-success/30'
          : cfg.tone === 'warning'
            ? 'bg-warning/15 text-[#fcd34d] border-warning/30'
            : cfg.tone === 'danger'
              ? 'bg-danger/15 text-[#fca5a5] border-danger/30'
              : 'bg-white/5 text-text-2 border-white/10'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          cfg.tone === 'success'
            ? 'bg-success'
            : cfg.tone === 'warning'
              ? 'bg-warning'
              : cfg.tone === 'danger'
                ? 'bg-danger'
                : 'bg-text-2'
        }`}
      />
      {cfg.label}
    </span>
  );
}
