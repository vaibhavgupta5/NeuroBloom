import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string", description: "2-3 sentence plain-language summary for the family" },
    progress: { type: "string", description: "Paragraph on skill and goal progress, citing the numbers given" },
    regulation: { type: "string", description: "Paragraph on mood, sleep and behaviour logs, or note the data is sparse" },
    recommendations: { type: "array", items: { type: "string" }, description: "3-5 concrete next steps for home and therapy" },
  },
  required: ["summary", "progress", "regulation", "recommendations"],
  additionalProperties: false,
};

const SYSTEM = `You draft progress reports for a paediatric developmental therapist using a home practice app for autistic children.
Write in warm, neurodiversity-affirming, plain language that a parent can read.
Use only the metrics provided. Never invent numbers, diagnoses, or events. If data is missing or sparse, say so.
Do not make diagnostic or medical claims. This is a draft the therapist will review and edit.`;

/** Structured metrics → report sections. Uses Claude when ANTHROPIC_API_KEY is set, a template otherwise. */
export async function draftReport(metrics) {
  if (!process.env.ANTHROPIC_API_KEY) return { ...templateReport(metrics), generatedBy: "template" };

  const client = new Anthropic();
  let response;
  try {
    response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: `Metrics for the reporting period (JSON):\n${JSON.stringify(metrics, null, 2)}` }],
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Report draft API error ${err.status}:`, err.message);
      return { ...templateReport(metrics), generatedBy: "template" };
    }
    throw err;
  }

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    return { ...templateReport(metrics), generatedBy: "template" };
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  try {
    return { ...JSON.parse(text), generatedBy: "ai" };
  } catch {
    return { ...templateReport(metrics), generatedBy: "template" };
  }
}

function templateReport(m) {
  const goalLines = m.goals.length
    ? m.goals.map((g) => `${g.title} (${g.status}; ${g.sessionsMeetingCriterion}/${g.sessionsNeeded} recent sessions at ≥${g.criterionPct}% independent)`).join("; ")
    : "No goals were set for this period";
  const skills = m.skills.length
    ? m.skills.map((s) => `${s.skill}: ${s.sessions} sessions, ${s.avgAccuracy}% average accuracy, level ${s.level}`).join("; ")
    : "no completed activities";
  return {
    summary: `${m.child.name} completed ${m.totals.completedSessions} activities over ${m.period.days} days (${m.totals.activeDays} active days). Independence (correct with no prompt) was ${m.totals.independencePct ?? "not yet measured"}${m.totals.independencePct != null ? "%" : ""}.`,
    progress: `Skills: ${skills}. Goals: ${goalLines}.`,
    regulation: m.wellbeing.moodEntries
      ? `Average mood ${m.wellbeing.avgMood}/5 across ${m.wellbeing.moodEntries} check-ins. ${m.wellbeing.behaviorIncidents} behaviour incidents logged (highest intensity ${m.wellbeing.maxIntensity}/5). Average sleep ${m.wellbeing.avgSleep ?? "not logged"}${m.wellbeing.avgSleep != null ? " h" : ""}. Calm Corner used ${m.wellbeing.calmUses} times.`
      : "Not enough mood or behaviour data was logged this period to comment on regulation.",
    recommendations: [
      "Continue short daily sessions at the current levels.",
      m.goals.some((g) => g.status === "active") ? "Keep practising the active goals at home using the daily coaching activity." : "Agree on one or two measurable goals for the next period.",
      "Log mood, sleep and any difficult moments so patterns are easier to see.",
    ],
  };
}
