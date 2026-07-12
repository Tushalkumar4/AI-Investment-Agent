# Ledger — AI Investment Research Agent

An agent that takes a company name, researches it across four analytical lenses, and
makes an **INVEST / PASS** call — with the reasoning shown, not hidden.

Built for the InsideIIM × Altuni AI Labs take-home assignment.

---

## Overview

You type a company name into the terminal-style input on the landing page. Behind the
scenes, a **LangGraph.js** state graph fans out to four parallel "analyst" nodes — each
a call to **Google Gemini** with a narrow, structured brief:

1. **Business Model** — what it sells, to whom, how it makes money, and how defensible that is.
2. **Financial Health** — revenue trajectory, margins, balance sheet strength / burn.
3. **Market & Competition** — TAM, growth, competitive position, named competitors.
4. **Risk Assessment** — regulatory, competitive, execution and governance red flags.

Their four reports fan back in to a fifth **Investment Committee** node, which weighs
them holistically (not just a numeric average) and returns a verdict, a confidence
score, a plain-language thesis, the key drivers behind the call, and the conditions
that would make it reconsider.

The UI streams the agent's reasoning as a live "tape" (like a research terminal log),
then reveals a verdict stamp, a radar chart of the four scores, and four detailed
report cards you can audit line by line.

---

## How to run it

**Requirements:** Node.js 18.18+ and a free Gemini API key.

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key
cp .env.example .env.local
# then open .env.local and paste your key:
# GOOGLE_API_KEY=your_gemini_api_key_here

# 3. Run the dev server
npm run dev
```

Open **http://localhost:3000**, type a company name (e.g. "Nvidia"), and click
**Run research**.

Get a free Gemini API key at **https://aistudio.google.com/apikey**. No other API keys
or services are required — this project intentionally uses a single LLM provider, per
the assignment's instructions.

### Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GOOGLE_API_KEY` | yes | — | Your Gemini API key |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Any Gemini chat model your key can access |

---

## How it works

**Stack:** Next.js 14 (App Router, both frontend and the `/api/analyze` backend route)
· LangGraph.js (`@langchain/langgraph`) for orchestration · LangChain's
`@langchain/google-genai` wrapper for Gemini · Recharts for the score radar ·
Tailwind CSS for styling.

**Architecture:**

```
                     ┌────────────────────┐
                     │   POST /api/analyze │
                     └─────────┬───────────┘
                               │  companyName
                               ▼
                     ┌───────────────────┐
                     │   LangGraph START   │
                     └─────────┬───────────┘
            ┌──────────┬───────┼────────┬──────────┐
            ▼          ▼       ▼        ▼
      businessModel  financial market   risk        (4 parallel Gemini calls,
       Node          Health    Position Assessment    each returns strict JSON)
            │          │       │        │
            └──────────┴───────┴────────┘
                        ▼
                 synthesize Node          (5th Gemini call — final verdict,
                        │                  given all 4 reports as context)
                        ▼
                       END
                        │
                        ▼
              JSON response → UI renders
              tape → stamp → radar → cards
```

Each node prompts Gemini with a role-specific system prompt and asks for **strict
JSON** matching a fixed schema (score, summary, and a few structured fields). The
route handler (`app/api/analyze/route.js`) invokes the compiled graph once and returns
the full state to the client. The frontend (`app/page.js`) then animates the
already-completed steps into a "live" log for readability, followed by the results.

**Key files:**
- `lib/agent.js` — the LangGraph graph: state schema, all 5 node functions, JSON parsing/repair helper, graph assembly.
- `app/api/analyze/route.js` — thin HTTP wrapper around the graph.
- `app/page.js` — UI state machine (idle → researching → revealing → done).
- `components/` — `AgentTape`, `ScoreRadar`, `VerdictStamp`, `ReportCard`.

---

## Key decisions & trade-offs

- **Fan-out/fan-in graph instead of a single mega-prompt.** Four independent,
  narrowly-scoped Gemini calls run in parallel and are more consistent and easier to
  audit than one prompt trying to do everything. Trade-off: 5 LLM calls per run
  instead of 1, so latency (~10-20s) and token cost are higher.
