#!/usr/bin/env bun
/**
 * check-completeness.ts — the free accuracy net the linter can't be.
 *
 * check-draft certifies FORM (orthography, attested words). This tool checks two
 * cheap, deterministic proxies for MEANING-completeness against the team's LWC
 * parallel, per verse:
 *
 *   1. NEGATION PARITY — the LWC verse is negated but the draft contains no
 *      target-language negator (or vice versa). Dropped negation is the single
 *      most catastrophic silent error a fluent draft can carry.
 *   2. LENGTH RATIO — the draft's token count vs the LWC verse's, compared to
 *      the median ratio across the passage. A verse far below the median has
 *      probably dropped a clause; far above has probably added one.
 *
 * Both are HEURISTIC FLAGS for a human to check, not verdicts — some languages
 * negate morphologically inside the verb (declare those patterns in the profile
 * or expect false positives), and length varies legitimately. But a zero-cost
 * check that catches dropped negation/clauses even sometimes pays for itself
 * forever. This does not replace the blinded back-translation; it runs before it.
 *
 * Profile fields used:
 *   negators       — regex list matching target-language negation morphemes  (required for check 1)
 *   lwc_negators   — regex list for the LWC (optional; built-ins exist for
 *                    french/english/spanish/arabic/portuguese/swahili)
 *
 * Usage:
 *   bun tools/check-completeness.ts <draft.json> [--lwc <parallel.json>] [--ratio-tolerance 0.4]
 *   (default LWC parallel = first entry in profile.paths.references)
 */
import { readFileSync } from "fs";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile } from "./lib/profile.ts";

const profile = loadProfile();
const argv = process.argv.slice(2);
const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const files = argv.filter((a, i) => !a.startsWith("--") && !["--lwc", "--ratio-tolerance", "--profile", "--lexicon"].includes(argv[i - 1]));
if (files.length !== 1) {
  console.error("usage: bun tools/check-completeness.ts <draft.json> [--lwc <parallel.json>] [--ratio-tolerance 0.4]");
  process.exit(2);
}
const TOL = Number(get("--ratio-tolerance") ?? 0.4);

const load = (p: string): Record<string, unknown> => {
  const j = JSON.parse(readFileSync(p, "utf8"));
  return j.verses ?? j;
};
const getText = (v: unknown): string => (typeof v === "string" ? v : ((v as { draft?: string })?.draft ?? ""));

// LWC parallel: --lwc, else first path in profile.paths.references.
let lwcPath = get("--lwc");
if (!lwcPath) {
  const refs = profile.paths.references ?? {};
  const first = Object.values(refs)[0];
  if (!first) {
    console.error("✗ no LWC parallel: pass --lwc <parallel.json> or set profile paths.references.");
    process.exit(2);
  }
  lwcPath = first as string;
}
let lwc: Record<string, unknown>;
try {
  lwc = load(lwcPath);
} catch (e) {
  console.error(`✗ cannot read LWC parallel ${lwcPath}: ${(e as Error).message}`);
  process.exit(2);
}

// Negator patterns.
const BUILTIN: Record<string, string[]> = {
  french: ["\\bne\\b", "\\bn['’]", "\\bpas\\b", "\\bjamais\\b", "\\brien\\b", "\\bpersonne\\b", "\\baucun(e)?\\b", "\\bni\\b", "\\bnul(le)?\\b", "\\bpoint\\b"],
  english: ["\\bnot\\b", "n['’]t\\b", "\\bno\\b", "\\bnever\\b", "\\bnothing\\b", "\\bnone\\b", "\\bneither\\b", "\\bnor\\b", "\\bcannot\\b"],
  spanish: ["\\bno\\b", "\\bnunca\\b", "\\bjamás\\b", "\\bnada\\b", "\\bnadie\\b", "\\bningun[oa]?\\b", "\\bni\\b", "\\btampoco\\b"],
  portuguese: ["\\bnão\\b", "\\bnunca\\b", "\\bjamais\\b", "\\bnada\\b", "\\bninguém\\b", "\\bnenhum(a)?\\b", "\\bnem\\b"],
  arabic: ["لا", "لم", "لن", "ما\\s", "ليس", "غير", "بلا"],
  swahili: ["\\bsi\\b", "\\bha(t[au])?\\w*", "\\bhaku\\w*", "\\bkamwe\\b"],
};
const lwcName = (profile.lwc[0] ?? "").toLowerCase();
const lwcNegSrc: string[] =
  (Array.isArray(profile.raw?.lwc_negators) && profile.raw.lwc_negators.length && profile.raw.lwc_negators) ||
  BUILTIN[Object.keys(BUILTIN).find((k) => lwcName.includes(k)) ?? ""] ||
  [];
