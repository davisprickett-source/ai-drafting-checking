#!/usr/bin/env bun
/**
 * find-structures.ts — search the corpus by DISCOURSE / STRUCTURE, not by
 * vocabulary. find-parallels matches shared words; this matches shared *shape*
 * (how the corpus opens a scene, introduces a participant, frames dialogue, etc.).
 *
 * The patterns are language-specific, so they live in the profile as
 * `structure_patterns`: [{ id, desc, pattern, flags }]. If none are defined, the
 * tool says so and exits.
 *
 * Usage:
 *   bun tools/find-structures.ts                 # list the patterns
 *   bun tools/find-structures.ts <pattern-id> [-k 8]
 */
import { loadProfile, loadVerses } from "./lib/profile.ts";

const profile = loadProfile();
const verses = loadVerses(profile.paths.corpus);
const norm = (s: string) => s.replace(/[ʼʿ’]/g, "'").replace(/&lt;|&gt;/g, "");
const toks = (s: string) => s.split(/\s+/).length;

interface Pat { id: string; desc: string; pattern: string; flags?: string }
const RAW: Pat[] = Array.isArray(profile.raw.structure_patterns) ? profile.raw.structure_patterns : [];
const PATTERNS = RAW.map((p) => ({ id: p.id, desc: p.desc, re: new RegExp(p.pattern, p.flags ?? "i") }));

if (!PATTERNS.length) {
  console.log("No `structure_patterns` defined in the profile. Add them to search the corpus by discourse shape — see profiles/README.md.");
  process.exit(0);
}

const arg = process.argv[2];
let k = 8; const ki = process.argv.indexOf("-k"); if (ki >= 0) k = parseInt(process.argv[ki + 1], 10) || 8;

if (!arg || arg === "--profile") {
  console.log("discourse/structure patterns (search the corpus by SHAPE):\n");
  for (const p of PATTERNS) console.log(`  ${p.id.padEnd(18)} — ${p.desc}`);
  console.log(`\nusage: bun tools/find-structures.ts <id> [-k N]`);
  process.exit(0);
}
const p = PATTERNS.find((x) => x.id === arg);
if (!p) { console.error(`unknown pattern "${arg}". Run with no args to list.`); process.exit(2); }

const hits = Object.entries(verses).filter(([, t]) => p.re.test(norm(t))).sort((a, b) => toks(a[1]) - toks(b[1]));
console.log(`[${p.id}] ${p.desc}\n${hits.length} verses match — showing ${Math.min(k, hits.length)} (shortest):\n`);
for (const [ref, text] of hits.slice(0, k)) console.log(`[${ref}] ${norm(text)}`);
