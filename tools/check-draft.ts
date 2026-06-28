#!/usr/bin/env bun
/**
 * check-draft.ts — language-agnostic draft verifier.
 *
 * Scans a draft for the MECHANICAL error classes a language declares in its
 * profile (profiles/<iso>.json): orthography/alphabet violations, dialect/borrowing
 * leaks, wrong key-term renderings, and (via --lexicon) words that never appear in
 * the corpus (probable hallucinations). It does NOT judge meaning, idiom, or
 * discourse quality — those need a human (see consultant-check/).
 *
 * EVERYTHING language-specific lives in the profile:
 *   - linter_rules[]   regex checks (sh→ch, q→g, ...)        [profile]
 *   - density_checks[] "form A overused vs form B" ratios    [profile]
 *   - borrowings{}     majority-lang form → preferred local  [profile]
 *   - suffixes[]       pronominal suffixes (de-hyphenation)   [profile]
 *   - vowels           vowel set for the length heuristic     [profile, optional]
 *
 * Usage:
 *   bun tools/check-draft.ts [--profile profiles/<iso>.json] [--lexicon <path>] <file> [<file> ...]
 *   (with no --lexicon, the profile's paths.lexicon is used if present)
 * Exit: non-zero if any ERROR-severity violation is found.
 */
import { readFileSync as _rfs } from "fs";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile, type LinterRule, type DensityCheck } from "./lib/profile.ts";

type Severity = "error" | "warn";

const profile = loadProfile();

let LEXICON: Set<string> | null = null;
let LEX_ARR: string[] = [];

// Pronominal suffixes attach WITHOUT a hyphen in many languages (galibki, not
// galib-ki). De-hyphenate before the membership check so a suffixed form is
// recognized; a separate (profile) rule can flag the hyphen itself.
const SUFFIX = profile.suffixes.length ? `(${profile.suffixes.join("|")})` : null;
const dehyphenate = (s: string) =>
  SUFFIX ? s.replace(new RegExp(`-${SUFFIX}\\b`, "gi"), "$1") : s;

const BORROWINGS: Record<string, string> = profile.borrowings;
const VOWELS = profile.vowels; // e.g. "aeiou"; undefined disables the heuristic

