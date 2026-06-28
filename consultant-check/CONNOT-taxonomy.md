# CONNOT Taxonomy (Barnwell / SIL) — the consultant flagging vocabulary

> The standard category system a translation consultant uses to flag issues during a check (Katharine Barnwell's CONNOT system, SIL 2012). Every note in a consultant check is tagged with one of these. We use it for **two** things: (1) reviewing a *human* translation (the consultant workflow), and (2) the same taxonomy back-feeds the AI-draft flags (the translation-issues reference, `references/<lang>-translation-issues.md`) so one vocabulary serves both. Tag format: category + code, e.g. `Idiom [L]`, `Participant reference [D]`, `Key biblical term [L]: Son of Man`.

## 1. Discourse [D]
Chiasmus · Chronological order of events · Cohesion/transition · Discourse unit · Formula ("Thus says the Lord") · Genre (narrative/procedural/expository/descriptive/hortatory/repartee) · Information load · **Participant reference** (a. introduction of new participant; b. back reference) · Perspective/direction · Poetry · Prominence · Relationship between propositions (reason-result, means-purpose, condition-consequence…) · Speech quotation (direct/indirect) · Theme

## 2. Exegesis and text [E]
Double meaning (author-intended ambiguity) · Interpretation of source text · Old Testament quotation · Textual variant

## 3. Communication [Co]
**Accuracy** · **Ambiguity** (unintended meaning) · Assumed information · **Clarity** · Emotive focus · Illocutionary force (statement/question/command skew) · Implicature · **Naturalness** · Omission of information · Sociolinguistic setting (register)

## 4. Grammar [G]
Comparative relation · Condition (if-clauses) · Ellipsis · Genitive in source text (A-of-B) · Negation · Other clause-level relationships · Passive voice · **Pronominal reference** (extended use, dual-plural, inclusive/exclusive we, gender) · Relative clause · Skewing grammar↔semantics (event nouns→verbs) · **Tense and aspect**

## 5. Culture [Cu]
Anachronism · Cross-cultural mismatch · Symbolism · **Unknown idea** (animal/plant/artifact/custom unknown to readers — solve via specific term, generic term, descriptive phrase, cultural substitute, or loan word)

## 6. Lexicon [L]
Collocation · Connotation · **Idiom** · **Key biblical term** (incl. theological/technical; tag the term, e.g. `Key biblical term [L]: kingdom of God`) · **Lexical correspondence** (incl. consistency — same source word rendered consistently unless reason not to) · **Proper name**

## 7. Rhetoric and highlighting [Rh]
Apostrophe · Euphemism (incl. avoiding "God") · Figurative extension (metonymy, synecdoche) · Form (acrostic, wordplay) · Hendiadys · Hyperbole · Irony · Litotes · **Metaphor** · Parable/allegory · Parallelism (syntactic, lexical) · Personification · Repetition · **Rhetorical question** · Simile · Sound symbolism · Vocative

## 8. Receptor language & setting [RL]
Book introduction · Book title · Cross-reference · Footnote · Front/back matter · Glossary · Influence (theological bias, third-language interference) · Layout · Numbering · **Orthography issues** (spelling, capitalization, punctuation, word breaks) · Parallel passage · Picture selection · Section heading

## 9. Miscellaneous
Catch-all for anything that doesn't fit.

---

## Mapping to our AI-draft flags
Most of what our system already checks IS a CONNOT category — which is why the same taxonomy serves both:
- corpus-membership / orthography linter → **Orthography issues [RL]**, **Naturalness [Co]**, **Lexical correspondence [L]**
- `find-structures` discourse check → **Participant reference [D]**, **Cohesion/transition [D]**, **Chronological order [D]**
- back-translation check → **Accuracy [Co]**, **Omission [Co]**, **Participant reference [D]**
- translation-issues taxonomy → **Idiom [L]**, **Metaphor [Rh]**, **Unknown idea [Cu]**, measurement (Unknown idea), **Rhetorical question [Rh]**, **Key biblical term [L]**
- proper-names → **Proper name [L]**
So a single flag carries a CONNOT tag whether it surfaced from an AI draft or a consultant reading a human translation.
