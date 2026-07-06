#!/usr/bin/env bun
/**
 * export-usfm.ts — export an APPROVED draft to USFM for Paratext.
 *
 * The last mile: verse-keyed draft JSON → a .usfm file Paratext can import.
 * Human-in-the-loop is enforced at the door: a draft that still carries
 * uncertainty markup (⟨?⟩ ⟨≈⟩ {A ⟂ B} ⟦…⟧) is NOT export-ready — those marks are
 * open questions for the team, and exporting them would ship undecided text.
 * Resolve them (edit the draft, choose the options) or pass --strip-flags to
 * consciously export anyway (marks removed, a warning list printed).
 *
 * Usage:
 *   bun tools/export-usfm.ts <draft.json> [--out <file.usfm>] [--book <USFM code>] [--strip-flags]
 *
 * Draft format: {"verses": {"MRK:1:1": "text", ...}} or flat {"MRK:1:1": "..."}
 * (annotated {ref:{draft}} also accepted). One book per export.
 */
import { readFileSync, writeFileSync } from "fs";
import { loadProfile } from "./lib/profile.ts";

const profile = loadProfile();
const argv = process.argv.slice(2);
const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const stripFlags = argv.includes("--strip-flags");
const files = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--out" && argv[i - 1] !== "--book" && argv[i - 1] !== "--profile" && argv[i - 1] !== "--lexicon");

if (files.length !== 1) {
  console.error("usage: bun tools/export-usfm.ts <draft.json> [--out <file.usfm>] [--book <code>] [--strip-flags]");
  process.exit(2);
}

const j = JSON.parse(readFileSync(files[0], "utf8"));
const verses: Record<string, unknown> = j.verses ?? j;
const getText = (v: unknown): string => (typeof v === "string" ? v : ((v as { draft?: string })?.draft ?? ""));

// Group refs by book/chapter; refs look like BOOK:c:v (aliases normalized via profile).
const aliases = profile.book_aliases ?? {};
type Row = { book: string; c: number; v: number; text: string; ref: string };
const rows: Row[] = [];
for (const ref of Object.keys(verses)) {
  const m = ref.match(/^([^:]+):(\d+):(\d+)$/);
  if (!m) { console.error(`✗ unparseable ref "${ref}" (expected BOOK:chapter:verse)`); process.exit(2); }
  const book = (aliases[m[1]] ?? m[1]).toUpperCase();
  rows.push({ book, c: Number(m[2]), v: Number(m[3]), text: getText(verses[ref]), ref });
}
const books = [...new Set(rows.map((r) => r.book))];
if (books.length !== 1) {
  console.error(`✗ draft spans ${books.length} books (${books.join(", ")}) — export one book at a time.`);
  process.exit(2);
}
// \id needs a USFM book code; prefer the raw ref book when it already looks like
// one (aliases may map to long display names, which Paratext won't accept).
const rawBooks = [...new Set(rows.map((r) => r.ref.split(":")[0].toUpperCase()))];
const bookCode = (get("--book") ?? (rawBooks.length === 1 && /^[0-9A-Z]{3}$/.test(rawBooks[0]) ? rawBooks[0] : books[0])).toUpperCase();

// Flag audit — the human-in-the-loop gate.
const MARK = /⟨\?⟩|⟨≈⟩|[⟂⟦⟧]|\{[^}]*⟂[^}]*\}/;
const flagged = rows.filter((r) => MARK.test(r.text));
if (flagged.length && !stripFlags) {
  console.error(`✗ NOT export-ready: ${flagged.length} verse(s) still carry uncertainty markup (⟨?⟩ ⟨≈⟩ {A ⟂ B} ⟦…⟧):`);
  for (const r of flagged.slice(0, 10)) console.error(`    ${r.ref}`);
  if (flagged.length > 10) console.error(`    … and ${flagged.length - 10} more`);
  console.error(`These are open questions for the team — resolve them in the draft, then re-export.`);
  console.error(`(To consciously override: --strip-flags removes the marks and exports anyway.)`);
  process.exit(1);
}

const clean = (s: string) =>
  s
    .replace(/\{([^⟂{}]*)⟂[^}]*\}/g, "$1") // {A ⟂ B} → A (first option) — only under --strip-flags
    .replace(/⟦[^⟧]*⟧/g, "")
    .replace(/⟨\?⟩|⟨≈⟩/g, "")
    .replace(/\s+/g, " ")
    .trim();

rows.sort((a, b) => a.c - b.c || a.v - b.v);
let out = `\\id ${bookCode} — ${profile.language} (${profile.iso639_3}), exported ${new Date().toISOString().slice(0, 10)} by ai-drafting-checking (human-approved draft)\n`;
let curC = 0;
for (const r of rows) {
  if (r.c !== curC) { out += `\\c ${r.c}\n\\p\n`; curC = r.c; }
  out += `\\v ${r.v} ${stripFlags ? clean(r.text) : r.text.replace(/\s+/g, " ").trim()}\n`;
}

const outPath = get("--out") ?? files[0].replace(/\.json$/, "") + ".usfm";
writeFileSync(outPath, out);
console.log(`✓ exported ${rows.length} verse(s) of ${bookCode} → ${outPath}`);
if (flagged.length) {
  console.log(`⚠ --strip-flags removed markup from ${flagged.length} verse(s); {A ⟂ B} collapsed to option A.`);
  console.log(`  Exported text should still get a final human read in Paratext.`);
}
console.log(`Import in Paratext via its USFM import; nothing here writes to your Paratext project directly.`);
