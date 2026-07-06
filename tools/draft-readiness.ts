#!/usr/bin/env bun
/**
 * draft-readiness.ts — how well CAN this system draft with the data it has?
 *
 * A team with one translated book and a team with a whole NT should get very
 * different advice, and the system — not the team — should be the one that
 * knows the difference. This reads the corpus + lexicon + sources manifest and
 * reports, in plain language: overall readiness, per-genre readiness, and what
 * to do next (draft / draft-with-caution / elicit first).
 *
 * Deterministic, free, no inference. The bands are heuristics, stated as such.
 *
 * Usage: bun tools/draft-readiness.ts [--profile profiles/<iso>.json]
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile, ROOT, rel } from "./lib/profile.ts";

const profile = loadProfile();

// USFM book code → broad genre. Drafting leans on genre-matched exemplars, so
// coverage is judged per genre, not just in bulk.
const GENRE: Record<string, string> = {
  GEN: "narrative", EXO: "narrative", LEV: "law", NUM: "narrative", DEU: "law",
  JOS: "narrative", JDG: "narrative", RUT: "narrative", "1SA": "narrative", "2SA": "narrative",
  "1KI": "narrative", "2KI": "narrative", "1CH": "narrative", "2CH": "narrative",
  EZR: "narrative", NEH: "narrative", EST: "narrative",
  JOB: "poetry", PSA: "poetry", PRO: "poetry", ECC: "poetry", SNG: "poetry", LAM: "poetry",
  ISA: "prophecy", JER: "prophecy", EZK: "prophecy", DAN: "prophecy", HOS: "prophecy",
  JOL: "prophecy", AMO: "prophecy", OBA: "prophecy", JON: "narrative", MIC: "prophecy",
  NAM: "prophecy", HAB: "prophecy", ZEP: "prophecy", HAG: "prophecy", ZEC: "prophecy", MAL: "prophecy",
  MAT: "gospel", MRK: "gospel", LUK: "gospel", JHN: "gospel", ACT: "narrative",
  ROM: "epistle", "1CO": "epistle", "2CO": "epistle", GAL: "epistle", EPH: "epistle",
  PHP: "epistle", COL: "epistle", "1TH": "epistle", "2TH": "epistle", "1TI": "epistle",
  "2TI": "epistle", TIT: "epistle", PHM: "epistle", HEB: "epistle", JAS: "epistle",
  "1PE": "epistle", "2PE": "epistle", "1JN": "epistle", "2JN": "epistle", "3JN": "epistle",
  JUD: "epistle", REV: "apocalyptic",
};
const ALL_GENRES = ["narrative", "gospel", "law", "poetry", "prophecy", "epistle", "apocalyptic"];

// --- Load corpus ---
let corpus: Record<string, string> = {};
try {
  const j = JSON.parse(readFileSync(profile.paths.corpus, "utf8"));
  corpus = (j.verses ?? j) as Record<string, string>;
} catch {
  console.log(`READINESS: NONE — no readable corpus at ${profile.paths.corpus}.`);
  console.log(`Without a corpus there is no evidence base: the system cannot draft in ${profile.language},`);
  console.log(`only elicit. Start with elicitation/ELICITATION.md and register any existing language`);
  console.log(`data via tools/register-source.ts; even a few hundred team-approved sentences change this picture.`);
  process.exit(0);
}

const refs = Object.keys(corpus);
const verseCount = refs.length;
let tokens = 0;
const uniq = new Set<string>();
const freq = new Map<string, number>();
for (const ref of refs) {
  for (const t of tokenize(corpus[ref] ?? "")) {
    tokens++;
    uniq.add(t);
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
}
let hapax = 0;
for (const n of freq.values()) if (n === 1) hapax++;
const hapaxPct = uniq.size ? Math.round((hapax / uniq.size) * 100) : 0;

// Books + genres present
const bookVerses = new Map<string, number>();
for (const ref of refs) {
  const book = ref.split(/[:. ]/)[0].toUpperCase();
  bookVerses.set(book, (bookVerses.get(book) ?? 0) + 1);
}
const genreVerses = new Map<string, number>();
for (const [book, n] of bookVerses) {
  const g = GENRE[book] ?? "unknown";
  genreVerses.set(g, (genreVerses.get(g) ?? 0) + n);
}

// Approved forms + sources
let approved = 0;
try {
  const a = JSON.parse(readFileSync(profile.paths.approved_additions!, "utf8"));
  approved = (a.forms ?? []).length;
} catch {}
let sources: any[] = [];
const manifestPath = profile.paths.sources
  ? rel(profile.paths.sources)
  : join(ROOT, "sources", `${profile.iso639_3}-sources.json`);
if (existsSync(manifestPath)) {
  try { sources = JSON.parse(readFileSync(manifestPath, "utf8")).sources ?? []; } catch {}
}

// --- Bands (heuristic, honest about being heuristic) ---
type Band = "ELICITATION-FIRST" | "ASSISTED" | "WORKABLE" | "STRONG";
function band(verses: number): Band {
  if (verses < 300) return "ELICITATION-FIRST";
  if (verses < 1500) return "ASSISTED";
  if (verses < 5000) return "WORKABLE";
  return "STRONG";
}
const ADVICE: Record<Band, string> = {
  "ELICITATION-FIRST":
    "Too little data to draft responsibly — most content words will be unattested and the linter's membership check is nearly blind at this size. Run elicitation (elicitation/ELICITATION.md) and register outside sources first; draft only short, heavily-flagged trial passages to generate elicitation questions.",
  ASSISTED:
    "Drafting is possible but expect a high unattested rate and lean hard on the flags: keep passages short, genre-matched to what the corpus has, run the free verify-revise loop (MODES.md L1.5) every round, and turn every ⟨?⟩/⟨≈⟩ into an elicitation question.",
  WORKABLE:
    "A workable evidence base for genre-matched drafting. Follow the full protocol (in-context pack, exemplar retrieval, council or relay, blinded back-translation). Watch the per-genre table — strength in one genre does not transfer to another.",
  STRONG:
    "A strong evidence base. The system's mechanical layer is meaningful at this size; the remaining risk is exactly the kind the flags cannot see (accuracy), so keep the back-translation + human review non-negotiable.",
};

const overall = band(verseCount);
console.log(`Draft-readiness — ${profile.language} (${profile.iso639_3})\n`);
console.log(`corpus: ${verseCount.toLocaleString()} verses · ${tokens.toLocaleString()} tokens · ${uniq.size.toLocaleString()} unique words · ${hapaxPct}% hapax`);
console.log(`growing layer: ${approved} human-approved form(s) · ${sources.length} registered enrichment source(s)`);
console.log(`books: ${[...bookVerses.keys()].join(", ") || "none"}\n`);

console.log(`OVERALL: ${overall}`);
console.log(ADVICE[overall].split(". ").map((s) => `  ${s}${s.endsWith(".") ? "" : "."}`).join("\n"));

console.log(`\nPer-genre readiness (drafting leans on genre-matched exemplars):`);
for (const g of ALL_GENRES) {
  const n = genreVerses.get(g) ?? 0;
  const b = band(n);
  const marker = b === "ELICITATION-FIRST" ? "✗" : b === "ASSISTED" ? "!" : "✓";
  console.log(`  ${marker} ${g.padEnd(12)} ${String(n).padStart(6)} verses → ${b}`);
}
const unknown = genreVerses.get("unknown") ?? 0;
if (unknown) console.log(`  ? unknown book codes: ${unknown} verses (check book_aliases in the profile)`);

console.log(`\nNotes:`);
console.log(`- Bands are verse-count heuristics, not guarantees; a 6,000-verse corpus of one dialect`);
console.log(`  can still be thin for another register. Treat this as triage, not certification.`);
if (hapaxPct > 55)
  console.log(`- Hapax share is high (${hapaxPct}%) — the lexicon is sparse relative to vocabulary; expect`);
if (hapaxPct > 55)
  console.log(`  more false "unattested" flags on genuinely good words. approve-form.ts is the fix.`);
if ((genreVerses.get("poetry") ?? 0) < 300)
  console.log(`- Poetry is ${genreVerses.get("poetry") ?? 0} verses: do NOT draft Psalms/poetry yet regardless of the`);
if ((genreVerses.get("poetry") ?? 0) < 300)
  console.log(`  overall band — poetic register can't be inferred from narrative prose. Elicit first.`);
console.log(`- Re-run after every corpus update or elicitation round; readiness should climb with use.`);
