/**
 * Shared tokenizer — script-agnostic (Latin, Arabic, Cyrillic, etc.).
 * Used by build-lexicon.ts, check-draft.ts (--lexicon), find-parallels.ts and
 * score-draft.ts so the lexicon and the membership check tokenize identically.
 *
 * Design: works for ANY script. The old version filtered tokens to /[a-z]/,
 * which silently dropped every Arabic/Cyrillic/Devanagari word. We keep any
 * token that contains a Unicode letter (\p{L}).
 */

// Canonicalize the several apostrophe-like glyphs (hamza/ʿayin and friends) to one,
// and lowercase (a no-op for unicameral scripts like Arabic).
export function canon(s: string): string {
  return s
    .replace(/[ʼʿ’‘`´ʾˈ]/g, "'")
    .toLowerCase();
}

// Split on whitespace, punctuation, AND hyphen (so "al-naadum" -> "al","naadum").
// Arabic punctuation (، ؛ ؟ ٫ ۔) included alongside Latin.
const SPLIT = /[\s.,;:!?،؛؟«»“”"()\[\]{}…\-–—_*#>|=/\\]+/u;

const HAS_LETTER = /\p{L}/u;

export function tokenize(text: string): string[] {
  return canon(text)
    .split(SPLIT)
    .map((t) => t.replace(/^'+|'+$/g, "")) // strip leading/trailing apostrophes (initial-ayin etc.)
    .filter((t) => t.length >= 2 && !/^\d+$/.test(t) && HAS_LETTER.test(t));
}
