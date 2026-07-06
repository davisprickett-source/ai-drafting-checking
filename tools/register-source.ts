#!/usr/bin/env bun
/**
 * register-source.ts — register a language-data source (dictionary, grammar,
 * article, field notes, text collection…) with a quality grade + usage policy,
 * so agents know exactly how far to trust it. See sources/README.md.
 *
 * INVARIANT: registered sources are ENRICHMENT. They never feed the lexicon and
 * never count as attestation — only the corpus and approve-form.ts do that.
 *
 * Usage:
 *   bun tools/register-source.ts --file <path> --type <t> --title "<t>" [options]
 *   bun tools/register-source.ts --list
 *
 * Options:
 *   --type         dictionary | grammar | text-collection | article | wordlist | field-notes | other
 *   --year <n>     publication/collection year
 *   --orthography  current | outdated | mixed | unknown   (default unknown)
 *   --grade        A | B | C | D    (see sources/README.md; default D — unvetted)
 *   --policy       vocabulary-evidence | grammar-enrichment | background-only
 *                  (default by grade: A/B→vocabulary-evidence, C→grammar-enrichment, D→background-only)
 *   --notes "..."  free-form provenance/caveats
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { loadProfile, ROOT, rel } from "./lib/profile.ts";

const TYPES = ["dictionary", "grammar", "text-collection", "article", "wordlist", "field-notes", "other"];
const GRADES = ["A", "B", "C", "D"] as const;
const POLICIES = ["vocabulary-evidence", "grammar-enrichment", "background-only"];
const DEFAULT_POLICY: Record<string, string> = {
  A: "vocabulary-evidence",
  B: "vocabulary-evidence",
  C: "grammar-enrichment",
  D: "background-only",
};

const profile = loadProfile();
const manifestPath = profile.paths.sources
  ? rel(profile.paths.sources)
  : join(ROOT, "sources", `${profile.iso639_3}-sources.json`);

const argv = process.argv.slice(2);
const get = (flag: string): string | null => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : null;
};

const loadManifest = (): { sources: any[] } => {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    return { sources: [] };
  }
};

if (argv.includes("--list")) {
  const m = loadManifest();
  if (!m.sources.length) {
    console.log(`no sources registered yet (${manifestPath})`);
    process.exit(0);
  }
  console.log(`${m.sources.length} source(s) in ${manifestPath}:\n`);
  for (const s of m.sources) {
    console.log(`  [${s.grade}] ${s.title}${s.year ? ` (${s.year})` : ""} — ${s.type}, orthography: ${s.orthography}, policy: ${s.policy}`);
    console.log(`      file: ${s.file}${s.notes ? `\n      notes: ${s.notes}` : ""}`);
  }
  process.exit(0);
}

const file = get("--file");
const type = get("--type");
const title = get("--title");
if (!file || !type || !title) {
  console.error(`usage: bun tools/register-source.ts --file <path> --type <${TYPES.join("|")}> --title "<title>"`);
  console.error(`       [--year <n>] [--orthography current|outdated|mixed|unknown] [--grade A|B|C|D]`);
  console.error(`       [--policy ${POLICIES.join("|")}] [--notes "..."]  ·  or: --list`);
  process.exit(2);
}
if (!TYPES.includes(type)) {
  console.error(`✗ --type must be one of: ${TYPES.join(", ")}`);
  process.exit(2);
}
const filePath = rel(file);
if (!existsSync(filePath)) {
  console.error(`✗ file not found: ${filePath}`);
  process.exit(2);
}
const grade = (get("--grade") ?? "D").toUpperCase();
if (!GRADES.includes(grade as any)) {
  console.error(`✗ --grade must be A, B, C, or D (got ${grade}). See sources/README.md for the rubric.`);
  process.exit(2);
}
const policy = get("--policy") ?? DEFAULT_POLICY[grade];
if (!POLICIES.includes(policy)) {
  console.error(`✗ --policy must be one of: ${POLICIES.join(", ")}`);
  process.exit(2);
}
const orthography = get("--orthography") ?? "unknown";

const entry = {
  title,
  type,
  file,
  year: get("--year") ? Number(get("--year")) : null,
  orthography,
  grade,
  policy,
  notes: get("--notes") ?? "",
  registered: new Date().toISOString().slice(0, 10),
};

const manifest = loadManifest();
const existing = manifest.sources.findIndex((s: any) => s.file === file || s.title === title);
if (existing >= 0) {
  manifest.sources[existing] = { ...manifest.sources[existing], ...entry };
  console.log(`updated existing entry: ${title}`);
} else {
  manifest.sources.push(entry);
}
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`✓ registered [${grade}] "${title}" (${type}, orthography: ${orthography}, policy: ${policy})`);
console.log(`  manifest: ${manifestPath} — ${manifest.sources.length} source(s) total`);
console.log(`\nReminder: enrichment, not attestation — forms from this source stay ⟨?⟩/⟨≈⟩ in drafts`);
console.log(`until confirmed against the corpus or approved by a human (approve-form.ts).`);
if (grade === "C" && orthography !== "current")
  console.log(`Grade C + non-current orthography: mine the ANALYSIS, never copy the spellings (sources/README.md).`);
