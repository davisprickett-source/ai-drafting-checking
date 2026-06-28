#!/usr/bin/env bun
/**
 * check-setup.ts — verify a language install is ready, so a new team knows their
 * setup is complete and correctly firewalled before they start. No inference.
 *
 * Usage: bun tools/check-setup.ts [--profile profiles/<iso>.json]
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { loadProfile, ROOT } from "./lib/profile.ts";

let profile;
try { profile = loadProfile(); }
catch (e) { console.error(`✗ ${(e as Error).message}`); process.exit(1); }

let ok = 0, warn = 0, bad = 0;
const pass = (m: string) => { console.log(`  ✓ ${m}`); ok++; };
const wn = (m: string) => { console.log(`  ! ${m}`); warn++; };
const err = (m: string) => { console.log(`  ✗ ${m}`); bad++; };

console.log(`\nSetup check — ${profile.language} (${profile.iso639_3})\n`);

const P = profile.paths;
existsSync(P.corpus) ? pass(`corpus present (${P.corpus})`) : err(`corpus missing (${P.corpus}) — the system needs existing Scripture as the corpus`);
existsSync(P.lexicon) ? pass(`lexicon built (${P.lexicon})`) : err(`lexicon missing — run: bun tools/build-lexicon.ts`);

const packDir = P.reference_pack ?? join(ROOT, "references/");
const iso = profile.iso639_3;
const refExists = (stem: string) =>
  existsSync(join(packDir, `${iso}-${stem}.md`)) || existsSync(join(packDir, `${stem}.md`));

(P.incontext_pack && existsSync(P.incontext_pack)) || refExists("incontext-pack")
  ? pass(`in-context pack present`) : wn(`in-context pack missing — run: bun tools/build-incontext-pack.ts`);
P.approved_additions && existsSync(P.approved_additions) ? pass(`growing-linter store present (${P.approved_additions})`) : wn(`approved-additions store missing (created on first approve-form)`);

// reference pack components
for (const w of ["common-errors", "key-terms", "proper-names", "orthography", "grammar", "narrative-exemplars"]) {
  refExists(w) ? pass(`reference pack: ${w}`) : wn(`reference pack missing: ${w} (see WORKFLOW.md / references/_templates/)`);
}

// firewall
if (P.check_set) {
  existsSync(P.check_set)
    ? pass(`check-set present and firewalled (${P.check_set}) — must NEVER be loaded into drafting`)
    : wn(`check-set not yet acquired (${P.check_set}) — optional; used only to evaluate drafts`);
}

// profile sanity
profile.divine_name ? pass(`divine name set: ${profile.divine_name}`) : wn(`divine_name not set in profile`);
profile.suffixes.length ? pass(`${profile.suffixes.length} pronominal suffixes configured`) : wn(`no suffixes configured (linter de-hyphenation off)`);
Object.keys(profile.borrowings).length ? pass(`${Object.keys(profile.borrowings).length} borrowing→local mappings`) : wn(`no borrowings configured`);
profile.linter_rules.length ? pass(`${profile.linter_rules.length} linter rules configured`) : wn(`no linter_rules configured (mechanical checker runs membership-only)`);

// model roster (model-agnostic config — see MODELS.md)
const modelsPath = join(ROOT, "models.json");
if (existsSync(modelsPath)) {
  try {
    const m = JSON.parse(readFileSync(modelsPath, "utf8"));
    const roster = m.rosters?.[m.active_roster];
    if (!roster) err(`models.json: active_roster "${m.active_roster}" not found in rosters`);
    else {
      const missing = ["workhorse", "deep", "independent"].filter(r => !roster[r]);
      missing.length
        ? wn(`models.json roster "${m.active_roster}" missing role(s): ${missing.join(", ")} (see MODELS.md)`)
        : pass(`model roster "${m.active_roster}": ${Object.entries(roster).map(([r, e]: any) => `${r}=${e.provider}:${e.model}`).join(", ")}`);
    }
  } catch (e) { err(`models.json present but unparseable: ${(e as Error).message}`); }
} else {
  wn(`models.json missing — run: cp models.template.json models.json (then set active_roster; MODELS.md)`);
}

console.log(`\n— ${ok} ok · ${warn} to-do · ${bad} blocking —`);
console.log(bad ? `Fix the ✗ items before drafting.` : warn ? `Usable; the ! items will improve quality.` : `Fully set up.`);
process.exit(bad ? 1 : 0);
