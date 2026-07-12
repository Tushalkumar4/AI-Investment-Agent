"use client";

export default function VerdictStamp({ decision }) {
  if (!decision) return null;
  const isInvest = decision.verdict === "INVEST";
  const color = isInvest ? "text-signal-invest border-signal-invest" : "text-signal-pass border-signal-pass";
  const glow = isInvest ? "shadow-[0_0_40px_-8px_rgba(0,217,163,0.45)]" : "shadow-[0_0_40px_-8px_rgba(255,92,92,0.45)]";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`stamp-in select-none rounded-md border-[3px] px-8 py-4 font-display text-4xl md:text-5xl font-bold tracking-[0.15em] ${color} ${glow} rotate-[-3deg]`}
      >
        {decision.verdict}
      </div>
      <div className="font-mono text-xs text-dim tracking-wide">
        CONFIDENCE&nbsp;
        <span className="text-paper">{decision.confidence}%</span>
        &nbsp;·&nbsp;COMPOSITE SCORE&nbsp;
        <span className="text-paper">{decision.compositeScore}/10</span>
      </div>
    </div>
  );
}
