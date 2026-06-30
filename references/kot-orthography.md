# Lagwan (kot) — Orthography Reference

> Corpus-derived. All examples are attested verses. Do NOT use Arabic script — Lagwan uses Latin only.

## Script overview

Lagwan uses an extended Latin alphabet with implosive consonants, special vowels, and ejective markers. The apostrophe `'` marks ejective consonants. No Arabic-script characters appear in any attested verse.

## Phoneme inventory (attested characters)

| Character | IPA | Type | Corpus hits | Example verse |
|-----------|-----|------|-------------|---------------|
| `ɓ` | /ɓ/ | bilabial implosive | 496 verses | GEN:2:24 — `sa a ɓɨn zi ze gɨntɨ ni` |
| `ɗ` | /ɗ/ | alveolar implosive | 2558 verses | GEN:1:1 — `Malwa a halak'a asama ka lɨghwaɗɨ` |
| `ɨ` | /ɨ/ | high central unrounded vowel | 4889 verses | GEN:1:6 — `Am ale i praka zi mba xsɨɗe` |
| `ǝ` | /ə/ | mid central vowel | 0 (UNVERIFIED — not found in corpus) | — |
| `ɍ` | — | special r | 0 (UNVERIFIED — not found in corpus) | — |
| `k'` | /k'/ | velar ejective | 486 verses | GEN:1:1 — `Malwa a halak'a asama ka lɨghwaɗɨ` |
| `tl'` | /tl'/ | lateral ejective | 78 verses | GEN:2:12 — `Dinar hɨn lɨghwaɗɨ ne i tl'ɨren` |

## Vowel system

Profile declares: `a e ǝ i ɨ o u`

Confirmed in corpus: `a`, `e`, `i`, `ɨ`, `o`, `u` — well-attested throughout.
`ǝ` (schwa): declared in profile but returns 0 corpus hits. May be a theoretical entry or encoded differently.

## Ejective consonants

Ejectives are marked with an apostrophe `'` immediately after the consonant letter:

- `k'` — velar ejective, 486 verses:
  - GEN:1:1 `Malwa a halak'a asama ka lɨghwaɗɨ`
  - GEN:1:4 `Malwa a ngwa li ki nur ale a bbi ta a saxa nur ale ya ka gurvak'e ale`
  - GEN:1:21 `Malwa a halak'a kii hɨn dɨmmi na lɨghɨmi ale`
- `tl'` — lateral ejective, 78 verses:
  - GEN:2:12 `Dinar hɨn lɨghwaɗɨ ne i tl'ɨren`
  - GEN:17:17 `Ibrahima a ɗɨ nkulum kal lɨghwaɗɨ ta a tl'ahɨ`
  - GEN:18:12 `Indɨ tl'ahɨ i mala na i`
  - GEN:18:15 `Sara da nk'a haku indɨ ka: «Wa tl'ahɨ sa.» Age i ɨn ɗɨval, amma ni a ka i: «Aa, ga tl'ahɨ.»`

## Implosive consonants

Implosives differ phonemically from their plain counterparts:

- `ɓ` — bilabial implosive (distinct from plain `b`), 496 verses:
  - GEN:1:16 `ha taɓu ale a ghɨn dawa na ni kal nvaɗe`
  - GEN:2:24 `sa a ɓɨn zi ze gɨntɨ ni ka shi i ghɨn zezi tku`
  - GEN:3:7 `Ta ya ɓɨn mpaslahe hi zara ale ze mataɗe`
  - GEN:4:4 `Habila dɨgi a ghɨn aduwa hɨn ghɨli mparga hi ya we tɨn vaka na ngul ngama na ni ne ka mɓi ha tɨn ale`

- `ɗ` — alveolar implosive (distinct from plain `d`), 2558 verses (most common extended character):
  - GEN:1:1 `Na ge slun he ne, Malwa a halak'a asama ka lɨghwaɗɨ`
  - GEN:1:11 `Deɗɨ ne, Malwa a ka ki: «Lɨghwaɗɨ ale nɨ bo ghwe hi katrapu»`
  - GEN:1:14 `nur nɨ za zi ya na asama ne ki a saxa ɨl le sagɨli ka nvaɗe ya`

## Common word shapes with special characters

| Word | Gloss | Notes |
|------|-------|-------|
| `lɨghwaɗɨ` | earth/land | both ɨ (×2) and ɗ in same word |
| `Deɗɨ` | then/at that time | narrative connector with ɗ+ɨ |
| `halak'a` | created/made | k' ejective — common verb |
| `tl'ɨren` | gold/pure | tl' ejective |
| `ɓɨn` | enter/put in | bilabial implosive |
| `mɓi` | animal/creature | cluster mɓ |
| `Vɨshi` / `Vushi` | spirit/breath | high central vowel |
| `sɨfaxɨ` | holy | ɨ vowel twice |
| `xsɨɗe` | upper/high | both ɨ and ɗ |

## Linter rules to enforce orthography

- **KOT-arabic-script** (error): Arabic-script Unicode block `[؀-ۿ]` — Lagwan never uses Arabic script
- **KOT-bad-implosive-ascii** (warn): Mixing plain `b`/`d` where `ɓ`/`ɗ` is expected
- **KOT-long-run-no-vowel** (warn): 5+ consonants without a vowel — likely encoding error

## Do-NOT-use

- No Arabic-script characters ever
- `ǝ` — not confirmed in corpus (0 hits); if theoretically needed, verify with team
- `ɍ` — not confirmed in corpus (0 hits); flag any occurrence
