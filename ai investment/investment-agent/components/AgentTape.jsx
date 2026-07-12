"use client";

import { useEffect, useState } from "react";

export default function AgentTape({ steps, active }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!steps?.length) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= steps.length) clearInterval(interval);
    }, 420);
    return () => clearInterval(interval);
  }, [steps]);

  if (!steps?.length && !active) return null;

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft/60 p-4 font-mono text-[13px] leading-relaxed">
      <div className="mb-2 flex items-center gap-2 text-dim">
        <span className="h-2 w-2 rounded-full bg-signal-watch pulse-dot" />
        AGENT LOG
      </div>
      <div className="space-y-1.5">
        {steps?.slice(0, visibleCount).map((s, idx) => (
          <div key={idx} className="tape-line flex gap-3">
            <span className="text-dim shrink-0">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="text-signal-invest shrink-0">›</span>
            <span className="text-paper">
              <span className="text-paper/90 font-medium">{s.label}</span>
              <span className="text-dim"> — {s.detail}</span>
            </span>
          </div>
        ))}
        {active && (
          <div className="flex gap-3 text-dim">
            <span className="shrink-0">{String(visibleCount + 1).padStart(2, "0")}</span>
            <span className="shrink-0">›</span>
            <span>
              processing<span className="cursor-blink">_</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
