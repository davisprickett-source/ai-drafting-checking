# [TARGET LANGUAGE] Narrative Exemplars (positive grounding)

> The other reference files are mostly a **negative** prompt (what not to do). This file is **positive**: real, community-reviewed narrative from your existing corpus, chosen because it matches the register and content of the passage you're drafting. Every verse here must be **attested** in your corpus — none invented. Paste these into the drafting context as few-shot models of *how the team actually writes narrative*.
>
> To pull exemplars for a **different** passage, run:
> `bun tools/find-parallels.ts -k 8 <target-language content words>`

---

## Why [your anchor passage] is the anchor

Pick a passage from your corpus whose **register and content match the genre you're drafting**, and say why. The strongest anchor shares concrete features with the target scene — for an OT birth-narrative you'd want a corpus passage with the same beats (an older/childless couple, a temple, a prayer, a promised child, a vow, a naming). List the shared features so the match is auditable, and tell the drafter: if you're drafting `[your target passage]`, these are the verses to imitate.

### The new-character introduction formula (fixes "poor introduction of new participant")

> **`[ref]`** — *`[paste the attested verse in your language]`*
> "`[free back-translation into the LWC]`"

- **`[the participant-introduction formula in your language]`** = "a certain [person] named X" — this is THE shape for introducing a new participant. Note that AI drafts botch this and the corpus hands you the fix.
- Pull any term this verse corpus-confirms (e.g. "priest = `[your term]`," cross-ref `key-terms.template.md`).
- Note the words for "his/her wife," "his/her name," etc. as reusable slots.

### `[Key idiom #1 — e.g. barrenness]` (fixes the literal-calque the models produce)

> **`[ref]`** — *`[attested verse]`*
> "`[back-translation]`"

- **`[your natural word/phrase for the concept]`** = `[gloss]`. Do **not** calque the source idiom literally (note the calque a model produced). Use the word your language already has. Confirm exact phrasing with a native speaker, but `[your anchor word]` is the anchor.

### `[Prayer / petition vocabulary]`

> **`[ref]`** — *`[attested verse]`*
> **`[ref]`** — *`[attested verse]`*

- List the attested forms your corpus actually uses for prayer/petition. **This is the payoff of corpus-grounding over a secondhand error list: the corpus tells you what's real, not just what one reviewer flagged.** Give the construction that matches your target scene.

### `[Birth / son / naming vocabulary]`

> **`[ref]`** — *`[attested verse]`*
> **`[ref]`** — *`[attested verse]`*

- **`[your word for "son / child"]`**, **`[bear / bore]`**, **`[name him]`** — the exact verbs your target naming verse needs. Note any genealogy connector here too (e.g. the "X son-of Y" form to use in lists).

> Add a section per recurring narrative element your target genre needs (vow, sacrifice, blessing, lament, etc.), each anchored to an attested corpus verse.

---

## General narrative machinery (any narrative)

Discourse markers, attested and natural — use these instead of stiff calques. Fill from your corpus:

| Function | [Target language] (attested) | Example ref |
|----------|------------------------------|-------------|
| "and after that" | `[form]` | `[ref]` |
| "and at that point / right then" | `[form]` | `[ref]` |
| "and when…" | `[form]` | `[ref]` |
| "immediately" | `[form]` | `[ref]` |
| sequential action chain | `<your sequential connector>` | throughout |
| direct speech | `[your introducer + quote convention]` | `[ref]` |

> Note any verse that also models a **mid-narrative** participant introduction (same formula as above), with its ref.

---

## How to use this file in the loop

1. For the passage you're drafting, run `bun tools/find-parallels.ts -k 8 <target-language content words>` and paste the top 5-8 hits in alongside this file.
2. Tell the model: **"match the register and the discourse markers of these attested verses; reuse their formulas (participant intro, naming, the key idioms) where the scene parallels."**
3. After drafting, the corpus-membership check (the check tool with its lexicon/`linter_rules[]`) flags any word the model used that your attested corpus never does.
