# Lagwan (kot) — Common Errors Reference

> Each error type includes: description, wrong form, correct form, corpus evidence (attested), and the linter rule that catches it.

---

## Error 1: Arabic-script character in Lagwan body text

**Description:** Lagwan uses the Latin script exclusively. Any Arabic-script Unicode character (`U+0600`–`U+06FF`) in a verse is always an error — likely a copy-paste intrusion from an Arabic or French-Arabic source text.

**Wrong form:**
> `Malwa a halak'a السماء`

**Correct form:**
> `Malwa a halak'a asama ka lɨghwaɗɨ` — GEN:1:1

**Corpus evidence:** 4889 verses containing ɨ prove the correct Latin-only encoding throughout. No Arabic-script verse in the corpus.

**Linter rule:** `KOT-arabic-script` (error) — pattern `[؀-ۿ]`

---

## Error 2: Wrong divine name — 'Allah' instead of 'Malwa'

**Description:** `Allah` is a Hausa/Arabic form not used in Lagwan. The linter flags it as a Hausa-form intrusion. The corpus confirms `Malwa` is the only God-name used (667 verses; 0 for `Allah`).

**Wrong form:**
> `Allah a halak'a asama`

**Correct form:**
> `Malwa a halak'a asama ka lɨghwaɗɨ` — GEN:1:1

**Corpus evidence:** `Allah` = 0 corpus hits. `Malwa` = 667 verses, including GEN:1:1, MRK:1:1.

**Linter rule:** `KOT-hausa-form` (warn) — pattern `\b(Allah|gaskiya|yaro|uba|mata|mutum)\b`

---

## Error 3: Non-standard Jesus name

**Description:** The only attested form for Jesus is `Yasu`. All other transliterations are errors: `Jesu` (English-influenced), `Isa` / `Issa` (Arabic/Hausa), `Yesu` (Hausa), `Yésu` (French).

**Wrong forms:** `Jesu`, `Isa`, `Issa`, `Yesu`, `Yésu`

**Correct form:** `Yasu`
> `Na zaman ale, Yasu a lo na Nasira na lɨghwaɗɨ ɨl Jalil` — MRK:1:9
> `Hɨnne slun he na labar ha a bbi ha Yasu Masi, Ghule Malwa ale.` — MRK:1:1

**Corpus evidence:** `Yasu` = 772 verses; all other Jesus-name forms = 0 hits.

**Linter rule:** `KOT-yasu-variant` (error) — pattern `\b(Jesu|Isa|Issa|Yesu|Yésu)\b`

---

## Error 4: Lowercase 'malwa' where Malwa (proper noun) is intended

**Description:** `Malwa` as the divine name is a proper noun and must be capitalized. Lowercase `malwa` may appear in compounds or derivatives but is flagged for review.

**Wrong form:**
> `malwa a ka ki: «Nur nɨ ghɨn na li.»`

**Correct form:**
> `Malwa a ka ki: «Nur nɨ ghɨn na li.»` — GEN:1:3

**Corpus evidence:** `Malwa` (capitalized) = 667 verses. Lowercase `malwa` in lexicon at 758 tokens includes both proper-noun uses and any derivatives — each lowercase instance needs review.

**Linter rule:** `KOT-malwa-case` (warn) — pattern `\bmalwa\b` (lowercase only)

---

## Error 5: French function words intruding into Lagwan text

**Description:** Drafters who work in French sometimes slip French conjunctions or articles into Lagwan text. Common intruders: `et`, `le`, `la`, `de`, `mais`, `avec`, `pour`.

**Wrong form:**
> `Yasu a ka et Mariyam ki: «Sa gɨ ɗɨval sa»`

**Correct form:**
> `Yasu a ka Mariyam ki: «Sa gɨ ɗɨval sa»`
> (Lagwan uses `ka` not `et`; addressee follows `a ka` directly)

**Corpus evidence:** MRK:1:3 `Malwa a ka ki: «Nur nɨ ghɨn na li.»` — all speech events use `ki`, never `et` or French connectors.

**Linter rule:** `KOT-french-conj` (warn) — pattern for common French function words

---

## Error 6: Duplicate determiner 'ale ale'

**Description:** Copy-paste or editing artifact that duplicates the determiner. In Lagwan, `ale` appears once post-nominally.

**Wrong form:**
> `Malwa ale ale a halak'a asama`

**Correct form:**
> `Malwa a halak'a asama ka lɨghwaɗɨ` — GEN:1:1
> `Vushi ha Malwa ale nala a nful na kal am ale.` — GEN:1:2

**Corpus evidence:** `ale` is the 5th most common token (4909 occurrences). Every nominal phrase uses exactly one `ale`. The pattern `ale ale` is never attested.

**Linter rule:** `KOT-duplicate-article` (error) — pattern `\bale\s+ale\b`

---

## Error 7: Using 'almajiri' or 'ashabu' for disciple

**Description:** The Lagwan word for "disciple" is `fuk'urayye` (singular `fuk'ura`). Hausa-origin `almajiri` and Arabic-origin `ashabu` return 0 corpus hits and should never appear.

**Wrong forms:** `almajiri`, `ashabu`

**Correct form:** `fuk'urayye` / `fuk'ura`
> `ka fuk'urayye hiya ni ale. Age mi hi ya zɨbe ni ale te piyya.` — MRK:2:15
> `Fuk'urayye hiya ni ale i slɨna ghuzɨm.` — MAT:12:1

**Corpus evidence:** `fuk'ura` = 203 verses. `almajiri` = 0 hits. `ashabu` = 0 hits.

**Linter note:** No existing rule — add a custom `KOT-hausa-disciple` warn rule for `\b(almajiri|ashabu)\b` if needed.

---

## Error 8: Using non-attested transliterations for proper names

**Description:** Several "guessed" transliterations for NT names produce 0 corpus hits. The corpus has specific attested forms for all apostles and places.

| Wrong form used | Correct Lagwan form | Reference |
|-----------------|--------------------| ---------|
| Simun | Sim'an | MRK:1:16 |
| Bitrus | Butrus | MRK:3:16 |
| Andiru | Andareyas | MRK:1:16 |
| Baitalahama | Bet Laham | MAT:2:1 |
| Musaku | Musa | lexicon #87 |
| Zibadawu | Zabadi | MRK:1:19 |
| Hawwali | Hawwa | GEN:3:20 |
| Matiya | Matta | MRK:3:18 |
| Tadawus | Taddaya | MRK:3:18 |
| Batalamyu | Bartulma | MRK:3:18 |
| Annabi | nabi | MRK:6:4 |
| Almas / Almassihu | Masi | MRK:1:1 |

**Linter note:** Run `bun tools/grep-corpus.ts "[NAME]" --profile profiles/kot.json` before using any proper name that is not listed in `kot-proper-names.md`.

---

## Error 9: 5+ consonants in a row (encoding/typing error)

**Description:** Lagwan words have regular vowel-consonant patterns. A string of 5+ consonants without any vowel almost always indicates a Unicode encoding error, a missing character, or an improper joining of two words.

**Wrong form:**
> `hltk'anfa`

**Correct form:** Any Lagwan token with regular VC structure, e.g., `halak'a`, `ghɨnel`, `muudiza`

**Corpus evidence:** GEN:1:1 `Malwa a halak'a asama ka lɨghwaɗɨ` — regular VC pattern throughout.

**Linter rule:** `KOT-long-run-no-vowel` (warn) — pattern `[^aeiouǝɨAEIOUƏƗ ]{5,}`
