#!/usr/bin/env bun
/**
 * compare-drafts.ts — align two or more verse-keyed drafts and surface where
 * they DISAGREE, ranked by how much. Cross-model disagreement is a high-signal
 * error flag: a verse the models render very differently is a verse at least
 * one of them is unsure about.
 *
 * Agreement is TOKEN OVERLAP (Jaccard), not exact string match — any two real
 * translations differ somewhere, so exact match calls everything a disagreement
 * and the signal carries nothing. Overlap grades it:
 *   ≥ 0.8 agree · 0.5–0.8 near (wording differs, substance mostly shared) ·
 *   < 0.5 disagree (substantively different — review these first, worst first)
 *
 * For each disagreement the diff shows the tokens unique to each draft — the
 * actual words in dispute, not two walls of text to eyeball.
 *
 * Accepts the standard draft format ({verses:{ref:text}}) or a flat {ref:text}.
 *
 * Usage:
 *   bun tools/compare-drafts.ts drafts/1sam1-claude.json drafts/1sam1-gemini.json [...]
 *   [--threshold 0.5]  lower bound for "near" vs "disagree" (default 0.5)
 */
import { readFileSync } from "fs";
import { tokenize } from "./lib/tokenize.ts";

const argv = process.argv.slice(2);
const ti = argv.indexOf("--threshold");
const THRESH = ti >= 0 ? Number(argv[ti + 1]) : 0.5;
const files = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--threshold");
if (files.length < 2) {
  console.error("usage: bun tools/compare-drafts.ts <draft1.json> <draft2.json> [...] [--threshold 0.5]");
  process.exit(2);
}

const getText = (v: unknown): string => (typeof v === "string" ? v : ((v as { draft?: string })?.draft ?? ""));
const clean = (s: string) => s.replace(/⟨\?⟩|⟨≈⟩/g, "").replace(/⟦[^⟧]*⟧/g, "");
const toks = (s: string) => new Set(tokenize(clean(s)));

const drafts = files.map((f) => {
  const j = JSON.parse(readFileSync(f, "utf8"));
  const verses: Record<string, unknown> = j.verses ?? j;
  return { name: j.model ?? f, verses };
});

const jaccard = (a: Set<string>, b: Set<string>): number => {
  const uni = new Set([...a, ...b]);
  if (!uni.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / uni.size;
};

const allRefs = [...new Set(drafts.flatMap((d) => Object.keys(d.verses)))].sort();
let agree = 0, near = 0, partial = 0;
type Dis = { ref: string; overlap: number; cells: string[] };
const disagreements: Dis[] = [];

for (const ref of allRefs) {
  const cells = drafts.map((d) => (d.verses[ref] != null ? getText(d.verses[ref]) : null));
  if (cells.some((c) => c == null)) {
    partial++;
    continue;
  }
  const sets = (cells as string[]).map(toks);
  // pairwise minimum overlap across the panel — the widest split drives the verdict
  let min = 1;
  for (let i = 0; i < sets.length; i++)
    for (let j = i + 1; j < sets.length; j++) min = Math.min(min, jaccard(sets[i], sets[j]));
  if (min >= 0.8) agree++;
  else if (min >= THRESH) near++;
  else disagreements.push({ ref, overlap: min, cells: cells as string[] });
}

disagreements.sort((a, b) => a.overlap - b.overlap); // most divergent first
for (const d of disagreements) {
  console.log(`\n✗ DISAGREE ${d.ref}  (overlap ${(d.overlap * 100).toFixed(0)}%)`);
  const sets = d.cells.map(toks);
  drafts.forEach((dr, i) => {
    const others = new Set(sets.flatMap((s, j) => (j === i ? [] : [...s])));
    const unique = [...sets[i]].filter((t) => !others.has(t));
    console.log(`    [${dr.name}] ${d.cells[i]}`);
    if (unique.length) console.log(`        only here: ${unique.join(" · ")}`);
  });
}

console.log(
  `\n--- ${allRefs.length} verses · ${agree} agree (≥80% overlap) · ${near} near (${THRESH * 100}–80%) · ${disagreements.length} disagree (<${THRESH * 100}%) · ${partial} partial coverage ---`,
);
if (partial) console.log(`(${partial} verse(s) skipped — not present in all drafts)`);
console.log(`Review priority: the ${disagreements.length} disagreements above, worst first.`);
console.log(`Remember the asymmetry: disagreement marks a verse needing a human; agreement does NOT mark it safe`);
console.log(`(models share training priors — see multi-model/COUNCIL.md).`);
