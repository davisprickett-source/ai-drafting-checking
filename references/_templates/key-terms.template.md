# [TARGET LANGUAGE] Biblical Key Terms

> **The OT key-term gap is structural.** Frontier models and verse-by-verse NMT alike are trained/prompted mostly on the **NT** (or whatever known text already exists in your language). Many OT key terms (Temple, priest, sacrifice, the divine name, "LORD of hosts") either don't occur in that known corpus or occur differently. With no source for them, the model invents or imports from the standard/prestige language. The fix: **supply the OT key terms explicitly.**
>
> Authority tags as in `proper-names.template.md`. Run corpus checks against your existing known-text corpus (e.g. an NT verse set).

---

## OT key terms (the ones the drafts got wrong)

The terms a model fumbled because it had no in-language source. Record your term, its authority, and the wrong forms to suppress. Where you can, back the term with a corpus count (e.g. the standard-language word gets **0 hits** in your corpus, your word gets many) — that turns a preference into a checkable fact.

| Concept | Use | Tag | Do NOT use |
|---------|-----|-----|------------|
| Temple / House of God | **`[your rendering]`** | `[authoritative]` | `[the calques models produced]` (which model) |
| LORD of hosts | **`[your rendering]`** | `[authoritative]` | `[wrong forms]` |
| Priest | **`[your rendering]`** | `[authoritative]` + corpus (`[standard word]` = N hits; `[your word]` = M hits) | `[the standard-language word]` |
| Sacrifice | **`[your rendering]`** | `[authoritative]` / `[corpus-attested]` (counts) | `[wrong forms]` |
| To pray / petition God | **`[your rendering(s)]`** | `[authoritative]` + corpus | `[the devotional term from the prestige variety]` |

### Notes on each

- **Temple → `[your rendering]`.** Note the standing rendering of the divine name in your tradition and why "House of the Lord" should/shouldn't be calqued. State the default.
- **The divine name in narrative.** `[UNVERIFIED — confirm with team]`: in running OT narrative ("the LORD said to X"), record the team's standing rendering. Note which form the frontier drafts wrongly reached for, and treat it as suspect until confirmed.
- **Priest → `[your rendering]`.** Explain why the standard-language word is wrong here (e.g. it does not occur in your corpus at all). This is a textbook leak error worth spelling out.
- **Pray.** Distinguish *petition* (ask God for something) from the *act/posture* of prayer if your language does — name the corpus-attested form for each, and the prestige-variety term that reads foreign.

---

## NT / known-corpus key terms (already in the style guide)

For vocabulary shared with your existing known corpus (the divine name, "Spirit," "Messiah," "sin," "truth," "salvation," etc.) use the **style guide** — those are corpus-derived and stable. This file only adds the **OT-specific** terms that the style guide cannot cover because they aren't in the known corpus.

## OT terms still to fill — `[UNVERIFIED]`, build the list before serious drafting

These biblical concepts recur in OT narrative and almost certainly are **not** safely derivable from an NT-only corpus. The concepts are language-neutral; the renderings are not. Confirm each with the team / a native speaker / any existing OT drafts before relying on a model's guess:

- ark (of the covenant)
- offering / grain offering / vow offering (distinct from "sacrifice")
- Nazirite / vow (see the dedicated-practice note in `common-errors.template.md` §F)
- prophet / seer (confirm the "seer" sense if your "prophet" word doesn't cover it)
- ephod, judge, tribe, anointing (of a king)
- hosts / armies (note whether your "LORD of hosts" rendering sidesteps a literal "armies")

> Method: grep any existing OT material in your language first (`tools/grep-corpus.ts` or equivalent); only then let the model propose, and mark every proposal `⟨?⟩` in the draft. To work up a new term from the corpus systematically, use the term-discovery tool (`tools/discover-term.ts`).
