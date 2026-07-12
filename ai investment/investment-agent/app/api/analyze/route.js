import { NextResponse } from "next/server";
import { runInvestmentAgent } from "../../../lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();
    const companyName = (body?.companyName || "").trim();

    if (!companyName) {
      return NextResponse.json(
        { error: "companyName is required." },
        { status: 400 }
      );
    }
    if (companyName.length > 120) {
      return NextResponse.json(
        { error: "companyName is too long." },
        { status: 400 }
      );
    }

    const result = await runInvestmentAgent(companyName);

    return NextResponse.json({
      companyName,
      steps: result.steps,
      businessModel: result.businessModel,
      financialHealth: result.financialHealth,
      marketPosition: result.marketPosition,
      riskAssessment: result.riskAssessment,
      decision: result.decision,
    });
  } catch (err) {
    console.error("Agent error:", err);
    const message =
      err?.message?.includes("GOOGLE_API_KEY") || err?.message?.includes("GEMINI_API_KEY")
        ? err.message
        : "The research agent hit an error. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
