# Back-translation Prompt (LWC meaning check)

> The orthography/vocab linter checks *form*. This checks *meaning* — the errors no spell-checker sees (dropped clauses, wrong participant, drift). A **different** agent than the drafter back-translates the target-language draft into the LWC (the team's strong language, `profile.lwc[0]`), without the source, and we diff that against the real source. Run it as a council step on every draft.
>
> Use a different model from the one that drafted, for independence. The evidence is **asymmetric**: a clause where the BT *diverges* from the source is real evidence of a problem — but a clause where it *matches* is only weak evidence of fidelity, because the BT model knows the source text and a match may show memorization rather than faithfulness (see the contamination section below).
>
> ### ⚠️ The contamination problem (read before running)
> Every frontier model has the Bible memorized in every major language. If the BT agent can tell **which verse** it is looking at, it can "back-translate" from memory instead of from the draft — reproducing the real verse and thereby *hiding exactly the errors this check exists to catch* (a dropped clause "comes back" in the BT because the model knows it should be there). An instruction not to recall the original does not remove the memory; you have to remove the cue. So:
> 1. **Never give the BT agent the verse reference.** Use an opaque id (`S1`, `S2`, …) and keep the ref→id map on your side. (The template below reflects this.)
> 2. **Shuffle verse order** when back-translating a passage — sequential verses of a known chapter are self-identifying.
> 3. **Gloss first, then prose.** Ask for a word-by-word gloss line before the free rendering; a gloss forced to account for every target token can't silently restore a dropped clause.
> 4. **Treat a suspiciously perfect BT as a red flag, not a pass** — especially on a verse whose draft the linter flagged. If the BT reads like a published translation, the model probably recognized the passage; re-run with tighter blinding or a weaker/local model.
> 5. This check remains a **drift-catcher, not an independent oracle** (see `DRAFTING_PROTOCOL.md` Step 6). Blinding raises its value; nothing makes it equal to a human back-translator.

## Prompt (paste into a fresh agent / CLI)

```
You are a back-translation checker for a Bible translation project. Back-translate
the target-language draft verse(s) below into the LWC (`profile.lwc[0]`), as
literally as possible, rendering ONLY what the target-language text actually says. Do NOT
consult or recall the original Bible verse, and do NOT improve it — translate
exactly the target-language words, so a consultant can compare your LWC rendering against the real
source and spot meaning errors, dropped words, or wrong participants.

Segment: <opaque id, e.g. S1 — NEVER the verse reference>
Target-language draft: "<draft text>"

Output EXACTLY:
GLOSS:  <word-by-word gloss of the target text — every token accounted for, in order>
LWC_BT: <your literal LWC back-translation, built from the gloss>
NOTES:  <any target-language word you could not render confidently, or anything ambiguous>
If you recognize what passage this is, you MUST still render only the words in front of
you — and say so in NOTES ("recognized passage") so the checker can weigh the result.
```

## How to use the result
1. Put `LWC_BT` next to the **LWC source parallel** (the profile's LWC reference under `paths.references`) — verse by verse.
2. Where they diverge in *meaning* (not wording), that's a flag: wrong actor, dropped clause, an idiom that didn't carry. Revise.
3. Record it in the dossier's `backtranslation` block (`build-dossier.ts` renders the two LWC lines side by side with a verdict).
4. Read the evidence asymmetrically: a **mismatch** on a clause is evidence of a problem; a **match** is weak evidence only (the BT model knows the source — under contamination, a source-matching BT can come from a *wrong* draft). A match on a blinded, gloss-first BT is worth more than one on an unblinded prose BT, but neither substitutes for a human back-translator.