- **Structured JSON outputs, not free text.** Every node is instructed to return a
  fixed JSON schema. This makes the UI (radar chart, score bars, bulleted lists)
  possible without a second "formatting" pass. Trade-off: occasional malformed JSON
  from the model, handled by a tolerant `extractJson()` parser that strips markdown
  fences and slices to the outer `{...}`.
- **The committee node reasons, it doesn't just average.** The weighted composite
  score (30/30/20/20 across business model / financials / market / risk) is computed
  in code and passed to the model as *reference only* — the model is explicitly told
  to use judgement rather than mechanically repeat it, since a purely numeric average
  can miss things like "great numbers, but the business is one lawsuit away from
  zero."
- **No search/data API, by design.** The assignment specifies "use Gemini API key
  only." Rather than quietly reaching for a search API, the agent relies on Gemini's
  own knowledge and is explicitly instructed to flag uncertainty and reason from
  well-known public information rather than inventing precise figures, especially for
  private companies without public financials. **Left out on purpose:** this means the
  agent will not see news from after its knowledge cutoff or very recent, fast-moving
  developments — a real production version would add a live search/financial-data tool
  node.
- **No persistence layer.** Each run is stateless — nothing is saved to a database.
  For a take-home this keeps the surface area small; a real product would persist runs
  so users could revisit past verdicts.
- **Reveal animation is client-side, not true token streaming.** The backend returns
  one JSON payload; the frontend replays the step log with a timed reveal so it *feels*
  like a live agent trace without the added complexity of Server-Sent Events. A
  streaming version is listed below under future improvements.
- **Single LLM provider (Gemini) everywhere**, per the assignment's tech constraints —
  no mixing providers for different nodes, to keep the setup to one API key.

---

## Example runs

Run the agent yourself against a few companies and paste the results here before
submitting — this section should reflect **your own real runs**, not placeholder text.
A good spread to try: one large public company, one Indian company, and one
early-stage/private company (to see how the agent handles less public data).

Suggested companies to try: `Nvidia`, `Zomato`, `Tata Motors`, `Airbnb`.

For each, capture:
- A screenshot of the verdict stamp + radar chart
- The final `thesis` text
- One interesting thing the agent got right (or wrong) that you'd flag to a real
  investment committee

> This section is intentionally left for you to fill in with real output from your
> own Gemini key — reproducing fabricated "sample" runs here would misrepresent what
> the agent actually does.

---

## What you would improve with more time

- **A real research tool**, not just model knowledge: a search or financials API
  (e.g. company filings, news) called as a LangGraph tool node before analysis, with
  citations shown in the UI.
- **True streaming** of each node's output via Server-Sent Events, so the tape reflects
  real progress instead of a post-hoc replay.
- **Conversation memory** so a user could ask a follow-up ("what if their debt doubles?")
  without re-running the whole graph.
- **Confidence intervals / self-consistency**, e.g. running the committee node 2-3
  times and surfacing disagreement, rather than a single pass.
- **Portfolio mode** — compare 2-3 companies side by side.
- **Persisted history** (e.g. Postgres via Vercel) so past verdicts are retrievable.
- **Automated tests** around the JSON-parsing/repair logic and the graph's edge cases
  (e.g. a node returning malformed JSON twice in a row).

---

## Deployment (GitHub + Vercel)

```bash
# from inside this project folder
git init
git add .
git commit -m "AI Investment Research Agent"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then on **vercel.com**: "Add New Project" → import the GitHub repo → in
**Settings → Environment Variables** add `GOOGLE_API_KEY` with your Gemini key →
Deploy. Vercel auto-detects Next.js, so no extra config is needed.

---

## AI usage disclosure

This project was built with AI assistance, as the assignment explicitly requires and
scores for. The bonus chat-log requirement asks for the actual session transcript
between you and the AI you built with — export/attach your own conversation (or this
one, if you used it) alongside your submission so it reflects your real build process,
per the assignment's ground rule that you must be able to explain everything you
submit.
