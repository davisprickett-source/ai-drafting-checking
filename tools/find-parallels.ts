#!/usr/bin/env bun
/**
 * find-parallels.ts — lexical retrieval over the corpus.
 *
 * Given content words from a target passage, return the corpus verses that share
 * the most (and rarest) vocabulary — real attested renderings to use as few-shot
 * exemplars when drafting that passage. No embeddings, no external API: pure local
 * TF-IDF-style overlap, weighted so rare shared words count more than ubiquitous
 * ones (articles, conjunctions, prepositions).
 *
 * Usage:
 *   bun tools/find-parallels.ts <word> [<word> ...]
 *   bun tools/find-parallels.ts -k 8 <target-language content words>
 *
 * Feed it the local content words you expect in the passage (a draft model can
 * propose them), or known local terms for the scene.
 */
import { readFileSync } from "fs";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile, loadVerses } from "./lib/profile.ts";

const profile = loadProfile();
const verses = loadVerses(profile.paths.corpus);
const lex: Record<string, { c: number }> = JSON.parse(readFileSync(profile.paths.lexicon, "utf8")).words;

const argv = process.argv.slice(2);
let k = 10;
const qparts: string[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "-k") k = parseInt(argv[++i], 10) || 10;
  else if (argv[i] === "--profile") i++;
  else qparts.push(argv[i]);
}
const query = [...new Set(tokenize(qparts.join(" ")))];
if (query.length === 0) {
  console.error("usage: bun tools/find-parallels.ts [-k N] <word> [<word> ...]");
  process.exit(2);
}

// idf-ish weight: rarer corpus words score higher; unknown query words get a high weight.
const N = Object.keys(verses).length;
const weight = (w: string) => Math.log(N / (1 + (lex[w]?.c ?? 0.5)));

const scored: { ref: string; score: number; hits: string[]; text: string }[] = [];
for (const [ref, text] of Object.entries(verses)) {
  const toks = new Set(tokenize(text));
  let score = 0;
  const hits: string[] = [];
  for (const q of query) {
    if (toks.has(q)) {
      score += weight(q);
      hits.push(q);
    }
  }
  if (score > 0) scored.push({ ref, score, hits, text });
}
scored.sort((a, b) => b.score - a.score);

console.log(`query: ${query.join(", ")}\ntop ${k} parallel verses:\n`);
for (const s of scored.slice(0, k)) {
  console.log(`[${s.ref}]  (${s.score.toFixed(1)} · ${s.hits.join("+")})`);
  console.log(`  ${s.text}\n`);
}
if (scored.length === 0) console.log("(no verses share these words — try local forms, not the gloss language)");