const tgtNegSrc: string[] = Array.isArray(profile.raw?.negators) ? profile.raw.negators : [];

const lwcNeg = lwcNegSrc.map((s) => new RegExp(s, "iu"));
const tgtNeg = tgtNegSrc.map((s) => new RegExp(s, "iu"));
const hasNeg = (res: RegExp[], s: string) => res.some((r) => r.test(s));

const draft = load(files[0]);
const refs = Object.keys(draft).filter((r) => lwc[r] != null);
if (!refs.length) {
  console.error(`✗ no shared verse refs between the draft and the LWC parallel (check book_aliases / ref format).`);
  process.exit(2);
}
const skippedRefs = Object.keys(draft).length - refs.length;

// Pass 1: ratios.
const strip = (s: string) => s.replace(/⟨\?⟩|⟨≈⟩/g, "").replace(/⟦[^⟧]*⟧/g, "").replace(/\{([^⟂{}]*)⟂[^}]*\}/g, "$1");
const data = refs.map((ref) => {
  const d = strip(getText(draft[ref]));
  const l = getText(lwc[ref]);
  return { ref, d, l, dn: tokenize(d).length, ln: tokenize(l).length || 1 };
});
const ratios = data.map((x) => x.dn / x.ln).sort((a, b) => a - b);
const median = ratios[Math.floor(ratios.length / 2)] || 1;

let negFlags = 0, lenFlags = 0;
console.log(`completeness check — ${files[0]} vs ${lwcPath}`);
console.log(`${refs.length} shared verse(s)${skippedRefs ? ` (${skippedRefs} draft verse(s) not in the parallel — skipped)` : ""} · median draft/LWC length ratio ${median.toFixed(2)}`);
if (!tgtNeg.length)
  console.log(`! negation parity SKIPPED: profile has no "negators" — add your language's negation morpheme regexes to enable the highest-value check here.`);
else if (!lwcNeg.length)
  console.log(`! negation parity SKIPPED: no built-in negators for LWC "${profile.lwc[0]}" — add "lwc_negators" to the profile.`);
console.log("");

for (const x of data) {
  const notes: string[] = [];
  if (tgtNeg.length && lwcNeg.length) {
    const ln = hasNeg(lwcNeg, x.l);
    const dn = hasNeg(tgtNeg, x.d);
    if (ln && !dn) { notes.push("LWC verse is NEGATED but draft has no negator — check for dropped negation"); negFlags++; }
    else if (!ln && dn) { notes.push("draft is negated but LWC verse is not — check for added negation"); negFlags++; }
  }
  const ratio = x.dn / x.ln;
  if (ratio < median * (1 - TOL)) { notes.push(`short vs parallel (ratio ${ratio.toFixed(2)} vs median ${median.toFixed(2)}) — check for a dropped clause`); lenFlags++; }
  else if (ratio > median * (1 + TOL)) { notes.push(`long vs parallel (ratio ${ratio.toFixed(2)} vs median ${median.toFixed(2)}) — check for added material`); lenFlags++; }
  for (const n of notes) console.log(`  ▸ ${x.ref}  ${n}`);
}

console.log(`\n--- ${negFlags} negation flag(s), ${lenFlags} length flag(s) across ${refs.length} verse(s) ---`);
console.log(`These are heuristic pointers for a human (or the back-translation step) to check — not verdicts.`);
console.log(`A clean result here does NOT verify accuracy; it only clears the two cheapest failure modes.`);
process.exit(negFlags > 0 ? 1 : 0);
