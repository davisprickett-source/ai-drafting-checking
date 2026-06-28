/**
 * profile.ts — the one place the engine learns which language it is working on.
 *
 * Every tool reads the active language's configuration from a single JSON
 * profile, so the code stays language-agnostic and a new team ports the system
 * by writing a profile + reference pack, never by editing tools.
 *
 * Resolution order for the active profile:
 *   1. --profile <path>            (CLI arg, highest priority)
 *   2. $LANG_PROFILE               (env var)
 *   3. the single *.json in profiles/ that is not _template.json
 *   4. error, with guidance
 *
 * Paths inside the profile are resolved relative to the PROJECT ROOT (the parent
 * of tools/), unless already absolute.
 */
import { readFileSync, readdirSync } from "fs";
import { isAbsolute, join } from "path";

// tools/lib/profile.ts -> project root is two levels up.
export const ROOT = new URL("../../", import.meta.url).pathname;

export interface LinterRule {
  id: string;
  pattern: string;          // RegExp source
  flags?: string;           // RegExp flags (default "g")
  severity: "error" | "warn";
  message: string;
  lexExempt?: boolean;      // when a lexicon is loaded, skip matches inside attested words
}

export interface DensityCheck {
  id: string;
  form: string;             // RegExp source for the discouraged form
  flags?: string;
  vs?: string;              // RegExp source for the preferred form (for the ratio note)
  vsFlags?: string;
  severity?: "error" | "warn";
  message: string;
}

export interface Profile {
  language: string;
  iso639_3: string;
  script: string;
  lwc: string[];
  divine_name?: string;
  paths: {
    corpus: string;
    lexicon: string;
    approved_additions?: string;
    check_set?: string;
    reference_pack?: string;
    incontext_pack?: string;
    references?: Record<string, string>;   // label -> path: LWC parallels / back-translations
    [k: string]: any;
  };
  suffixes: string[];
  borrowings: Record<string, string>;
  key_terms_anchor: Record<string, string>;
  linter_rules: LinterRule[];
  density_checks: DensityCheck[];
  vowels?: string;            // e.g. "aeiou"; omit to disable the vowel-length heuristic
  core_word_pattern?: string; // RegExp source to keep a token as a "core" word; default = any letters
  book_aliases?: Record<string, string>;
  raw: any;
  profilePath: string;
}

/** Resolve a profile-relative path against the project root. */
export function rel(p: string): string {
  return isAbsolute(p) ? p : join(ROOT, p);
}

/** Find the active profile path (without loading it). */
export function resolveProfilePath(argv: string[] = process.argv.slice(2)): string {
  const i = argv.indexOf("--profile");
  if (i >= 0 && argv[i + 1]) return rel(argv[i + 1]);
  if (process.env.LANG_PROFILE) return rel(process.env.LANG_PROFILE);
  // auto-detect: exactly one non-template profile
  try {
    const dir = join(ROOT, "profiles");
    const cands = readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
    if (cands.length === 1) return join(dir, cands[0]);
    if (cands.length === 0) {
      throw new Error(
        "no language profile found. Copy profiles/_template.json to profiles/<your-iso>.json and fill it in.",
      );
    }
    throw new Error(
      `multiple profiles in profiles/ (${cands.join(", ")}). Pick one with --profile profiles/<file> or $LANG_PROFILE.`,
    );
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/** Load + normalize the active profile, resolving all paths to absolute. */
export function loadProfile(argv: string[] = process.argv.slice(2)): Profile {
  const profilePath = resolveProfilePath(argv);
  let raw: any;
  try {
    raw = JSON.parse(readFileSync(profilePath, "utf8"));
  } catch (e) {
    throw new Error(`cannot read profile ${profilePath}: ${(e as Error).message}`);
  }
  const paths = { ...(raw.paths || {}) };
  for (const k of Object.keys(paths)) {
    if (k === "references" && paths.references && typeof paths.references === "object") {
      const refs: Record<string, string> = {};
      for (const [label, p] of Object.entries(paths.references)) refs[label] = rel(p as string);
      paths.references = refs;
    } else if (typeof paths[k] === "string") {
      paths[k] = rel(paths[k]);
    }
  }
  return {
    language: raw.language ?? "(unnamed)",
    iso639_3: raw.iso639_3 ?? "und",
    script: raw.script ?? "",
    lwc: Array.isArray(raw.lwc) ? raw.lwc : [],
    divine_name: raw.divine_name,
    paths,
    suffixes: Array.isArray(raw.suffixes) ? raw.suffixes : [],
    borrowings: raw.borrowings && typeof raw.borrowings === "object" ? raw.borrowings : {},
    key_terms_anchor: raw.key_terms_anchor && typeof raw.key_terms_anchor === "object" ? raw.key_terms_anchor : {},
    linter_rules: Array.isArray(raw.linter_rules) ? raw.linter_rules : [],
    density_checks: Array.isArray(raw.density_checks) ? raw.density_checks : [],
    vowels: typeof raw.vowels === "string" ? raw.vowels : undefined,
    core_word_pattern: typeof raw.core_word_pattern === "string" ? raw.core_word_pattern : undefined,
    book_aliases: raw.book_aliases && typeof raw.book_aliases === "object" ? raw.book_aliases : undefined,
    raw,
    profilePath,
  };
}

/** Load a verse-keyed JSON ({verses:{ref:text}} or flat {ref:text}). */
export function loadVerses(path: string): Record<string, string> {
  const j = JSON.parse(readFileSync(path, "utf8"));
  return (j.verses ?? j) as Record<string, string>;
}
