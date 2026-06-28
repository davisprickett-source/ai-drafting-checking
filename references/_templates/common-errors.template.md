# [TARGET LANGUAGE] — Common AI Errors to Avoid (the Negative Prompt)

> This is the most important file in the pack. It is the **negative prompt**: the exact mistakes frontier models make when drafting your target language, each paired with the correct form. Build every entry from a verse-level critique of real AI drafts (e.g. an expert critique of actual Sonnet/Gemini/other-model output by a fluent speaker), cross-checked against your corpus where possible.
>
> **Why this exists:** A frontier model isn't missing your-language knowledge so much as drowning it in its prior for the majority / related / standardized language(s) it saw far more of in training. Listing vocabulary ("use X") is not enough — the model also needs to be told **what to suppress**. Paste this whole file into the drafting context; the orthography/leak rules below also live in the profile's `linter_rules[]` (pure config) so the check tool can catch what slips through automatically.

The frame, in one line: **the model is constantly leaking the majority/related language into your target language.** Every section below is a class of leak.

> **How to fill this file:** Collect 1-3 real AI drafts of a passage, have a fluent speaker mark every error, then sort each error into the sections below. Name the model that produced each wrong form — it helps you see which model leaks which way. As patterns harden into mechanical rules, move them into `linter_rules[]` in the profile so they're checked on every draft.

---

## A. Alphabet / script

The hard, mechanical rules of how your language is written down. A verifier can check these — they are the easiest leaks to catch automatically, so make them precise.

| Rule | Correct | Wrong (and which model produced it) |
|------|---------|-------------------------------------|
| `<a sound that has ONE correct spelling in your orthography>` | `[correct spelling]` | `[the majority-language spelling a model reached for]` (which model) |
| `<a letter the majority language writes differently>` | `[your form]` | `[their form]` (which model) |
| `<a vowel-length or doubling rule>` | `[correct]` | `[wrong]` (which model) |
| `<any hard cap, e.g. max N identical letters in a row>` | `[example obeying it]` | `[example breaking it]` (which model) |

## B. Orthography

Spelling conventions below the alphabet level — short-vowel choices, diacritic marking, hyphenation, clitic attachment. This is where a model silently re-spells your words using the standardized/related language's conventions.

| Rule | Correct | Wrong |
|------|---------|-------|
| `<a diacritic you do / don't mark, and where>` | `[correct]` | `[wrong]` |
| `<short vowels follow YOUR language, not the standard variety>` | `[your vowelling]` | `[the imported vowelling]` |
| `<how affixes/clitics attach — hyphen? no hyphen?>` | `[correct]` | `[wrong]` |

> Call out the **signature** of the leak here: e.g. "`[these specific vowellings]` are the standard-variety spellings; YOUR language uses `[these]` instead." Naming the pattern helps both the model and the human reviewer spot it fast.

## C. Grammar (the dialect / related-language leak class)

The structural tells — the model imports morphology, agreement, or auxiliaries from the related/standard language. Each row is a forced choice between your form and the imported one.

| Issue | Correct (your language) | Wrong (imported) |
|-------|-------------------------|------------------|
| `<progressive / continuous aspect — how YOU mark it>` | `[your marker]` | `[the auxiliary a model overuses]` |
| `<a pronoun or agreement suffix that differs from the standard>` | `[your form]` | `[the standard form]` |
| `<a function word that elides / contracts differently>` | `[your form]` | `[their form]` |
| `<verb morphology — your natural ending vs. the standard ending>` | `[your form]` | `[their form]` |

> Identify your **single biggest tell** — the one imported feature that, if present, instantly marks a draft as foreign. (For many languages it's an overused auxiliary or an agreement ending from the prestige variety.) Have the verifier count its density, and say so here: e.g. "If a draft is sprinkled with `[X]`, it's reading as foreign. The verifier counts `[X]` density."

## D. False words (hallucinations / leak imports)

Words that simply aren't in your language — either invented by the model, or pulled from a related variety where they mean something else (or nothing). List correct ↔ wrong pairs.

| Meaning | Correct (your language) | Wrong forms produced |
|---------|-------------------------|----------------------|
| `[a body part / common noun a model faked]` | `[correct, corpus-attested if possible]` | `[the wrong word(s)]` (which model) |
| `[a verb the model invented]` | `[correct]` | `[invented forms]` (which model) |

> When the model doesn't know a word in your language, its failure mode is to **substitute a near-word from the related language that often means nothing to your readers.** Instruction to the model: if you are not confident a word is genuine in the target language, mark it `⟨?⟩` rather than confabulating. A human reviewer would far rather see a gap than a plausible-wrong word — anchoring / automation bias is real, and a confident wrong word is harder to catch than a blank.

## E. Idioms (translate the sense, not the words)

Source-language idioms must become natural idioms in your language, not word-for-word calques. Your human team's renderings are the gold standard — collect them here as they're produced.

| Passage | Source idiom | Natural rendering (your team) | Frontier calques to avoid |
|---------|--------------|-------------------------------|---------------------------|
| `[ref]` | `[the source figure of speech]` | `[your natural equivalent]` | `[the literal calques models produced]` |
| `[ref]` | `[idiom]` | `[natural]` | `[calque(s)]` |

## F. Reader assistance & translation choices

Translation is a chain of choices, not one-to-one matching. List the judgment calls your human team made that the models missed — these teach the model to *attempt and flag* rather than silently guess.

- **`<a genealogy / kinship convention>`** — e.g. how "son of" is rendered in lists vs. prose; note which form the team uses and which the models wrongly used.
- **`<reduce / restructure feature>`** — e.g. collapsing long strings of rhetorical questions that read as unnatural in your language.
- **`<make implicit cultural meaning explicit>`** — e.g. spelling out a culturally opaque practice (a vow, a gesture) so readers understand it; note where models left it opaque.
- **`<resolve confusing person shifts>`** — e.g. a self-reference in 3rd person that should become 1st person in natural speech.
- **`<avoid childish repetition>`** — vary phrasing where the source repeats, if repetition reads as simplistic in your language.

These are judgment calls; instruct the model to *attempt* them and *flag* them for the human, not to silently guess.

---

## Verse benchmark — [REF] (your team's gold draft)

Pick one verse your human team has rendered well and that packs many of the contrasts above. Aim every draft at the register of this attested human rendering.

> **`[paste the attested human-team rendering in your target language here]`**
>
> "`[a free back-translation into the LWC so reviewers can follow]`"

Notice everything this packs that the AI drafts miss: `<call out each correct choice — the right verb, the right aspect marker, the natural discourse marker, the correct proper name, the idiom handled by sense — and contrast it with what the models reached for>`. **This is the target.**
