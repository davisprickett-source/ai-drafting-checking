#!/usr/bin/env bun
/**
 * compare-drafts.ts — align two or more verse-keyed drafts and surface where
 * they DISAGREE. Cross-model disagreement is a high-signal error flag: a verse
 * the models render differently is a verse at least one of them is unsure about.
 *
 * Accepts the standard draft format ({verses:{ref:text}}) or a flat {ref:text}.
 *
 * Usage:
 *   bun tools/compare-drafts.ts drafts/1sam1-claude.json drafts/1sam1-gemini.json [...]
 */
import { readFileSync } from "fs";

const files = process.argv.slice(2);
if (files.length < 2) {
  console.error("usage: bun tools/compare-drafts.ts <draft1.json> <draft2.json> [...]");
  process.exit(2);
}

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?«»"]/g, "").trim();

const drafts = files.map((f) => {
  const j = JSON.parse(readFileSync(f, "utf8"));
  const verses: Record<string, string> = j.verses ?? j;
  return { name: j.model ?? f, verses };
});

const allRefs = [...new Set(drafts.flatMap((d) => Object.keys(d.verses)))].sort();
let agree = 0;
let disagree = 0;
let partial = 0;

for (const ref of allRefs) {
  const cells = drafts.map((d) => d.verses[ref]);
  const present = cells.filter((c) => c != null);
  if (present.length < drafts.length) {
    partial++;
    console.log(`~ ${ref}  [only ${present.length}/${drafts.length} drafts have this verse]`);
    continue;
  }
  const normed = present.map(norm);
  if (normed.every((n) => n === normed[0])) {
    agree++;
  } else {
    disagree++;
    console.log(`\n✗ DISAGREE ${ref}`);
    drafts.forEach((d, i) => console.log(`    [${d.name}] ${cells[i]}`));
  }
}

console.log(
  `\n--- ${allRefs.length} verses · ${agree} agree · ${disagree} disagree · ${partial} partial coverage ---`,
);
console.log(`Review priority: the ${disagree} disagreements first.`);
