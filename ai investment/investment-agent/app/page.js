"use client";

import { useState } from "react";
import AgentTape from "../components/AgentTape";
import ScoreRadar from "../components/ScoreRadar";
import VerdictStamp from "../components/VerdictStamp";
import ReportCard from "../components/ReportCard";

const EXAMPLES = ["Nvidia", "Zomato", "Tata Motors", "Airbnb"];

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!companyName.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowResults(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setResult(data);
      const tapeDuration = (data.steps?.length || 1) * 420 + 300;
      setTimeout(() => setShowResults(true), tapeDuration);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0 h-[600px]" />

      {/* Header */}
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-signal-invest" />
          <span className="font-display text-lg font-semibold tracking-tight">LEDGER</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
          AI Investment Research Agent
        </span>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-6 pb-10 pt-16 text-center md:pt-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-signal-invest">
          give it a name. it does the diligence.
        </p>
        <h1 className="mb-5 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
          Should you invest in{" "}
          <span className="text-dim">that company</span>?
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base text-paper/70 md:text-lg">
          Four analyst nodes research business model, financial health, market position
          and risk in parallel. A fifth weighs their reports and makes the call —
          with reasoning you can audit.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Nvidia, Zomato, Airbnb…"
            disabled={loading}
            className="flex-1 rounded-md border border-ink-line bg-ink-soft px-4 py-3 font-mono text-sm text-paper placeholder:text-dim focus:border-signal-invest focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !companyName.trim()}
            className="rounded-md bg-signal-invest px-6 py-3 font-mono text-sm font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Researching…" : "Run research"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-dim">
          <span>try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setCompanyName(ex)}
              disabled={loading}
              className="rounded border border-ink-line px-2 py-1 text-paper/70 transition hover:border-signal-invest hover:text-signal-invest disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mx-auto mb-8 max-w-lg rounded-md border border-signal-pass/40 bg-signal-pass/10 px-4 py-3 text-center font-mono text-sm text-signal-pass">
          {error}
        </div>
      )}

      {/* Agent tape */}
      {(loading || result) && (
        <section className="relative mx-auto mb-10 max-w-2xl px-6">
          <AgentTape steps={result?.steps} active={loading} />
        </section>
      )}

      {/* Results */}
      {result && showResults && (
        <section className="relative mx-auto max-w-5xl px-6 pb-24">
          <div className="mb-4 text-center font-mono text-xs uppercase tracking-widest text-dim">
            Verdict for {result.companyName}
          </div>
          <div className="mb-14 flex flex-col items-center gap-8">
            <VerdictStamp decision={result.decision} />
            <p className="max-w-2xl text-center text-base leading-relaxed text-paper/85">
              {result.decision?.thesis}
            </p>
          </div>

          <div className="mb-14 grid gap-8 md:grid-cols-[1fr_1.1fr]">
            <div className="rounded-lg border border-ink-line bg-ink-soft/40 p-5">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-dim">
                Score composite
              </div>
              <ScoreRadar
                businessModel={result.businessModel}
                financialHealth={result.financialHealth}
                marketPosition={result.marketPosition}
                riskAssessment={result.riskAssessment}
              />
            </div>

            <div className="grid grid-rows-2 gap-4">
              <div className="rounded-lg border border-ink-line bg-ink-soft/40 p-5">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-signal-invest">
                  Key drivers
                </div>
                <ul className="space-y-1.5">
                  {result.decision?.keyDrivers?.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-paper/85">
                      <span className="text-signal-invest">+</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-ink-line bg-ink-soft/40 p-5">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-signal-watch">
                  Would revisit if
                </div>
                <ul className="space-y-1.5">
                  {result.decision?.conditionsToRevisit?.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm text-paper/85">
                      <span className="text-signal-watch">~</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6 font-mono text-[11px] uppercase tracking-widest text-dim">
            Analyst reports
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <ReportCard
              eyebrow="Node 01"
              title="Business Model"
              score={result.businessModel?.score}
              summary={result.businessModel?.summary}
              bullets={result.businessModel?.bullets}
              bulletLabel={`Moat — ${result.businessModel?.moat || ""}`}
            />
            <ReportCard
              eyebrow="Node 02"
              title="Financial Health"
              score={result.financialHealth?.score}
              summary={result.financialHealth?.summary}
              bullets={result.financialHealth?.concerns}
              bulletLabel="Concerns"
            />
            <ReportCard
              eyebrow="Node 03"
              title="Market & Competition"
              score={result.marketPosition?.score}
              summary={result.marketPosition?.summary}
              bullets={result.marketPosition?.competitors}
              bulletLabel="Notable competitors"
            />
            <ReportCard
              eyebrow="Node 04"
              title="Risk Assessment"
              score={result.riskAssessment?.score}
              summary={result.riskAssessment?.summary}
              bullets={result.riskAssessment?.redFlags}
              bulletLabel="Red flags"
            />
          </div>
        </section>
      )}

      <footer className="relative mx-auto max-w-5xl px-6 pb-10 pt-6 text-center font-mono text-[11px] text-dim">
        Built with Next.js · LangGraph.js · Gemini — for research purposes only, not financial advice.
      </footer>
    </main>
  );
}
