#!/usr/bin/env bun
/**
 * approve-form.ts — add a HUMAN-CONFIRMED local form to the linter's growing
 * layer (paths.approved_additions). This is the mechanism that lets the checker
 * learn the language over time.
 *
 * ⚠️ THIS IS A HUMAN ACTION. Run it only for forms a competent human has confirmed
 * (a translator/consultant, or a trusted lexicon/dictionary). NEVER run it on AI
 * draft output, and NEVER seed it from the firewalled check set — both would make
 * the linter certify hallucinations and drift (model collapse).
 *
 * Usage:
 *   bun tools/approve-form.ts <word> --gloss "meaning" --source "Lexicon 2016 p.42" [--by "name"]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { loadProfile, ROOT } from "./lib/profile.ts";

const profile = loadProfile();
const STORE = profile.paths.approved_additions ?? join(ROOT, "references", "approved-additions.json");
const argv = process.argv.slice(2).filter((a, i, arr) => a !== "--profile" && arr[i - 1] !== "--profile");
const word = argv[0];
if (!word || word.startsWith("--")) {
  console.error('usage: bun tools/approve-form.ts <word> --gloss "..." --source "..." [--by "..."]');
  process.exit(2);
}
const opt = (flag: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : "";
};
const gloss = opt("--gloss");
const source = opt("--source");
const by = opt("--by") || "unspecified";
if (!source) {
  console.error("✗ --source is required (provenance matters — where was this form confirmed?).");
  process.exit(2);
}

const store = existsSync(STORE) ? JSON.parse(readFileSync(STORE, "utf8")) : { forms: [] };
store.forms = store.forms ?? [];
const w = word.toLowerCase();
if (store.forms.some((f: any) => f.word?.toLowerCase() === w)) {
  console.log(`• "${word}" already approved — nothing to do.`);
  process.exit(0);
}
store.forms.push({
  word: w,
  gloss,
  source,
  by,
  provenance: "human",
  date: new Date().toISOString().slice(0, 10),
});
writeFileSync(STORE, JSON.stringify(store, null, 2) + "\n");
console.log(`✓ approved "${word}" (gloss: ${gloss || "—"}; source: ${source}). The linter now treats it as attested.`);
