#!/usr/bin/env bun
// discover-term — concept → attested-local-word DISCOVERY (the complement to grep-corpus).
//
// grep-corpus answers "is this local form attested?" — you must already know the form.
// discover-term answers "what attested local word could express THIS concept?" — given a
// gloss in a language of wider communication (LWC) + synonyms, it finds the corpus verses
// about that concept (via an LWC parallel that shares verse keys with the corpus), pulls the
// ALIGNED local verses, and ranks the local content-words that recur. Candidates are
// PROPOSALS — always flag ⟨?⟩ until grep-corpus + a human confirm the sense.
//
// LANGUAGE-AGNOSTIC: the LWC parallel(s) come from the profile (paths.references, a
// {label: path} map). Pick one with --ref <label|path>; default is the first declared.
// If the parallel's verse keys differ from the corpus keys, set book_aliases in the profile.
//
// Usage:
//   bun tools/discover-term.ts <concept> [synonym ...]                 # default LWC parallel
//   bun tools/discover-term.ts --ref fr-lsg engloutir avaler --top 8   # choose a parallel
//   bun tools/discover-term.ts --ref reference-versions/es-rvr.json refugio cabaña
import { readFileSync } from "fs";
import { loadProfile, loadVerses, rel } from "./lib/profile.ts";

const profile = loadProfile();
const args = process.argv.slice(2);

function optVal(flag: string): string | null {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}
const topN = parseInt(optVal("--top") || "12", 10) || 12;

// Resolve the LWC parallel to search.
const refs = profile.paths.references ?? {};
const refArg = optVal("--ref");
let refLabel: string;
let refPath: string;
if (refArg) {
  if (refs[refArg]) { refLabel = refArg; refPath = refs[refArg]; }
  else { refLabel = refArg; refPath = rel(refArg); }   // treat as a path
} else {
  const first = Object.keys(refs)[0];
  if (!first) {
    console.error(
      "no LWC parallel configured. Add paths.references { \"<label>\": \"<verse-keyed json>\" } to the profile, or pass --ref <path>.",
    );
    process.exit(2);
  }
  refLabel = first; refPath = refs[first];
}

// Strip flags + their values from positional args to get the concept terms.
const FLAGS_WITH_VAL = new Set(["--top", "--ref", "--profile"]);
const terms = args.filter((a, i) => !a.startsWith("--") && !FLAGS_WITH_VAL.has(args[i - 1]));
if (!terms.length) {
  console.error("usage: bun tools/discover-term.ts [--ref <label|path>] [--top N] <concept> [synonym ...]");
  process.exit(1);
}

const corpus = loadVerses(profile.paths.corpus);
const idx = loadVerses(refPath);

// Key alignment: reference key -> corpus key. Apply book_aliases to the book segment.
// Verse keys are assumed "Book:chapter:verse" (book may itself contain ':'? no — book is the
// segment before the last two colons).
const aliases = profile.book_aliases ?? {};
function toCorpusKey(refKey: string): string | null {
  if (corpus[refKey]) return refKey;
  const i = refKey.lastIndexOf(":", refKey.lastIndexOf(":") - 1);
  if (i < 0) return null;
  const book = refKey.slice(0, i), rest = refKey.slice(i + 1);
  const mapped = aliases[book];
  if (mapped && corpus[`${mapped}:${rest}`]) return `${mapped}:${rest}`;
  return null;
}

const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
const stop = new Set<string>((Array.isArray(profile.raw.stopwords) ? profile.raw.stopwords : []).map((s: string) => s.toLowerCase()));
const norm = (s: string) =>
  s.toLowerCase().replace(/[«».,:;!?‹›⟨⟩()<>’‘"]/g, " ").replace(/[ʼ'`]/g, "").replace(/\s+/g, " ").trim();

const hits: { ref: string; gloss: string; local: string }[] = [];
for (const refKey of Object.keys(idx)) {
  const gloss = typeof idx[refKey] === "string" ? idx[refKey] : JSON.stringify(idx[refKey]);
  if (!re.test(gloss)) continue;
  const ck = toCorpusKey(refKey);
  if (!ck) continue;
  hits.push({ ref: ck, gloss: gloss.trim(), local: corpus[ck] });
}

if (!hits.length) {
  console.log(`No corpus verses found for [${terms.join(", ")}] in the "${refLabel}" parallel. Try synonyms, another --ref, or check book_aliases.`);
  process.exit(0);
}

// Rank local content-words by document frequency across the concept-matching verses.
const df = new Map<string, Set<string>>();
for (const h of hits)
  for (const w of new Set(norm(h.local).split(" "))) {
    if (w.length < 3 || stop.has(w) || /^\d+$/.test(w)) continue;
    if (!df.has(w)) df.set(w, new Set());
    df.get(w)!.add(h.ref);
  }
const ranked = [...df.entries()].map(([w, r]) => ({ w, n: r.size })).filter((x) => x.n >= 2).sort((a, b) => b.n - a.n).slice(0, topN);

console.log(`\nconcept: [${terms.join(" | ")}]  ·  ${hits.length} "${refLabel}"-matched verses\n`);
console.log(`=== CANDIDATE local words (recur across ≥2 concept verses — PROPOSALS, flag ⟨?⟩ & confirm sense) ===`);
if (!ranked.length) console.log("  (no word recurs across 2+ verses — inspect the verses below directly)");
for (const r of ranked) console.log(`  ${r.w}  (in ${r.n} verses) → verify: bun tools/grep-corpus.ts "${r.w}"`);
console.log(`\n=== EVIDENCE (${Math.min(hits.length, 10)} of ${hits.length}) ===`);
for (const h of hits.slice(0, 10)) console.log(`\n[${h.ref}]\n  gloss: ${h.gloss.slice(0, 110)}\n  local: ${h.local.slice(0, 130)}`);
