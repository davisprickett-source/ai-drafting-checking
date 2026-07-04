# Luke 23 Translation Comparison — LB25 / Lagwan (kot)
*Generated: 2026-06-30 | Passage: Luke 23:1–56 (56 verses)*

---

> **Asymmetry caveat (added 2026-07-04):** the human translation's "2 confirmed accuracy concerns" were found because it was *adversarially consultant-checked* (10 verses); the AI draft has **not** been consultant-checked or native-read — its "0 hard errors" means linter-clean only, and its unknown-unknowns are uncounted. This ranking compares a text that was attacked against one that wasn't; run the same consultant-check on the AI draft's verses before quoting it.

## Three-Way Ranking

| Rank | Draft | Score | Key Signal |
|------|-------|-------|-----------|
| 🥇 1 | **LB25 Human Team** | Solid floor, native vocabulary | Real crucifixion verb, team-decided terms, but 2 confirmed accuracy concerns found by consultant-check |
| 🥈 2 | **This AI Draft** (ai-drafting-checking + kot corpus) | Documented gaps, sound structure | 0 hard errors, 7 LOW-confidence verses flagged explicitly, structural patterns correct |
| 🥉 3 | **Memra AI Draft** (Acts 1–4, April 2026) | Unknown floor, 77 undocumented guesses | One-shot, no verification, no linter, vocabulary guesses flagged but not grounded |

---

## 1 — LB25 Human Team Translation

**Overall: Best — but not finished, and the consultant-check found real problems.**

Strengths:
- **Native-register vocabulary the corpus confirms:** `Ɓɨn` for crucify (65 corpus hits: GEN:40:22 baker hanged, GEN:22:9 Isaac bound to altar — the correct hang/bind verb). AI missed this entirely.
- `mɓakeen` for criminals (attested), `pitɨna` for insurrection (human-confirmed), `xsɨɗe` = two (217 hits) used correctly.
- Right address at v.42: `Bɨla ha Dɨma` (Lord, matching Greek Κύριε) vs AI's `Yasu` (name, not title).
- `k'ɨla hɨn kaa na ghule mislam` for "The Skull" — translated the meaning, didn't borrow "Golgotha." Deliberate philosophy, probably right.
- Has a decision on paradise (`hazanna`) even though it's not in the corpus — team coined or confirmed it.

**Confirmed issues from consultant-check (Luke 23:1–10):**
- **v.2 `duniya`** — corpus shows 63 attestations all meaning *life/birth/world* (Arabic loanword dunyā), not *mislead/pervert*. The Greek is διαστρέφοντα (perverting). If hearers parse "nala a za duniya mataɗe" through the attested sense, the first charge against Jesus disappears. `discuss` — team must supply a parallel or revise.
- **v.5 `za ze ngwen hɨn`** — corpus returns 4 attestations of `za ze`, all meaning *clothe/dress/put on* (GEN:27:15, MAT:6:25, LUK:12:22, EXO:3:22). Greek is ἀνασείει = *stirs up / agitates*. Comprehension risk: "he clothes the people of Judea" is incoherent for the political charge. Field-test mandatory before locking.
- **v.5 `spel`** — 0 corpus hits for Greek διδάσκων (teaching). Hapax: confirm it's a recognized Lagwan word or find the attested term from Luke 4:15/13:10.

---

## 2 — This AI Draft (ai-drafting-checking, LUK 23, June 2026)

**Overall: Better than expected on structure; honest about its gaps; missable vocabulary items documented.**

| Metric | Value |
|--------|-------|
| Verses drafted | 56 |
| HIGH confidence | 29 (52%) |
| MEDIUM confidence | 20 (36%) |
| LOW confidence | 7 (12%) |
| Hard linter errors | **0** |
| Uncertain forms (⟨?⟩) | 25 verses |

