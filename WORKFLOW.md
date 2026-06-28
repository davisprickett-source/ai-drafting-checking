# Portable AI Bible-Translation Workflow

> This project is a **reusable workflow**. The structure ports to any low-resource language. The language-specific *data* changes; the *method, tools, and output spec* do not. To apply it elsewhere, fill a language profile (`profiles/_template.json`) and a reference pack (`references/_templates/`) — no code changes.

## The core idea (substrate-independent)

A frontier model is **source-rich and target-poor**: it knows the Hebrew, the Greek, and the major translations cold, but it does not know the minority target language and leaks bigger-dialect / majority-language / related-language material into it. So the whole method is: **spend in-context effort on the scarce target-language signal (corpus, rules, exemplars), verify the output against that signal, run a multi-model council to surface what one model hides, and deliver a transparent dossier the human decides from — never a bare draft to rubber-stamp.**

## What's generic vs language-specific

| Generic (port unchanged) | Language-specific (supply as config) |
|--------------------------|------------------------------------------|
| `DRAFTING_PROTOCOL.md` — the loop | `profiles/<iso>.json` — the language profile |
| `multi-model/COUNCIL.md` + `dossier-template.md` | `references/` reference pack (content) |
| `references/draft-annotation.md` (markup/confidence philosophy) | the corpus (`paths.corpus`) — existing Scripture, verse-keyed JSON |
| all `tools/*.ts` (data-driven; read the profile) | the lexicon + in-context pack (regenerated from the corpus) |
| `references/_templates/` (fill-in scaffolds) | the published/reference translation (`paths.check_set`) — CHECK-ONLY |

**No tool needs editing per language.** The orthography/leak checks the linter runs live in the profile's `linter_rules[]` (and `density_checks[]`) — pure config. Everything else is parameterized by the profile + the reference pack.

## Recipe — apply this workflow to a new language Y

1. **Profile.** Copy `profiles/_template.json` to `profiles/<iso>.json` and fill it (script, LWC, divine name, suffixes, borrowings, key-term anchors, paths, and the `linter_rules[]` for Y's orthography/leak patterns). See `profiles/README.md` for every field.
2. **Corpus.** Get language Y's NT (or whatever Scripture exists) as verse-keyed JSON at `paths.corpus`. Sources: a translation DB (`extract-reference-versions.ts`), bolls.life, or a Bible.com importer (`fetch-ot-reference.ts` pattern, swap the version id).
3. **Lexicon + in-context pack.** `bun tools/build-lexicon.ts` → the corpus-membership oracle, then `bun tools/build-incontext-pack.ts` → the in-context pack (frequency vocab + real-verse pattern banks). Both zero-edit, both read the profile. (Tested: loading the pack roughly halves draft drift vs rules-only.)
4. **Reference pack.** Build, in `references/` (start from `references/_templates/`): orthography, grammar, style-guide (from corpus analysis), **common-errors** (the negative prompt — seed from Y's known dialect-leak/majority-language interference, ideally hardened by a fluent-speaker critique of real AI drafts), key-terms, proper-names, and **narrative-exemplars** (use `find-parallels.ts` on genre-matched passages). This is the bulk of the per-language work.
5. **Source + check.** Pull the LWC source parallels the translators read (the major language(s) in `profile.lwc`) via `extract-reference-versions.ts`; register them under `paths.references`. Acquire any published target text as a 🔒 CHECK-ONLY set (`paths.check_set` — firewall, never a drafting input).
6. **Run.** Generate the drafting prompt with `bun tools/generate-system-instruction.ts`, follow `DRAFTING_PROTOCOL.md`; for final quality, run `multi-model/COUNCIL.md` and emit a `dossier-template.md` dossier.

## Bootstrap prompt (paste into a new Claude Code session in language Y's project)

```
This project translates <LANGUAGE Y>. Re-instantiate the AI-translation workflow:
read WORKFLOW.md, DRAFTING_PROTOCOL.md, multi-model/COUNCIL.md, dossier-template.md,
profiles/README.md, and the draft-annotation spec. Then build this project's
language-specific layer for Y: fill profiles/<iso>.json (including linter_rules) →
corpus → lexicon → reference pack from references/_templates/ (orthography, grammar,
common-errors negative prompt, key-terms, proper-names, narrative-exemplars) →
generate the drafting prompt with generate-system-instruction.ts. Keep the
published/reference text firewalled as CHECK-ONLY (paths.check_set). Then we draft
via the council and output dossiers.
```

That one message gets a new language to a usable, high-quality workflow.
