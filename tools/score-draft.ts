#!/usr/bin/env bun
/**
 * score-draft.ts — compute GROUNDED, per-verse confidence signals for a draft.
 *
 * Confidence here is NOT the model's self-rating. It is an ensemble of
 * mechanical signals — with their limits stated:
 *   - lexical attestation: % of CONTENT words (profile stopwords excluded)
 *     attested in the corpus lexicon
 *   - uncertainty markers: count of ⟨?⟩ and {A ⟂ B} the model emitted. NOTE:
 *     these are model self-report — a model that under-flags scores higher, so
 *     never read a low marker count as evidence of correctness.
 *   - cross-model agreement: content-token overlap (Jaccard) with a second
 *     draft: ≥0.8 agree · <0.5 disagree · between = partial (neither)
 * (back-translation fidelity and source-difficulty are model/curation inputs,
 *  not computed here — see references/draft-annotation.md.)
 *
 * Tier: HIGH (attestation ≥97%, no markers, AND a second draft agrees) · LOW
 * (attestation <85%, or markers present, or disagree) · MEDIUM otherwise.
 * Without --vs there is no corroborating signal, so a single draft caps at
 * MEDIUM: attestation alone cannot rule out a fluent verse that says the wrong
 * thing. The tiers are MECHANICAL triage, not an accuracy verdict.
 *
 * Usage:
 *   bun tools/score-draft.ts <draft.json> [--vs <other-draft.json>] [--lexicon <path>]
 *   (default lexicon = profile.paths.lexicon)
 *
 * Accepts plain ({ref: "text"}) or annotated ({ref: {draft: "text", ...}}) drafts.
 */
import { readFileSync } from "fs";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile } from "./lib/profile.ts";

const profile = loadProfile();
const args = process.argv.slice(2);
let lexPath = profile.paths.lexicon;
let vsPath: string | null = null;
const files: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--lexicon") lexPath = args[++i];
  else if (args[i] === "--vs") vsPath = args[++i];
  else if (args[i] === "--profile") i++;
  else files.push(args[i]);
}
if (files.length !== 1) {
  console.error("usage: bun tools/score-draft.ts <draft.json> [--vs <other.json>] [--lexicon <path>]");
  process.exit(2);
}

const LEX = new Set<string>(Object.keys(JSON.parse(readFileSync(lexPath, "utf8")).words));
const getText = (v: unknown): string => (typeof v === "string" ? v : ((v as { draft?: string })?.draft ?? ""));
const load = (p: string): Record<string, unknown> => {
  const j = JSON.parse(readFileSync(p, "utf8"));
  return j.verses ?? j;
};

const draft = load(files[0]);
const other = vsPath ? load(vsPath) : null;

// Attestation is computed over CONTENT words only. Function words (the profile's
// stopwords) are high-frequency and always attested, so counting them inflates the
// rate and lets a verse with several wrong content words clear the HIGH threshold.
const STOP = new Set<string>(
  Array.isArray(profile.raw?.stopwords) ? profile.raw.stopwords.map((s: string) => s.toLowerCase()) : []
);
const contentToks = (s: string) =>
  tokenize(s.normalize("NFC").replace(/⟨\?⟩/g, "")).filter((t) => !STOP.has(t));

const tiers: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
console.log(`scoring ${files[0]}${vsPath ? ` vs ${vsPath}` : ""}${STOP.size ? "" : "\n(no stopwords in profile — attestation runs over ALL tokens and will read high)"}\n`);

for (const ref of Object.keys(draft)) {
  const text = getText(draft[ref]);
  const content = contentToks(text);
  const scored = content.length ? content : tokenize(text);
  const attested = scored.filter((t) => LEX.has(t)).length;
  const rate = scored.length ? attested / scored.length : 1;
  const markers = (text.match(/⟨\?⟩/g) || []).length;
  const options = (text.match(/⟂/g) || []).length;

  // Cross-draft agreement = content-token overlap (Jaccard), not exact string match.
  // Exact match is vacuous for real verses (any two translations differ somewhere,
  // so everything "disagrees" and the signal carries nothing). Overlap grades it:
  // ≥0.8 agree · <0.5 disagree · between = partial (counts as neither).
  const hasOther = !!(other && other[ref] != null);
  let agree: boolean | null = null;
  let overlap: number | null = null;
  if (hasOther) {
    const a = new Set(content);
    const b = new Set(contentToks(getText(other![ref])));
    const uni = new Set([...a, ...b]);
    const inter = [...a].filter((x) => b.has(x)).length;
    overlap = uni.size ? inter / uni.size : 1;
    agree = overlap >= 0.8 ? true : overlap < 0.5 ? false : null;
  }

  const reasons: string[] = [];
  if (rate < 0.97) reasons.push(`content attestation ${(rate * 100).toFixed(0)}%`);
  if (markers) reasons.push(`${markers} ⟨?⟩ marker(s)`);
  if (options) reasons.push(`${options} option(s)`);
  if (agree === false) reasons.push(`models disagree (overlap ${((overlap ?? 0) * 100).toFixed(0)}%)`);
  else if (hasOther && agree === null) reasons.push(`partial cross-draft overlap (${((overlap ?? 0) * 100).toFixed(0)}%)`);

  let tier: "HIGH" | "MEDIUM" | "LOW";
  if (rate < 0.85 || markers > 0 || agree === false) tier = "LOW";
  else if (rate >= 0.97 && agree === true) tier = "HIGH";
  else {
    tier = "MEDIUM";
    // HIGH requires a corroborating signal beyond lexical attestation. A single
    // draft (no --vs) has none, so it caps at MEDIUM — attestation alone cannot
    // rule out a fluent, fully-attested verse that says the wrong thing.
    if (!hasOther && rate >= 0.97) reasons.push("no cross-draft check (single draft caps at MEDIUM)");
  }
  tiers[tier]++;

  const flag = tier === "HIGH" ? "  " : tier === "MEDIUM" ? "· " : "▸ ";
  console.log(`${flag}${ref}  [${tier}${reasons.length ? ": " + reasons.join(", ") : ""}]`);
}

const total = tiers.HIGH + tiers.MEDIUM + tiers.LOW;
console.log(`\n--- ${total} verses · HIGH ${tiers.HIGH} · MEDIUM ${tiers.MEDIUM} · LOW ${tiers.LOW} ---`);
console.log(`Review the ${tiers.LOW} LOW verses first.`);
console.log(
  `\nWhat these tiers mean: HIGH = every word corpus-attested, no uncertainty markers, AND a second\n` +
    `independent draft agrees. It is a MECHANICAL signal — it does NOT verify meaning. A fluent verse\n` +
    `that names the wrong participant or drops a negation can score HIGH. Accuracy is checked by the\n` +
    `back-translation step and the human review, never by this scorer.`
);