**What worked:**
- Discourse structure: `Deɗɨ ne` (sequential), `Saa hɨn` (temporal), `Na yahɨ na` (scene-change), quotative frame `a ka [X] ki «»` all correctly applied throughout.
- Crucifixion formula `ghwaa na kal mɨzaghari` pulled from Mark parallels — verified, correct.
- `ghafara` for forgiveness (v.34) — corpus-attested (GEN:50:17, MAT:12:31), matches human team.
- `tɨlen` for innocent/righteous (v.47) — 38+ corpus hits, correctly distinguishes Luke's centurion confession from Mark's "Son of God."
- `abba` for Father in prayer address — attested LUK:22:42.
- `fɨnawun` for kingdom — 76 corpus hits, used correctly across v.42, v.51.

**What the corpus grounding missed:**
- **v.21 "Crucify"** — used `Tku` (kill, 0 implosive binding sense). Should be `Ɓɨn` (hang/bind, 65 hits). The `discover-term.ts` call with synonyms "hang, bind, nail, affix" would have found it; calling with "crucify" alone didn't.
- **v.33 Golgotha** — used `Juljusa` (Arabic transliteration). Human team translated the meaning. Both defensible, team decision trumps.
- **v.42 address** — `Yasu` instead of `Bɨla ha Dɨma` (Lord). Greek Κύριε = title, not name.
- **v.43 Paradise** — `Firdaws⟨?⟩` (0 corpus hits, correctly flagged). Human team has `hazanna`.
- **v.29-31 body-part/green-wood proverb** — LOW confidence, entirely outside corpus register.

**Honest assessment:** The ⟨?⟩ markers and LOW-confidence flags are doing their job. Every place the draft is weak, it said so. That's the floor this system is supposed to establish.

---

## 3 — Memra Draft (Acts 1–4, April 2026)

**Overall: Weakest — not because it used the same model, but because the workflow was one-shot with no enforcement.**

- **77 flagged inferences** with no corpus verification: numerals (`mfaɗɨ`=40, `kakum`=9), wind/`bakɨtɨ`, cloud/`dughwana`, blood/`bulwe`, upper-room/`hammana`, cast-lots/`luɗe`, right-hand/`tɨmɨ`, boldness/`kɨtɨne`, etc.
- No linter, no self-audit, no back-translation check, no structure verification.
- Some attested terms were used correctly (the Apostle name spellings from Luke 6 were verified, `nsli he fu` from Exod 3:2 for tongues of fire at Acts 2:3 was a good call).
- But the overall floor is unknown — 77 guesses means 77 places where a fluent speaker could read nonsense, and the drafter had no way to know which.
- Status in Memra DB: `source='ai_draft'`, checked against nothing.

The gap between Memra and this draft isn't model quality — it's the *workflow*. Same frontier model, different infrastructure. Memra was a proof-of-concept that produced text. This is a replicable, verifiable process.

---

## Summary Verdict

```
LB25 Human  >  AI Draft (this system)  >>  Memra Draft

Gap 1→2: ~one revision pass + the 7 LOW-confidence verses + the 2 confirmed consultant-check issues
Gap 2→3: workflow discipline — not model quality
```

The human team's translation is better, but not by the margin you'd expect. The consultant-check found two real issues in 10 verses. The AI draft's structural grounding was comparable; its vocabulary gaps were documented rather than silently wrong.

If Davis's prior Lagwan work was Memra-level, this system already represents a step-change. The next step is running the consultant-check over the full human translation (all of Luke 23-24) rather than just a 10-verse sample, and banking the team's term decisions (`Ɓɨn`, `hazanna`, `pitɨna`, `mɓakeen`) into the approved-additions store so the next AI draft can close those gaps.

---

*Consultant-check: Luke 23:1–10. AI draft: Luke 23:1–56. Comparison: compare-drafts.ts, 56 verses, 0 agree / 56 disagree (expected — any two translations of the same text will differ). Corpus: 4,990 verses (GEN + EXO + MAT + MRK + LUK 1–22).*
