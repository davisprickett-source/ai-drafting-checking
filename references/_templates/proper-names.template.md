# [TARGET LANGUAGE] Proper Names (OT)

> **Authority tags** — mark every form:
> - `[authoritative]` = the form used by your actual translation team (a fluent speaker / project lead). Treat as ground truth.
> - `[corpus-attested]` = the form appears in your existing corpus (e.g. an already-published NT or other known text) in this project.
> - `[UNVERIFIED]` = a best guess. **Do NOT assert these in a draft as if correct.** They must be confirmed against your reference text / the team / a native speaker.
>
> Name tables built "by analogy" reliably produce wrong forms. Analogy is not authority. Where this file has an authoritative form, it supersedes any analogy-derived table elsewhere (e.g. in the style guide).

---

## The transliteration rules (derived from the authoritative set)

Once you have a handful of authoritative names, reverse-engineer the team's conventions from them. These rules are *derived*, so apply them to produce **candidates**, never final forms.

Fill in the patterns you observe, for example:

1. **`<how source initial vowels map>`** — e.g. source `[E-]` → your `[A-]`. Note which wrong prefix the models reached for.
2. **`<initial glottal / consonant marking>`** — does the team mark a word-initial glottal/pharyngeal on names, or not? State it.
3. **`<how source gutturals surface in the stem>`** — e.g. → `[kh]` / `[your grapheme]`.
4. **`<how long vowels are written>`** — e.g. doubled, matching corpus romanization.
5. **`<source o/u → which vowel>`**, plus any consonant shifts (e.g. a regular `[Z→S]` type change).

These rules are a *hypothesis* about the team's system. Use them to generate candidates for the many names not yet in the table below, then **flag every generated name as `[UNVERIFIED]`** until confirmed.

---

## Authoritative forms

The names your team has explicitly confirmed. Add the wrong forms models produced so the check tool / reviewer can flag them.

| English | [Target language] | Tag | Frontier got it wrong as |
|---------|-------------------|-----|--------------------------|
| `[Name]` | **`[your form]`** | `[authoritative]` | `[wrong form]` (which model) |
| `[Name]` | **`[your form]`** | `[authoritative]` | `[wrong form]` (which model) |

> Note a known whole-system failure mode if relevant: e.g. verse-by-verse NMT can drop in a completely unrelated character's name. Frontier models usually avoid that but still miss the team's spelling. The fix for both is the same: **give the model the names list up front.**

## Names from your existing corpus (reuse these spellings)

Names that already appear in your published/known corpus — reuse them verbatim for consistency.

| English | [Target language] | Tag |
|---------|-------------------|-----|
| `[Name]` | **`[your form]`** | `[corpus-attested]` (where it appears) |
| `[Name]` | **`[your form]`** | `[corpus-attested]` |

## Names still needing confirmation — `[UNVERIFIED]`

> 🔒 **CHECK-SET FIREWALL (do not breach).** If you hold a published reference translation of the very text you're drafting, that text is a **CHECK** set only. Its proper names, key terms, and wordings must **never** be fed into a drafting session — doing so contaminates the experiment, because a draft has to be *independent* of the text you grade it against. You may already know some name forms from it, but they stay quarantined on the check side. For drafting, treat all such names as `[UNVERIFIED]`, let the model propose with the rules above, and reconcile against the reference text **only at the check stage, never before.**

Do not trust these. Generate with the rules above, then confirm before use:

| English | Candidate (UNVERIFIED) | Note |
|---------|------------------------|------|
| `[Name]` | `[candidate]` | `<why unconfirmed — not in corpus, title character, two competing forms, etc.>` |
| `[Name]` | `[candidate]` | `<note>` |

---

## How to use this in a draft

1. Paste the **authoritative** + **corpus-attested** tables directly into the drafting context as a fixed names list.
2. For any name not in those tables, the model must (a) generate a candidate with the rules, (b) **mark it** so the human reviewer knows it is unconfirmed — e.g. output `[Candidate]⟨?⟩`. Never let an unconfirmed name pass silently.
3. After drafting, run the check tool — its profile `linter_rules[]` should flag the name-spelling tells you identified above (wrong initial marking, wrong prefix vowels, etc.).