// The word containing a character offset (letters incl. apostrophes/hyphen, any script).
function wordAt(line: string, idx: number): string {
  const isW = (c: string) => c !== undefined && (/\p{L}/u.test(c) || /['ʼʿ’`-]/.test(c));
  let s = idx, e = idx;
  while (s > 0 && isW(line[s - 1])) s--;
  while (e < line.length && isW(line[e])) e++;
  return line.slice(s, e);
}
function isAttested(word: string): boolean {
  if (!LEXICON) return false;
  const toks = tokenize(dehyphenate(word));
  return toks.length > 0 && toks.every((t) => LEXICON!.has(t));
}

// Vowel-LENGTH heuristic (only if the profile declares a vowel set): if an
// unattested word becomes attested by lengthening/shortening one vowel run, it's
// almost certainly a vowel-length error (leki → leeki, gaal → gal).
function vowelFix(w: string): string {
  if (!LEXICON || !VOWELS) return "";
  const vre = new RegExp(`([${VOWELS}])\\1*`, "gi");
  for (const m of [...w.matchAll(vre)]) {
    const run = m[0];
    const alt = run.length === 1 ? run + run[0] : run[0];
    const cand = (w.slice(0, m.index) + alt + w.slice((m.index as number) + run.length)).toLowerCase();
    if (cand !== w.toLowerCase() && LEXICON.has(cand)) return cand;
  }
  return "";
}

// Levenshtein (bounded) — "did you mean" suggestions for unattested words.
function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur[j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
function nearest(w: string): string {
  if (w.length < 3) return "";
  const hits: [string, number][] = [];
  for (const cand of LEX_ARR) {
    if (Math.abs(cand.length - w.length) > 2) continue;
    const d = lev(w, cand, 2);
    if (d <= 2) hits.push([cand, d]);
  }
  hits.sort((a, b) => a[1] - b[1]);
  return hits.slice(0, 2).map((h) => h[0]).join("/");
}

// Pull only verse text out of a draft (plain {ref:text} or annotated {ref:{draft}}).
function extractLines(raw: string): string[] {
  try {
    const j = JSON.parse(raw);
    const verses = j.verses ?? j;
    if (verses && typeof verses === "object") {
      const out = Object.values(verses)
        .map((v: any) => (typeof v === "string" ? v : v?.draft ?? ""))
        .filter((s) => s);
      if (out.length) return out;
    }
  } catch {}
  return raw.split("\n");
}

interface CompiledRule {
  id: string;
  re: RegExp;
  severity: Severity;
  message: string;
  lexExempt?: boolean;
}
const RULES: CompiledRule[] = profile.linter_rules.map((r: LinterRule) => ({
  id: r.id,
  re: new RegExp(r.pattern, r.flags ?? "g"),
  severity: r.severity,
  message: r.message,
  lexExempt: r.lexExempt,
}));

function scanFile(path: string): { errors: number; warns: number } {
  let raw: string;
  try {
    raw = _rfs(path, "utf8");
  } catch (e) {
    console.error(`✗ cannot read ${path}: ${(e as Error).message}`);
    return { errors: 1, warns: 0 };
  }
  const lines = extractLines(raw);
  const text = lines.join("\n");
  let errors = 0;
  let warns = 0;

  console.log(`\n=== ${path} ===`);
  lines.forEach((line, i) => {
    const n = i + 1;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let count: number;
      if (rule.lexExempt && LEXICON) {
        count = 0;
        for (const mm of line.matchAll(rule.re)) {
          if (!isAttested(wordAt(line, mm.index!))) count++;
        }
      } else {
        count = (line.match(rule.re) || []).length;
      }
      if (count > 0) {
        const tag = rule.severity === "error" ? "ERROR" : "warn ";
        if (rule.severity === "error") errors += count;
        else warns += count;
        console.log(`  ${tag} L${n} [${rule.id}] ${rule.message}  (×${count})`);
      }
    }
  });

  // Density checks: "discouraged form overused relative to preferred form".
  for (const dc of profile.density_checks as DensityCheck[]) {
    const formRe = new RegExp(dc.form, dc.flags ?? "gi");
    const formCount = (text.match(formRe) || []).length;
    if (formCount > 0) {
      const vsCount = dc.vs ? (text.match(new RegExp(dc.vs, dc.vsFlags ?? "gi")) || []).length : 0;
      const sev = dc.severity ?? "warn";
      const tag = sev === "error" ? "ERROR" : "warn ";
      const ratio = dc.vs ? ` (${formCount}× vs ${vsCount}× preferred)` : ` (×${formCount})`;
      console.log(`  ${tag} [${dc.id}] ${dc.message}${ratio}`);
      if (sev === "error") errors += formCount; else warns += formCount;
    }
  }

  // Corpus-membership check (advisory) — words never seen in the corpus.
  if (LEXICON) {
    const unattested = new Set<string>();
    for (const tok of tokenize(dehyphenate(text))) {
      if (!LEXICON.has(tok)) unattested.add(tok);
    }
    if (unattested.size > 0) {
      const items = [...unattested].sort().map((w) => {
        const vf = vowelFix(w);
        const s = BORROWINGS[w] ?? (vf ? `vowel length → ${vf}` : nearest(w));
        return s ? `${w} (use ${s})` : w;
      });
      console.log(`  warn  [LEX-unattested] ${unattested.size} word(s) not attested (hallucination, source-specific term, or new form — confirm via approve-form.ts):`);
      items.forEach((it) => console.log(`          ${it}`));
      warns += unattested.size;
    }
  }

  if (errors === 0 && warns === 0) console.log("  ✓ clean");
  return { errors, warns };
}

// Parse args: optional --lexicon <path> (default = profile.paths.lexicon), then files.
const argv = process.argv.slice(2);
const files: string[] = [];
let lexPath: string | null = profile.paths.lexicon ?? null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--lexicon") lexPath = argv[++i];
  else if (argv[i] === "--profile") i++; // consumed by loadProfile
  else if (argv[i] === "--no-lexicon") lexPath = null;
  else files.push(argv[i]);
}

if (lexPath) {
  try {
    const parsed = JSON.parse(_rfs(lexPath, "utf8"));
    LEXICON = new Set(Object.keys(parsed.words ?? parsed));
    // GROWING LAYER: union human-approved forms (provenance-checked) if present.
    let grown = 0;
    const apprPath = profile.paths.approved_additions;
    if (apprPath) {
      try {
        const appr = JSON.parse(_rfs(apprPath, "utf8"));
        for (const e of appr.forms ?? []) {
          if (e.word && (e.provenance === "human" || e.provenance?.startsWith?.("human"))) {
            const w = e.word.toLowerCase();
            if (!LEXICON.has(w)) { LEXICON.add(w); grown++; }
          }
        }
      } catch {}
    }
    LEX_ARR = [...LEXICON];
    console.log(`(membership check ON — ${LEXICON.size} words: ${LEXICON.size - grown} corpus + ${grown} human-approved)`);
  } catch (e) {
    console.error(`✗ cannot load lexicon ${lexPath}: ${(e as Error).message} — run build-lexicon.ts or pass --no-lexicon`);
    process.exit(2);
  }
}

if (files.length === 0) {
  console.error("usage: bun tools/check-draft.ts [--profile <p>] [--lexicon <path>] <file> [<file> ...]");
  process.exit(2);
}

console.log(`profile: ${profile.language} (${profile.iso639_3}) — ${RULES.length} rules, ${profile.density_checks.length} density checks`);

let totalErrors = 0;
let totalWarns = 0;
for (const f of files) {
  const { errors, warns } = scanFile(f);
  totalErrors += errors;
  totalWarns += warns;
}

console.log(`\n--- summary: ${totalErrors} error(s), ${totalWarns} warning(s) across ${files.length} file(s) ---`);
process.exit(totalErrors > 0 ? 1 : 0);
