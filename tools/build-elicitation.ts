#!/usr/bin/env bun
/**
 * build-elicitation.ts — render an elicitation question set to a self-contained
 * interactive HTML page the team answers directly (phone or laptop, offline).
 *
 * The session JSON (generated per elicitation/elicitation-prompt.md):
 * {
 *   "language": "Lagwan", "lwc": "French", "date": "2026-07-06",
 *   "focus": "poetic register before drafting Psalms",
 *   "items": [
 *     { "id": "Q1", "type": "question",   "question": "...in the LWC...",
 *       "teaches": "word for 'lament'", "proposed": "optional guess to confirm" },
 *     { "id": "Q2", "type": "micro-text", "question": "Tell a short lament ...",
 *       "teaches": "poetic parallelism" }
 *   ]
 * }
 *
 * Output: one HTML file. Answers stay in the browser until the team clicks
 * "Download answers" → a markdown field-notes file ready to save under
 * sources/<iso>/field-notes/ and register as grade-A data (register-source.ts).
 *
 * Usage: bun tools/build-elicitation.ts <session.json> [--out <file.html>]
 */
import { readFileSync, writeFileSync } from "fs";

const argv = process.argv.slice(2);
const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const files = argv.filter((a, i) => !a.startsWith("--") && !["--out", "--profile"].includes(argv[i - 1]));
if (files.length !== 1) {
  console.error("usage: bun tools/build-elicitation.ts <session.json> [--out <file.html>]");
  process.exit(2);
}

const s = JSON.parse(readFileSync(files[0], "utf8"));
const items: any[] = s.items ?? [];
if (!items.length) { console.error("✗ session has no items[]"); process.exit(2); }

const escapeHtml = (x: string) =>
  String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const itemHtml = items
  .map((it, i) => {
    const micro = it.type === "micro-text";
    return `
  <div class="card" data-id="${escapeHtml(it.id ?? `Q${i + 1}`)}">
    <div class="qhead"><span class="qid">${escapeHtml(it.id ?? `Q${i + 1}`)}</span>
      <span class="tag ${micro ? "micro" : ""}">${micro ? "micro-text" : "question"}</span>
      ${it.teaches ? `<span class="teaches">→ ${escapeHtml(it.teaches)}</span>` : ""}</div>
    <p class="q">${escapeHtml(it.question)}</p>
    ${it.proposed ? `<p class="proposed">Guess to confirm (may be wrong): <b>${escapeHtml(it.proposed)}</b></p>` : ""}
    <textarea rows="${micro ? 6 : 3}" placeholder="${micro ? "…" : "…"}"></textarea>
    <label class="skip"><input type="checkbox" class="skipbox"> skip / doesn't apply</label>
  </div>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Elicitation — ${escapeHtml(s.language ?? "")} ${escapeHtml(s.date ?? "")}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, sans-serif; max-width: 46rem; margin: 0 auto; padding: 1rem; line-height: 1.5; }
  h1 { font-size: 1.3rem; } .meta { opacity: .75; margin-bottom: 1.2rem; }
  .card { border: 1px solid color-mix(in srgb, currentColor 25%, transparent); border-radius: 10px; padding: .9rem 1rem; margin: .8rem 0; }
  .qhead { display: flex; gap: .6rem; align-items: baseline; flex-wrap: wrap; margin-bottom: .3rem; }
  .qid { font-weight: 700; }
  .tag { font-size: .75rem; border: 1px solid currentColor; border-radius: 999px; padding: 0 .5rem; opacity: .7; }
  .tag.micro { font-style: italic; }
  .teaches { font-size: .8rem; opacity: .6; }
  .q { margin: .3rem 0 .5rem; }
  .proposed { font-size: .85rem; opacity: .8; margin: .2rem 0 .5rem; }
  textarea { width: 100%; box-sizing: border-box; font: inherit; padding: .5rem; border-radius: 8px; }
  .skip { font-size: .8rem; opacity: .7; display: block; margin-top: .3rem; }
  .done .card:not(.answered):not(.skipped) { outline: 2px solid #d97706; }
  .actions { position: sticky; bottom: 0; background: Canvas; padding: .8rem 0; display: flex; gap: .8rem; align-items: center; border-top: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
  button { font: inherit; padding: .55rem 1.1rem; border-radius: 8px; cursor: pointer; }
  #status { font-size: .85rem; opacity: .75; }
</style>
</head>
<body>
<h1>Elicitation session — ${escapeHtml(s.language ?? "")}</h1>
<p class="meta">${escapeHtml(s.date ?? "")}${s.focus ? " · " + escapeHtml(s.focus) : ""} · ${items.length} items ·
answers stay on this device until you download them</p>
${itemHtml}
<div class="actions">
  <button id="dl">Download answers (.md)</button>
  <span id="status"></span>
</div>
<script>
const cards = [...document.querySelectorAll('.card')];
function refresh() {
  let n = 0;
  for (const c of cards) {
    const a = c.querySelector('textarea').value.trim();
    const sk = c.querySelector('.skipbox').checked;
    c.classList.toggle('answered', !!a);
    c.classList.toggle('skipped', sk);
    if (a || sk) n++;
  }
  document.getElementById('status').textContent = n + '/' + cards.length + ' answered';
  return n;
}
document.addEventListener('input', refresh); refresh();
document.getElementById('dl').addEventListener('click', () => {
  document.body.classList.add('done');
  const lines = ['# Elicitation answers — ${escapeHtml(s.language ?? "")} — ${escapeHtml(s.date ?? "")}', ''];
  lines.push('> Save under sources/<iso>/field-notes/ and register: bun tools/register-source.ts --file <this file> --type field-notes --grade A --title "Elicitation ${escapeHtml(s.date ?? "")}"', '');
  for (const c of cards) {
    const id = c.dataset.id;
    const q = c.querySelector('.q').textContent;
    const teaches = c.querySelector('.teaches');
    const a = c.querySelector('textarea').value.trim();
    const sk = c.querySelector('.skipbox').checked;
    lines.push('## ' + id + (teaches ? '  (' + teaches.textContent.replace('→ ','') + ')' : ''));
    lines.push('Q: ' + q);
    lines.push('A: ' + (sk ? '(skipped / does not apply)' : (a || '(unanswered)')));
    lines.push('');
  }
  const blob = new Blob([lines.join('\\n')], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'elicitation-${escapeHtml((s.language ?? "lang").toLowerCase())}-${escapeHtml(s.date ?? "session")}.md';
  a.click();
});
</script>
</body></html>`;

const outPath = get("--out") ?? files[0].replace(/\.json$/, "") + ".html";
writeFileSync(outPath, html);
console.log(`✓ ${items.length} item(s) → ${outPath}`);
console.log(`Open it in any browser (works offline / on a phone). Answers download as a markdown`);
console.log(`field-notes file — save under sources/<iso>/field-notes/ and register as grade A.`);
