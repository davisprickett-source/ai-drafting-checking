#!/usr/bin/env bun
/**
 * ingest-decisions.ts — receive the decisions a translator exported from the
 * dashboard ("export decisions (JSON)") and fold them back into the system, so
 * human input accumulates and steps don't get repeated.
 *
 * It appends to <reference_pack>/term-decisions.md (a durable human-readable log
 * of approved renderings + notes), and surfaces any note that looks like a term
 * decision ("X → Y") as a candidate for tools/approve-form.ts (which grows the
 * linter).
 *
 * Usage: bun tools/ingest-decisions.ts <decisions.json>
 */
import { readFileSync, appendFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { loadProfile, ROOT } from "./lib/profile.ts";

const profile = loadProfile();
const args = process.argv.slice(2).filter((a, i, arr) => a !== "--profile" && arr[i - 1] !== "--profile");
const path = args[0];
if (!path) { console.error("usage: bun tools/ingest-decisions.ts <decisions.json>"); process.exit(2); }
const items = JSON.parse(readFileSync(path, "utf8")) as { ref: string; approved: boolean; final: string; note: string }[];

const packDir = profile.paths.reference_pack ?? join(ROOT, "references/");
const LOG = join(packDir, "term-decisions.md");
if (!existsSync(LOG)) writeFileSync(LOG, "# Term & Verse Decisions (human-confirmed log)\n\n> Appended by tools/ingest-decisions.ts from dashboard exports. Approved renderings here are reference for checking other verses (consistency); notes capture key-term choices and questions. Forms to teach the linter go through tools/approve-form.ts.\n");

const date = new Date().toISOString().slice(0, 10);
let block = `\n## ${date}\n`;
const termCandidates: string[] = [];
for (const it of items) {
  if (it.approved) block += `- **${it.ref}** ✓ approved: ${it.final}\n`;
  if (it.note) {
    block += `  - note (${it.ref}): ${it.note}\n`;
    if (/→|->|=>/.test(it.note)) termCandidates.push(`${it.ref}: ${it.note}`);
  }
}
appendFileSync(LOG, block);

console.log(`✓ logged ${items.length} decision(s) to ${LOG}`);
if (termCandidates.length) {
  console.log(`\nKey-term decisions detected — consider teaching the linter via approve-form.ts:`);
  termCandidates.forEach((t) => console.log(`  • ${t}`));
}
