"use client";

export default function ReportCard({ eyebrow, title, score, summary, bullets = [], bulletLabel }) {
  const scorePct = Math.max(0, Math.min(10, score ?? 0)) * 10;
  const barColor =
    scorePct >= 70 ? "bg-signal-invest" : scorePct >= 40 ? "bg-signal-watch" : "bg-signal-pass";

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft/40 p-5">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest text-dim">{eyebrow}</span>
        <span className="font-mono text-sm text-paper">{score ?? "—"}/10</span>
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>

      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-ink-line">
        <div className={`h-full ${barColor}`} style={{ width: `${scorePct}%` }} />
      </div>

      <p className="mb-3 text-sm text-paper/85">{summary}</p>

      {bullets?.length > 0 && (
        <div>
          {bulletLabel && (
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-dim">
              {bulletLabel}
            </div>
          )}
          <ul className="space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-paper/75">
                <span className="text-dim">—</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
