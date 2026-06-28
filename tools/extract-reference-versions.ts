#!/usr/bin/env bun
/**
 * extract-reference-versions.ts — pull a parallel version's text out of a local
 * reference DB into a verse-keyed JSON for use in this project (e.g. an LWC Bible
 * to use as the drafting source or a back-translation index).
 *
 * The DB path is configurable via $REFERENCE_DB (default: a my-translator install).
 * It expects tables `references_text` (label, body, verse_id) joined to `verses`
 * (id, book, chapter, verse). Adapt the query for a different schema.
 *
 * Usage:
 *   REFERENCE_DB=/path/to.db bun tools/extract-reference-versions.ts "<version label>" <out.json>
 *   bun tools/extract-reference-versions.ts "<LWC version label>" reference-versions/<lwc>.json
 */
import { Database } from "bun:sqlite";
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = process.env.REFERENCE_DB || `${process.env.HOME}/Projects/my-translator/data/translator.db`;
const argv = process.argv.slice(2).filter((a, i, arr) => a !== "--profile" && arr[i - 1] !== "--profile");
const label = argv[0];
const out = argv[1];
if (!label || !out) {
  console.error('usage: [REFERENCE_DB=...] bun tools/extract-reference-versions.ts "<version label>" <out.json>');
  process.exit(2);
}

const db = new Database(DB_PATH, { readonly: true });
const rows = db
  .query(
    `SELECT v.book AS book, v.chapter AS ch, v.verse AS vs, r.body AS body
     FROM references_text r JOIN verses v ON r.verse_id = v.id
     WHERE r.label = ? ORDER BY v.id`,
  )
  .all(label) as { book: string; ch: number; vs: number; body: string }[];

if (rows.length === 0) {
  console.error(`✗ no rows for label "${label}" in ${DB_PATH}. Check the exact label spelling.`);
  process.exit(1);
}

const verses: Record<string, string> = {};
for (const r of rows) verses[`${r.book}:${r.ch}:${r.vs}`] = r.body;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify({ source: DB_PATH, version_label: label, verse_count: rows.length, verses }, null, 0),
);
console.log(`✓ ${rows.length} verses for "${label}" → ${out}`);
