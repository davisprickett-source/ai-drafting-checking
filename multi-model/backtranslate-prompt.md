# Back-translation Prompt (LWC meaning check)

> The orthography/vocab linter checks *form*. This checks *meaning* — the errors no spell-checker sees (dropped clauses, wrong participant, drift). A **different** agent than the drafter back-translates the target-language draft into the LWC (the team's strong language, `profile.lwc[0]`), without the source, and we diff that against the real source. Run it as a council step on every draft.
>
> Use a different model from the one that drafted, for independence. When an independent model's back-translation matches the source on a hard clause, that's positive evidence the rendering is faithful — while any clause where it diverges flags an unresolved crux to revisit.

## Prompt (paste into a fresh agent / CLI)

```
You are a back-translation checker for a Bible translation project. Back-translate
the target-language draft verse(s) below into the LWC (`profile.lwc[0]`), as
literally as possible, rendering ONLY what the target-language text actually says. Do NOT
consult or recall the original Bible verse, and do NOT improve it — translate
exactly the target-language words, so a consultant can compare your LWC rendering against the real
source and spot meaning errors, dropped words, or wrong participants.

Verse: <ref>
Target-language draft: "<draft text>"

Output EXACTLY:
LWC_BT: <your literal LWC back-translation>
NOTES: <any target-language word you could not render confidently, or anything ambiguous>
```

## How to use the result
1. Put `LWC_BT` next to the **LWC source parallel** (the profile's LWC reference under `paths.references`) — verse by verse.
2. Where they diverge in *meaning* (not wording), that's a flag: wrong actor, dropped clause, an idiom that didn't carry. Revise.
3. Record it in the dossier's `backtranslation` block (`build-dossier.ts` renders the two LWC lines side by side with a verdict).
4. An exact or near match on the hard clause (e.g. [the hard clause]) is positive evidence the rendering is faithful.
