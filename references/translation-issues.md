# Translation Issues — when to commit, and when to offer options

> Most verses have a defensible single rendering. But a recognizable set of issues have **no single right answer on the first pass** — metaphors, measurements, unknown concepts, rhetorical structure. For these the drafter must NOT commit to one phrase. Offer 2–3 genuine options as `{A ⟂ B ⟂ C}`, each with its warrant, flag the issue type, and say what the translator should think through. Forcing one answer where the language is genuinely open is the mistake.

## The rule
For each issue type below: **detect → strategy → offer options (with warrants) → flag what to decide.** Use `tools/find-parallels.ts` (similar vocabulary) AND `tools/find-structures.ts` (similar discourse/shape) and `tools/grep-corpus.ts` (how a form is really used) to ground the options in real verses before offering them.

## Issue taxonomy

| Issue | Strategy | Offer options like |
|-------|----------|--------------------|
| **Metaphor / word-image** | keep the image if it carries in the target language; else give the sense; else swap to a local image | `{keep-image ⟂ sense ⟂ local-image}` — e.g. "horn of salvation" → image vs "strong saviour" |
| **Idiom** | render the sense, not the words; offer formal vs natural | `{natural ⟂ source-faithful}` — e.g. "closed her womb" → "made barren" vs literal |
| **Measurements / weights / money / time** | keep + brief gloss, OR convert to a local/known measure, OR approximate | `{keep+gloss ⟂ local-equivalent ⟂ approximate}` — cubits, shekels, units of volume |
| **Key terms** | use the established target-language term; if it's an OT term not in your corpus, offer candidates and FLAG for the team | `{candidate-A ⟂ candidate-B}` + ⟨?⟩ |
| **Unknown / culture-specific concept** | nearest functional equivalent, OR descriptive phrase, OR borrow + short explanation | `{equivalent ⟂ descriptive ⟂ borrow+gloss}` — e.g. "snow" → "white like [a locally-known white substance]" |
| **Implicit information** | make explicit, OR leave + (footnote) | `{explicit ⟂ implicit}` — e.g. a culturally-loaded vow → spell out what it signals |
| **Rhetorical structure** (question stacks, parallelism, repetition) | match the discourse effect, not the count; often reduce | `{keep-all ⟂ reduce/combine}` — e.g. a four-question stack → three |
| **Proper names** | transliterate per the project rules; mark ⟨?⟩ until confirmed | `Name⟨?⟩` + candidates |
| **Figures of speech / euphemism** | render the intended meaning at the right register | `{euphemism ⟂ plain}` — e.g. "knew his wife" → "met with his wife" |
| **Discourse order** | match the corpus's pattern for this scene type — check `find-structures` | (not an option set — fix the order; see below) |

## Discourse / structure is its own check
Vocabulary can all be attested and the verse still be wrong because the **order/shape** is off (e.g. some languages front the time-setting clause — "after they had eaten, X rose…" — rather than putting the subject first). Before finalizing a narrative verse, identify its discourse type and check how your corpus does it:
- `bun tools/find-structures.ts narrative-opening` — scene starts (time clause fronted)
- `bun tools/find-structures.ts participant-intro` / `naming-formula` — introducing someone
- `bun tools/find-structures.ts dialogue-frame` / `sequential` / `temporal-when`
Then match that shape. This is a structural check the vocabulary linter cannot do. The available `<type>` values come from the profile's `structure_patterns[]`.

## Output expectation
A draft that hits any of the above should arrive at review already showing the options and the issue, so the human is choosing among grounded alternatives — not catching a problem the drafter hid by committing too early.
