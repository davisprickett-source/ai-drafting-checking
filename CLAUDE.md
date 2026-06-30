# LB25 / Lagwan (kot) — AI Translation Checking Harness

This project is the **ai-drafting-checking** system configured for the **Lagwan Bible 2025 Edition** (Paratext: LB25, ISO: `kot`, Kotoko of Lake Chad). Setup was completed 2026-06-30.

## What's set up

```
corpus/kot-corpus.json          4,990 verses (GEN + EXO + MAT + MRK + LUK 1-22)
check-set/kot-check.json        109 verses — LUK 23-24 HOLDOUT. 🔒 Never load into drafting.
profiles/kot.json               Full Lagwan language profile (script, key terms, linter rules)
references/kot-lexicon.json     2,367 unique words, 140,416 tokens
references/kot-incontext-pack.md  120 core words + 4 pattern banks for drafting sessions
references/kot-orthography.md   Script + character inventory (ɓ ɗ ǝ ɨ ɍ + ejectives)
references/kot-grammar.md       Verb system, particles, discourse patterns
references/kot-key-terms.md     Confirmed biblical terms with corpus counts
references/kot-proper-names.md  Attested name forms (corpus-corrected)
references/kot-narrative-exemplars.md  Real corpus exemplars by scene type
references/kot-common-errors.md Negative prompt: AI leak patterns to suppress
references/kot-approved-additions.json  Human-confirmed forms (empty — add via approve-form)
multi-model/LUK23-COMPARISON-REPORT.md  AI vs human vs Memra comparison (2026-06-30)
multi-model/drafts/LUK23-draft.json     AI draft of Luke 23 (corpus-grounded, no check-set)
```

`check-setup` status: **16 ok · 0 to-do · 0 blocking — Fully set up.**

## Key Lagwan facts (confirmed from corpus)

| Concept | Attested form | Corpus hits |
|---------|--------------|-------------|
| God | Malwa | 758 |
| Lord / the LORD | Bɨla ha Dɨma | common |
| Jesus | Yasu | 826 |
| Holy Spirit | Vushi ha a Sɨfaxɨ zi ya | attested |
| disciple/follower | fuk'urayye | 203 |
| crucify | **Ɓɨn** ghwaa na kal mɨzaghari | 65 (Ɓɨn = hang/bind) |
| king | miyanghe | 247 |
| Christ/Messiah | Masi | 32 |
| angel | malika | common |
| kingdom | fɨnawun | 76 |
| pray | ghɨnel aduwa | common |
| forgive/forgiveness | ghafara | attested |
| innocent/righteous | tɨlen | 38+ |
| criminal | mɓakeen | attested |
| two / second | xsɨɗe | 217 |
| sequential "Then" | Deɗɨ ne | 141 |
| temporal "When" | Saa hɨn | 424 |

**Names corrected from corpus** (not what you'd guess): Moses = `Musa`, Peter = `Butrus`, Simon = `Sim'an`.

**Terms NOT yet in corpus** (team has decided, but not attested in LUK 1–22): `hazanna` (paradise), `pitɨna` (insurrection). Add to approved-additions once confirmed.

**NOT in corpus, still open**: ǝ and ɍ appear in the character inventory but have 0 corpus hits. Either rare or absent from OT/NT books present.

## The firewall — read this every session

🔒 `check-set/kot-check.json` = LUK 23–24 (109 verses). **Never load this into a drafting session.** It is the human team's translation we're grading AI drafts against. Contaminating the drafter with the answer key voids the experiment. Use it only via `compare-drafts.ts` after a draft is complete.

## How to work in this session

### Consultant-check (checking the human translation)
Paste `consultant-check/reviewer-prompt.md` into a fresh agent, plus the verse(s) from `check-set/kot-check.json` and the English source. The agent **must** grep the corpus before writing any note about a word's meaning.

```bash
bun tools/grep-corpus.ts "<word>" --profile profiles/kot.json
```

Already run: Luke 23:1–10. Findings: `duniya` (v.2) and `za ze` (v.5) are real accuracy concerns. `spel` (v.5, "teach") is a hapax.

### AI drafting (new passage)
```bash
# Generate the per-language system instruction
bun tools/generate-system-instruction.ts --profile profiles/kot.json

# Find corpus parallels for the scene
bun tools/find-parallels.ts -k 15 "<lagwan content words>" --profile profiles/kot.json

# Draft, then lint
bun tools/check-draft.ts multi-model/drafts/<name>.json --profile profiles/kot.json

# Compare AI draft vs human translation (after drafting only)
bun tools/compare-drafts.ts multi-model/drafts/<ai-flat>.json multi-model/drafts/<human-flat>.json
```

Already run: Luke 23:1–56 AI draft at `multi-model/drafts/LUK23-draft.json`. See `multi-model/LUK23-COMPARISON-REPORT.md` for analysis.

### Banking confirmed forms
When the team confirms a word is correct Lagwan:
```bash
bun tools/approve-form.ts <word> --profile profiles/kot.json
```
Adds to `references/kot-approved-additions.json`. Only human-confirmed — never from AI output alone.

## What to do next

**Immediate (before next drafting session):**
- [ ] Bank `Ɓɨn` (crucify/hang), `hazanna` (paradise), `pitɨna` (insurrection), `mɓakeen` (criminal) via `approve-form` once confirmed with a native speaker or team lead
- [ ] Feed the `duniya` / `za ze` consultant-check findings back to the translation team — these are real issues in their Luke 23 draft
- [ ] Run consultant-check on Luke 23:11–56 and all of Luke 24 (the sandbox is 109 verses; only 10 have been checked)

**Medium term:**
- [ ] Extract and import the team's Paratext notes (Notes_Aaron Shryock.xml, Notes_Ibamie Youssouf.xml, etc.) into a structured format so prior consultant decisions don't get re-raised
- [ ] Verify `spel` (teaching) — check how Luke 4:15, 5:17, 13:10 render διδάσκω in this translation
- [ ] Confirm ǝ and ɍ status with the team — are they used, or should they be removed from the character inventory?
- [ ] Add Luke 24 AI draft for a second comparison chapter

**When more OT is translated:**
- [ ] Re-run `paratext-import` + `build-lexicon` to update corpus: `bun tools/paratext-import.ts --from ~/Downloads/LB25 --iso kot`
- [ ] Check whether new books change any hapax or unattested word status

## Source data

LB25 Paratext project: `~/Downloads/LB25/` (zip: `LB25-20260630T062128Z-3-001.zip`)  
Books present: Genesis (50 ch), Exodus (40 ch), Matthew (28 ch), Mark (16 ch), Luke (24 ch)  
Team: Ibamie Youssouf, Issuf Marouf, Thomas Guiria Ahinawai, Aaron Shryock (SIL consultant)  
Versification: 4 (standard)
