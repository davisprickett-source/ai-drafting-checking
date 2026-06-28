#!/usr/bin/env bun
/**
 * grep-corpus.ts — search the corpus for a word or construction and see how it's
 * REALLY used. This is the form-verification tool: before committing to a
 * rendering, look up how the team actually says it, instead of guessing from the
 * model's prior.
 *
 * Usage:
 *   bun tools/grep-corpus.ts "<phrase>"            # phrase (apostrophes normalized)
 *   bun tools/grep-corpus.ts -k 20 "<regex>"       # regex, more results
 *   bun tools/grep-corpus.ts --count "<word>"      # just the count
 */
import { loadProfile, loadVerses } from "./lib/profile.ts";

const profile = loadProfile();
const verses = loadVerses(profile.paths.corpus);
const argv = process.argv.slice(2);
let k = 12, countOnly = false;
const terms: string[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "-k") k = parseInt(argv[++i], 10) || 12;
  else if (argv[i] === "--count") countOnly = true;
  else if (argv[i] === "--profile") i++;
  else terms.push(argv[i]);
}
if (!terms.length) { console.error('usage: bun tools/grep-corpus.ts [-k N] [--count] "<word|regex>"'); process.exit(2); }

const norm = (s: string) => s.replace(/[ʼʿ’]/g, "'");
const re = new RegExp(norm(terms.join(" ")), "i");
const hits = Object.entries(verses).filter(([, t]) => re.test(norm(t)));

if (countOnly) { console.log(`${hits.length} verse(s) match /${re.source}/`); process.exit(0); }
console.log(`${hits.length} verse(s) match /${re.source}/ — showing ${Math.min(k, hits.length)}:\n`);
for (const [ref, text] of hits.slice(0, k)) {
  const shown = norm(text).replace(re, (m) => `«${m}»`);
  console.log(`[${ref}] ${shown}`);
}
