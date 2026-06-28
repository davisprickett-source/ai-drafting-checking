#!/usr/bin/env bun
/**
 * paratext-import.ts — bootstrap a language install from a Paratext project folder.
 *
 * The "drop it into a Paratext folder and it just works" on-ramp: point this at a
 * Paratext project directory and it (1) reads Settings.xml for language metadata,
 * (2) parses the USFM books into the verse-keyed corpus JSON the toolkit expects,
 * (3) scaffolds profiles/<iso>.json from the template, and (4) ensures models.json
 * exists. No inference. First-pass scaffold — review the generated profile after.
 *
 * Usage:
 *   bun tools/paratext-import.ts --from "/path/to/ParatextProject" --iso xxx
 *   bun tools/paratext-import.ts --from . --iso xxx --as-check-set   # import as 🔒 CHECK-ONLY
 *
 * Notes:
 *   - Verse keys are "<USFM_BOOK_CODE>:<chapter>:<verse>", e.g. "JON:1:1". Remap to
 *     full names via the profile's book_aliases if you cross-reference an LWC by name.
 *   - --as-check-set writes to check-set/ and does NOT scaffold a profile — use this for
 *     a published/reference translation you will firewall from drafting.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join, basename } from "path";

const ROOT = new URL("../", import.meta.url).pathname;
const argv = process.argv.slice(2);
let from = "", iso = "", asCheckSet = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--from") from = argv[++i];
  else if (argv[i] === "--iso") iso = argv[++i];
  else if (argv[i] === "--as-check-set") asCheckSet = true;
}
if (!from || !iso) { console.error('usage: bun tools/paratext-import.ts --from <ParatextDir> --iso <iso639_3> [--as-check-set]'); process.exit(2); }
if (!existsSync(from)) { console.error(`✗ source folder not found: ${from}`); process.exit(1); }

// ---- 1. Settings.xml (best-effort; Paratext stores language metadata here) ----
const settingsPath = ["Settings.xml", "settings.xml"].map(f => join(from, f)).find(existsSync);
const meta: Record<string, string> = {};
if (settingsPath) {
  const xml = readFileSync(settingsPath, "utf8");
  const tag = (t: string) => xml.match(new RegExp(`<${t}>([^<]*)</${t}>`, "i"))?.[1]?.trim() ?? "";
  meta.fullName = tag("FullName") || tag("Name");
  meta.langIso = tag("LanguageIsoCode").split(":")[0];
  meta.encoding = tag("Encoding");
  meta.versification = tag("Versification");
  meta.naming = (xml.match(/<Naming[^>]*PostPart="([^"]*)"/i)?.[1]) ?? "";
  console.log(`Settings.xml: name="${meta.fullName}" iso=${meta.langIso} versification=${meta.versification || "?"}`);
} else {
  console.log("! no Settings.xml found — proceeding with USFM only (fill language metadata in the profile by hand)");
}

// ---- 2. parse USFM books → verse map ----
const usfmFiles = readdirSync(from).filter(f => /\.(usfm|sfm)$/i.test(f));
if (!usfmFiles.length) { console.error(`✗ no .usfm/.sfm files in ${from}`); process.exit(1); }

const clean = (s: string) => s
  .replace(/\\f\b.*?\\f\*/g, "")        // footnotes
  .replace(/\\x\b.*?\\x\*/g, "")        // cross-refs
  .replace(/\\[a-z]+\d*\*/g, "")        // closing char markers \add*
  .replace(/\|[^\\]*?(?=\\w\*)/g, "")   // \w word|lemma → drop the |lemma
  .replace(/\\[a-z]+\d*\s?/g, "")       // remaining char/para markers
  .replace(/\s+/g, " ").trim();

const verses: Record<string, string> = {};
let nBooks = 0;
for (const file of usfmFiles) {
  const lines = readFileSync(join(from, file), "utf8").split(/\r?\n/);
  let book = "", chap = "", vno = "", buf = "";
  const flush = () => { if (book && chap && vno) { const t = clean(buf); if (t) verses[`${book}:${chap}:${vno}`] = t; } buf = ""; };
  for (const line of lines) {
    const id = line.match(/^\\id\s+(\w+)/);  if (id) { flush(); book = id[1].toUpperCase(); nBooks++; continue; }
    const c = line.match(/^\\c\s+(\d+)/);    if (c) { flush(); chap = c[1]; vno = ""; continue; }
    const v = line.match(/^\\v\s+(\d+[a-z]?)\s?(.*)/); if (v) { flush(); vno = v[1]; buf = v[2] ?? ""; continue; }
    if (vno) buf += " " + line; // continuation line of the current verse
  }
  flush();
}
console.log(`Parsed ${nBooks} book(s), ${Object.keys(verses).length} verses from ${usfmFiles.length} USFM file(s).`);

// ---- 3. write corpus (or check-set) ----
const outDir = asCheckSet ? join(ROOT, "check-set") : join(ROOT, "corpus");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${iso}-${asCheckSet ? "check" : "corpus"}.json`);
writeFileSync(outFile, JSON.stringify({
  meta: { source: meta.fullName || basename(from), iso639_3: iso, versification: meta.versification || "", verses: Object.keys(verses).length, imported: "paratext-import" },
  verses,
}, null, 0));
console.log(`✓ wrote ${asCheckSet ? "🔒 CHECK-SET" : "corpus"}: ${outFile}`);
if (asCheckSet) { console.log(`\nThis is firewalled: set paths.check_set in the profile; NEVER load it into drafting.\nDone.`); process.exit(0); }

// ---- 4. scaffold profile from template ----
const profPath = join(ROOT, "profiles", `${iso}.json`);
if (existsSync(profPath)) {
  console.log(`! profiles/${iso}.json already exists — left untouched (corpus updated).`);
} else {
  const tpl = JSON.parse(readFileSync(join(ROOT, "profiles", "_template.json"), "utf8"));
  delete tpl._README;
  tpl.language = meta.fullName || "TODO: language name";
  tpl.iso639_3 = iso;
  tpl.paths = { ...tpl.paths, corpus: `corpus/${iso}-corpus.json`, lexicon: `references/lexicon.json`, reference_pack: "references/", check_set: `check-set/${iso}-check.json` };
  writeFileSync(profPath, JSON.stringify(tpl, null, 2));
  console.log(`✓ scaffolded profiles/${iso}.json (review it — fill script, lwc, divine_name, suffixes, linter_rules)`);
}

// ---- 5. ensure models.json exists ----
const modelsPath = join(ROOT, "models.json");
if (!existsSync(modelsPath)) {
  writeFileSync(modelsPath, readFileSync(join(ROOT, "models.template.json"), "utf8"));
  console.log(`✓ created models.json from template (edit active_roster to your vendor — see MODELS.md)`);
}

console.log(`\nNext:`);
console.log(`  1. Review profiles/${iso}.json — fill the language-specific fields (profiles/README.md).`);
console.log(`  2. bun tools/build-lexicon.ts --profile profiles/${iso}.json   # frequency lexicon from the corpus`);
console.log(`  3. bun tools/check-setup.ts --profile profiles/${iso}.json     # verify the install`);
console.log(`  4. Map your models in models.json (MODELS.md), then estimate-cost / draft.`);
