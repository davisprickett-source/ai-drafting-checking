#!/usr/bin/env bun
/**
 * build-notes.ts — render consultant-check notes (from the workflow output) into
 * a clean markdown + interactive HTML document: per verse, the published text,
 * then each CONNOT note with the phrase bolded in context, the source, proposed
 * proposed renderings, and the discussion questions. No inference — pure rendering.
 *
 * Usage: bun tools/build-notes.ts <notes.json> [out-basename]
 *   <notes.json> = the workflow result file ({result:[...]}) or a plain array.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const args = process.argv.slice(2);
const titleI = args.indexOf("--title");
const title = titleI >= 0 ? args[titleI + 1] : null;
const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--title");
const inPath = positional[0];
const outBase = positional[1] ?? inPath?.replace(/\.(json|output)$/, "");
if (!inPath) { console.error("usage: bun tools/build-notes.ts <notes.json> [out-basename] [--title \"...\"]"); process.exit(2); }

const raw = JSON.parse(readFileSync(inPath, "utf8"));
const verses: any[] = (raw.result ?? raw).filter(Boolean);
const docTitle = title ?? raw.passage ?? "Consultant Notes";
// target-language verse text — accept several field names across schemas
const tgt = (v: any) => v.target ?? v.chadian ?? v.local ?? "";
const sevRank: Record<string, number> = { "must-fix": 0, discuss: 1, minor: 2 };
const esc = (s: string) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const bold = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>');

let total = 0, mustfix = 0;
// ---- markdown ----
let md = `# ${docTitle} (AI-assisted review)\n\n> CONNOT-tagged. Each note: the phrase in context (**bold**), the issue, what the source says, proposed renderings, and what to decide. Renderings are candidates for the team, not impositions.\n\n`;
for (const v of verses) {
  const notes = (v.notes ?? []).slice().sort((a: any, b: any) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
  md += `## ${v.ref}\n_${tgt(v)}_\n\n`;
  if (!notes.length) { md += `✓ no notes raised.\n\n`; continue; }
  for (const n of notes) {
    total++; if (n.severity === "must-fix") mustfix++;
    md += `### ${n.category} ${n.code} · ${n.severity}\n`;
    md += `- **context:** ${n.context}\n- **issue:** ${n.issue}\n`;
    if (n.source) md += `- **source:** ${n.source}\n`;
    if (n.renderings?.length) { md += `- **proposed renderings:**\n`; for (const r of n.renderings) md += `    - \`${r.text}\` — ${r.rationale ?? ""}\n`; }
    md += `- **discuss:** ${n.discuss}\n\n`;
  }
}
mkdirSync(dirname(outBase + ".md"), { recursive: true });
writeFileSync(outBase + ".md", md);

// ---- HTML ----
const sevColor: Record<string, string> = { "must-fix": "#c0392b", discuss: "#b8860b", minor: "#6b7785" };
const vhtml = verses.map((v) => {
  const notes = (v.notes ?? []).slice().sort((a: any, b: any) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
  const ns = notes.length
    ? notes.map((n: any) => `
      <div class="note">
        <div class="nh"><span class="cat">${esc(n.category)} ${esc(n.code)}</span><span class="sev" style="background:${sevColor[n.severity] || "#777"}">${esc(n.severity)}</span></div>
        <div class="ctx">${bold(n.context)}</div>
        <div class="row"><span class="lbl">issue</span> ${esc(n.issue)}</div>
        ${n.source ? `<div class="row"><span class="lbl">source</span> ${esc(n.source)}</div>` : ""}
        ${n.renderings?.length ? `<div class="row"><span class="lbl">proposed</span><div class="rends">${n.renderings.map((r: any) => `<div class="rend"><code>${esc(r.text)}</code> <span class="rat">${esc(r.rationale || "")}</span></div>`).join("")}</div></div>` : ""}
        <div class="row disc"><span class="lbl">discuss</span> ${esc(n.discuss)}</div>
      </div>`).join("")
    : `<div class="clean">✓ no notes raised</div>`;
  return `<section class="v"><div class="vh">${esc(v.ref)}</div><div class="pub">${esc(tgt(v))}</div>${ns}</section>`;
}).join("\n");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(docTitle)} — Consultant Notes</title>
<style>
 body{margin:0;background:#f4f3ef;color:#1d2733;font:16px/1.55 -apple-system,Segoe UI,Roboto,sans-serif}
 header{background:#fff;border-bottom:1px solid #e7e4dd;padding:16px 22px}header h1{margin:0;font-size:18px}header .s{color:#717c8a;font-size:13px;margin-top:3px}
 main{max-width:860px;margin:0 auto;padding:18px}
 .v{background:#fff;border:1px solid #e7e4dd;border-radius:11px;padding:14px 18px;margin-bottom:14px}
 .vh{font-weight:700;color:#34506b;font-size:14px}.pub{font-size:17px;margin:7px 0 4px;line-height:1.7}
 .note{border-top:1px solid #eee;margin-top:11px;padding-top:10px}
 .nh{display:flex;gap:9px;align-items:center;margin-bottom:6px}.cat{font-size:12px;font-weight:700;color:#34506b;text-transform:uppercase;letter-spacing:.3px}
 .sev{color:#fff;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px}
 .ctx{font-size:16.5px;background:#faf9f6;border:1px solid #eee;border-radius:8px;padding:8px 11px;line-height:1.7}.hl{background:#fff2b8;padding:0 3px;border-radius:3px}
 .row{margin:7px 0;font-size:14.5px}.lbl{display:inline-block;min-width:74px;color:#717c8a;font-size:11px;text-transform:uppercase;letter-spacing:.4px;vertical-align:top}
 .rends{display:inline-block;width:calc(100% - 80px)}.rend{margin:3px 0}.rend code{background:#eef4fb;border:1px solid #cfe0f2;border-radius:6px;padding:1px 7px;font-size:15px}.rat{color:#717c8a;font-size:13px}
 .disc{color:#256135}.disc .lbl{color:#256135}
 .clean{color:#2e7d32;font-size:14px;margin-top:8px}
</style></head><body>
<header><h1>${esc(docTitle)} — Consultant Notes</h1><div class="s">${total} notes (${mustfix} must-fix) across ${verses.length} verses · AI-assisted, CONNOT-tagged · renderings are candidates for the team</div></header>
<main>${vhtml}</main></body></html>`;
writeFileSync(outBase + ".html", html);

console.log(`✓ ${verses.length} verses, ${total} notes (${mustfix} must-fix)`);
console.log(`  wrote ${outBase}.md`);
console.log(`  wrote ${outBase}.html`);
