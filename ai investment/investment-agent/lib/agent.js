import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";

/**
 * ------------------------------------------------------------------
 * AI Investment Research Agent
 * ------------------------------------------------------------------
 * A LangGraph.js state machine that researches a company across four
 * analytical lenses (business model, financial health, market position,
 * risk), then synthesizes an INVEST / PASS decision with reasoning.
 *
 * LLM: Google Gemini (via @langchain/google-genai). Only a single
 * provider / API key is used, as required by the assignment.
 * ------------------------------------------------------------------
 */

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getModel(temperature = 0.3) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_API_KEY / GEMINI_API_KEY environment variable. Add it to .env.local."
    );
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: MODEL_NAME,
    temperature,
    maxOutputTokens: 2048,
  });
}

// ---- Graph state -----------------------------------------------------

const AgentState = Annotation.Root({
  companyName: Annotation(),
  steps: Annotation({
    reducer: (curr, update) => [...(curr || []), ...(update || [])],
    default: () => [],
  }),
  businessModel: Annotation(),
  financialHealth: Annotation(),
  marketPosition: Annotation(),
  riskAssessment: Annotation(),
  decision: Annotation(),
  error: Annotation(),
});

// ---- Helpers -----------------------------------------------------------

function extractJson(text) {
  if (!text) throw new Error("Empty model response");
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

async function callStructured(model, systemPrompt, userPrompt) {
  const res = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
  const text = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
  return extractJson(text);
}

function logStep(label, detail) {
  return { label, detail, timestamp: new Date().toISOString() };
}

// ---- Nodes ---------------------------------------------------------------

async function businessModelNode(state) {
  const model = getModel(0.3);
  const system = `You are a senior equity research analyst evaluating business models for a venture/equity
investment committee. Respond with STRICT JSON only, no markdown, no commentary outside the JSON object.
Schema: {"score": number (0-10), "summary": string (2-3 sentences), "moat": string (1-2 sentences on competitive
advantage / durability), "bullets": string[] (3-5 short factual points)}`;
  const user = `Company: "${state.companyName}"

Analyze this company's business model: what it sells, who it sells to, how it makes money, and how
defensible that position is. Use your knowledge of the company. If you are not fully certain of specific
figures, reason from well-known public information and clearly-labelled estimates rather than inventing
precise numbers.`;

  const result = await callStructured(model, system, user);
  return {
    businessModel: result,
    steps: [logStep("Business Model Analysis", `Score ${result.score}/10 — ${result.summary}`)],
  };
}

async function financialHealthNode(state) {
  const model = getModel(0.3);
  const system = `You are a financial analyst assessing the financial health of a company for an investment
decision. Respond with STRICT JSON only. Schema: {"score": number (0-10), "summary": string (2-3 sentences),
"strengths": string[] (2-3 items), "concerns": string[] (2-3 items)}`;
  const user = `Company: "${state.companyName}"

Assess financial health: revenue trajectory, profitability / path to profitability, margins, balance sheet
strength, and capital efficiency, to the extent you have reliable knowledge. If this is a private / early
company without public financials, reason about funding history, burn, and unit economics signals instead,
and state that explicitly rather than fabricating filings data.`;

  const result = await callStructured(model, system, user);
  return {
    financialHealth: result,
    steps: [logStep("Financial Health Analysis", `Score ${result.score}/10 — ${result.summary}`)],
  };
}

async function marketPositionNode(state) {
  const model = getModel(0.3);
  const system = `You are a market analyst assessing market size, growth, and competitive position. Respond
with STRICT JSON only. Schema: {"score": number (0-10), "summary": string (2-3 sentences), "tailwinds":
string[] (2-3 items), "competitors": string[] (2-4 notable competitors or substitutes)}`;
  const user = `Company: "${state.companyName}"

Assess this company's market: total addressable market and growth rate, the company's relative position
(leader / challenger / niche), and key competitors or substitutes it faces.`;

  const result = await callStructured(model, system, user);
  return {
    marketPosition: result,
    steps: [logStep("Market & Competition Analysis", `Score ${result.score}/10 — ${result.summary}`)],
  };
}

async function riskAssessmentNode(state) {
  const model = getModel(0.35);
  const system = `You are a risk analyst on an investment committee, whose job is to surface reasons NOT to
invest. Respond with STRICT JSON only. Schema: {"score": number (0-10, where 10 = very low risk / very safe,
0 = extremely high risk), "summary": string (2-3 sentences), "redFlags": string[] (2-4 concrete risks:
regulatory, competitive, execution, governance, macro, etc.)}`;
  const user = `Company: "${state.companyName}"

Identify the key risks an investor should weigh before investing in this company right now.`;

  const result = await callStructured(model, system, user);
  return {
    riskAssessment: result,
    steps: [logStep("Risk Assessment", `Score ${result.score}/10 (risk-adjusted) — ${result.summary}`)],
  };
}

async function synthesizeNode(state) {
  const model = getModel(0.25);

  const weighted =
    state.businessModel.score * 0.3 +
    state.financialHealth.score * 0.3 +
    state.marketPosition.score * 0.2 +
    state.riskAssessment.score * 0.2;

  const system = `You are the chair of an investment committee making the FINAL call on whether to invest in
a company, based on four analyst reports handed to you. Weigh them holistically — do not just average
numbers, use judgement. Respond with STRICT JSON only. Schema: {"verdict": "INVEST" | "PASS", "confidence":
number (0-100), "thesis": string (3-5 sentences explaining the decision in plain language), "keyDrivers":
string[] (2-4 factors that most influenced the call), "conditionsToRevisit": string[] (1-3 things that, if
they changed, could flip the decision)}`;

  const user = `Company: "${state.companyName}"

Composite analyst score (0-10, reference only — use your own judgement, don't just repeat it): ${weighted.toFixed(2)}

Business Model Report: ${JSON.stringify(state.businessModel)}

Financial Health Report: ${JSON.stringify(state.financialHealth)}

Market & Competition Report: ${JSON.stringify(state.marketPosition)}

Risk Assessment Report: ${JSON.stringify(state.riskAssessment)}

Make the final INVEST or PASS call.`;

  const result = await callStructured(model, system, user);

  return {
    decision: {
      ...result,
      compositeScore: Number(weighted.toFixed(2)),
    },
    steps: [
      logStep(
        "Investment Committee Decision",
        `${result.verdict} — confidence ${result.confidence}%`
      ),
    ],
  };
}

// ---- Graph assembly --------------------------------------------------

function buildGraph() {
  const graph = new StateGraph(AgentState)
    .addNode("businessModel", businessModelNode)
    .addNode("financialHealth", financialHealthNode)
    .addNode("marketPosition", marketPositionNode)
    .addNode("riskAssessment", riskAssessmentNode)
    .addNode("synthesize", synthesizeNode)
    // Fan out from START into four parallel research nodes
    .addEdge(START, "businessModel")
    .addEdge(START, "financialHealth")
    .addEdge(START, "marketPosition")
    .addEdge(START, "riskAssessment")
    // Fan in — synthesize waits for all four
    .addEdge("businessModel", "synthesize")
    .addEdge("financialHealth", "synthesize")
    .addEdge("marketPosition", "synthesize")
    .addEdge("riskAssessment", "synthesize")
    .addEdge("synthesize", END);

  return graph.compile();
}

let compiledGraph;
function getGraph() {
  if (!compiledGraph) compiledGraph = buildGraph();
  return compiledGraph;
}

/**
 * Runs the full research + decision workflow for a company.
 * @param {string} companyName
 * @returns {Promise<object>} final agent state
 */
export async function runInvestmentAgent(companyName) {
  const graph = getGraph();
  const result = await graph.invoke({
    companyName,
    steps: [logStep("Agent Started", `Researching "${companyName}"`)],
  });
  return result;
}
