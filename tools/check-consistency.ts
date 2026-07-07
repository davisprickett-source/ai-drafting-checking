#!/usr/bin/env bun
/**
 * check-consistency.ts — book-wide key-term consistency (Barnwell: Lexical
 * correspondence [L], "same source word rendered consistently unless there is
 * reason not to"). The per-verse tools can't see this class at all — a term
 * drifting between three renderings across a book looks locally fine in every
 * verse. This is the free, deterministic pass that sees the whole book.
 *
 * Two checks per key term:
 *   1. PRESENCE  (needs an LWC parallel): verses where the LWC text shows the
 *      concept but the draft/translation lacks the anchored rendering —
 *      a paraphrase, a variant, or drift. Each is a verse to eyeball.
 *   2. VARIANTS  (needs declared variants): where known competing renderings
 *      (from `variants` regexes or the profile's borrowings) appear instead of
 *      the anchored form — inconsistency made countable.
 *
 * Config — profile `consistency_terms` (preferred):
 *   [{ "label": "God", "target": "\\bMalwa\\b", "lwc": "\\bDieu\\b|\\bGod\\b",
 *      "variants": "\\bAllah\\b", "note": "team decision 2025-03" }]
 * Fallback: derived from `key_terms_anchor` (label = key used as the LWC
 * pattern — only meaningful when the LWC matches the anchor keys' language;
 * target = anchor value up to the first parenthesis). Derived patterns are
 * guesses — declare consistency_terms for real checks.
 *
 * Usage:
 *   bun tools/check-consistency.ts <text.json> [--lwc <parallel.json>]
 *   (works on a draft OR the corpus OR a check-set — any verse-keyed file)
 */
import { readFileSync } from "fs";
import { loadProfile } from "./lib/profile.ts";

const profile = loadProfile();
const argv = process.argv.slice(2);
const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const files = argv.filter((a, i) => !a.startsWith("--") && !["--lwc", "--profile"].includes(argv[i - 1]));
if (files.length !== 1) {
  console.error("usage: bun tools/check-consistency.ts <verse-keyed.json> [--lwc <parallel.json>]");
  process.exit(2);
}

const load = (p: string): Record<string, unknown> => {
  const j = JSON.parse(readFileSync(p, "utf8"));
  return j.verses ?? j;
};
const getText = (v: unknown): string => (typeof v === "string" ? v : ((v as { draft?: string })?.draft ?? ""));

interface Term { label: string; target: RegExp; lwc?: RegExp; variants?: RegExp; note?: string; derived: boolean }
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let terms: Term[] = [];
const declared = profile.raw?.consistency_terms;
if (Array.isArray(declared) && declared.length) {
  terms = declared.map((t: any) => ({
    label: t.label,
    target: new RegExp(t.target, "iu"),
    lwc: t.lwc ? new RegExp(t.lwc, "iu") : undefined,
    variants: t.variants ? new RegExp(t.variants, "iu") : undefined,
    note: t.note,
    derived: false,
  }));
} else {
  for (const [k, v] of Object.entries(profile.key_terms_anchor)) {
    const form = String(v).split("(")[0].split("—")[0].trim();
    if (!form || /TODO|check|verify/i.test(form)) continue;
    terms.push({ label: k, target: new RegExp(esc(form), "iu"), lwc: new RegExp(`\\b${esc(k.split("/")[0].trim())}\\b`, "iu"), derived: true });
  }
}
if (!terms.length) {
  console.error("✗ nothing to check: declare consistency_terms (or key_terms_anchor) in the profile.");
  process.exit(2);
}

// Optional LWC parallel for the presence check.
let lwc: Record<string, unknown> | null = null;
let lwcPath = get("--lwc");
if (!lwcPath) {
  const refs = profile.paths.references ?? {};
  lwcPath = (Object.values(refs)[0] as string) ?? null;
}
if (lwcPath) { try { lwc = load(lwcPath); } catch { lwc = null; } }

const text = load(files[0]);
const refs = Object.keys(text);
const derivedNote = terms.some((t) => t.derived);

console.log(`consistency check — ${files[0]} · ${terms.length} term(s)${lwc ? ` · presence vs ${lwcPath}` : " · no LWC parallel (presence check off)"}`);
if (derivedNote) console.log(`(patterns DERIVED from key_terms_anchor — guesses; declare consistency_terms in the profile for real checks)`);
console.log("");

let totalFlags = 0;
for (const t of terms) {
  const hits: string[] = [];
  const missing: string[] = [];
  const variantHits: string[] = [];
  for (const ref of refs) {
    const body = getText(text[ref]);
    const has = t.target.test(body);
    if (has) hits.push(ref);
    if (t.variants && t.variants.test(body)) variantHits.push(ref);
    if (lwc && t.lwc && lwc[ref] != null && t.lwc.test(getText(lwc[ref])) && !has) missing.push(ref);
  }
  const flags = missing.length + variantHits.length;
  totalFlags += flags;
  const mark = flags ? "▸" : "✓";
  console.log(`${mark} ${t.label}: anchored form in ${hits.length} verse(s)${t.note ? `  [${t.note}]` : ""}`);
  if (variantHits.length) {
    console.log(`    variant rendering in ${variantHits.length} verse(s): ${variantHits.slice(0, 8).join(", ")}${variantHits.length > 8 ? " …" : ""}`);
  }
  if (missing.length) {
    console.log(`    concept in LWC but anchored form absent in ${missing.length} verse(s): ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? " …" : ""}`);
    console.log(`      (paraphrase, pronoun back-reference, or drift — eyeball these; not every hit is an error)`);
  }
}

console.log(`\n--- ${totalFlags} consistency flag(s) across ${refs.length} verse(s) ---`);
console.log(`Consistency is a TEAM POLICY question (CONNOT: Lexical correspondence [L], DECIDED-BY team policy):`);
console.log(`flags here feed a consistency discussion, they don't mandate uniformity — some variation is deliberate.`);
process.exit(0);
