#!/usr/bin/env bun
/**
 * build-dossier.ts — render a translation dossier (JSON) into a self-contained
 * HTML translator WORKSPACE.
 *
 * Layout & levels (per Davis's UX feedback):
 *  - Left navigator: passage, progress (approved/total), Reading/Review, a
 *    "needs-attention" filter, and a clickable verse list with confidence dots.
 *  - Each verse: the PROPOSED draft front & center (editable, inline flags,
 *    option chips, click-to-fix popovers).
 *  - LEVEL 1 "Why" (decisions, options, questions, French source) — the reasoning
 *    the translator needs; this is what "expand all reasoning" opens.
 *  - LEVEL 2 "Checks" (model drafts, back-translation, council, corpus QC) — the
 *    verification machinery, demoted to a quieter, separate toggle, NOT opened by
 *    expand-all, so it's available but never in the way.
 *  - Approve per verse + "copy approved (USFM)" for Paratext handoff.
 *
 * Usage: bun tools/build-dossier.ts <dossier.json> [out.html]
 */
import { readFileSync, writeFileSync } from "fs";
import { tokenize } from "./lib/tokenize.ts";
import { loadProfile } from "./lib/profile.ts";

const profile = loadProfile();
const argv = process.argv.slice(2).filter((a, i, arr) => a !== "--profile" && arr[i - 1] !== "--profile");
const inPath = argv[0];
const outPath = argv[1] ?? inPath?.replace(/\.json$/, ".html");
if (!inPath) { console.error("usage: bun tools/build-dossier.ts <dossier.json> [out.html]"); process.exit(2); }

const data = JSON.parse(readFileSync(inPath, "utf8"));
const LEX = new Set<string>(Object.keys(JSON.parse(readFileSync(profile.paths.lexicon, "utf8")).words));
const LWC = profile.lwc[0] || "LWC";

const esc = (s: string) => (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const SUF = profile.suffixes.length ? `(${profile.suffixes.join("|")})` : null;
const deh = (s: string) => SUF ? s.replace(new RegExp(`-${SUF}\\b`, "gi"), "$1") : s;
// attested = every token of the (de-hyphenated) word is in the corpus lexicon. Unicode-aware.
const attested = (word: string) => { const r = tokenize(deh(word)); return r.length === 0 || r.every((x) => LEX.has(x)); };
const LEX_ARR = [...LEX];
function lev(a: string, b: string, max: number): number { if (Math.abs(a.length - b.length) > max) return max + 1; let p = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const c = [i]; let best = i; for (let j = 1; j <= b.length; j++) { const v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); c[j] = v; if (v < best) best = v; } if (best > max) return max + 1; p = c; } return p[b.length]; }
function nearest(w: string): string { if (w.length < 3) return ""; const h: [string, number][] = []; for (const c of LEX_ARR) { if (Math.abs(c.length - w.length) > 2) continue; const d = lev(w, c, 2); if (d <= 2) h.push([c, d]); } h.sort((a, b) => a[1] - b[1]); return h.slice(0, 3).map((x) => x[0]).join(" / "); }
const BORROWINGS: Record<string, string> = profile.borrowings;
const sugFor = (core: string) => { const toks = tokenize(deh(core)); const c = toks[0] ?? ""; return BORROWINGS[c] || nearest(c); };
const cleanText = (t: string) => t.replace(/⟨\?⟩/g, "").replace(/\{([^}]*)\}/g, (_, i) => i.split("⟂")[0].trim());

function render(text: string): string {
  return text.split(/(\{[^}]*\})/).map((seg) => {
    if (/^\{[^}]*\}$/.test(seg)) {
      const opts = seg.slice(1, -1).split("⟂").map((o) => o.trim());
      return `<span class="opt" title="options — click to cycle: ${esc(opts.join("  ·  "))}" data-opts="${esc(opts.join("|"))}">${esc(opts[0])}<sup class="oc">${opts.length}</sup></span>`;
    }
    return seg.split(/(\s+)/).map((tok) => {
      if (/^\s+$/.test(tok) || tok === "") return tok;
      const q = tok.includes("⟨?⟩"); const core = tok.replace(/⟨\?⟩/g, ""); const ok = attested(core);
      const at = ok ? "" : ` data-sug="${esc(sugFor(core))}" tabindex="0" title="not in corpus — click"`;
      return `<span class="${ok ? "w" : "w bad"}"${at}>${esc(core)}</span>${q ? '<sup class="q" title="model unsure">?</sup>' : ""}`;
    }).join("");
  }).join("");
}

const tc: Record<string, string> = { HIGH: "high", MEDIUM: "med", LOW: "low" };
const li = (arr: string[]) => arr.map((x) => `<li>${esc(x)}</li>`).join("");

function verseHtml(v: any, i: number): string {
  const tier = v.confidence?.tier || "MEDIUM";
  const dot = `<span class="dot ${tc[tier]}" title="confidence ${esc(tier)}: ${esc((v.confidence?.reasons || []).join('; '))}"></span>`;
  const drafts = (v.drafts || []).map((d: any) => `<div class="dcol"><div class="dh">${esc(d.model)}</div><div>${render(d.text)}</div>${d.argument ? `<div class="darg">${esc(d.argument)}</div>` : ""}</div>`).join("");
  const opts = (v.options || []).map((o: any) => `<li><b>${esc(o.label)}:</b> <span class="cz">${esc(o.text)}</span> <span class="warrant">— ${esc(o.warrant)}</span></li>`).join("");
  const btText = v.backtranslation ? (v.backtranslation.lwc ?? v.backtranslation.french) : "";
  const btSrc = v.backtranslation ? (v.backtranslation.source_lwc ?? v.backtranslation.source_french) : "";
  const bt = v.backtranslation ? `<div class="blk"><div class="bh">Back-translation → ${esc(LWC)}</div><div class="r"><span class="lbl">draft→${esc(LWC)}</span> <i>${esc(btText)}</i></div><div class="r"><span class="lbl">source</span> <i>${esc(btSrc)}</i></div>${v.backtranslation.verdict ? `<div class="bv">${esc(v.backtranslation.verdict)}</div>` : ""}</div>` : "";

  return `<section class="v" id="v${i}" data-tier="${esc(tier)}">
    <div class="vhead"><span class="vnum">${esc(v.ref)}</span>${dot}<span class="sp"></span>
      <button class="appr" onclick="appr(this)">approve</button>
      <button class="t why" onclick="tog(this,'ow')">why</button>
      <button class="t" onclick="tog(this,'oc')">checks</button></div>
    <div class="prend">${render(v.proposed || (v.drafts?.[0]?.text ?? ""))}</div>
    <div class="pedit" contenteditable="true" spellcheck="false">${esc(cleanText(v.proposed || (v.drafts?.[0]?.text ?? "")))}</div>
    <div class="note"><span class="nl">note / decision</span><div class="nb" contenteditable="true" spellcheck="false" data-ph="e.g. key term X → use Y; or a question to check later…"></div></div>
    <div class="why">
      ${v.decisions ? `<div class="blk"><div class="bh">Why this draft</div><ul>${li(v.decisions)}</ul></div>` : ""}
      ${opts ? `<div class="blk"><div class="bh">Options (your call)</div><ul class="ol">${opts}</ul></div>` : ""}
      ${v.questions ? `<div class="blk"><div class="bh">Questions to decide</div><ul>${li(v.questions)}</ul></div>` : ""}
      ${v.source ? `<div class="blk src"><div class="bh">${esc(LWC)} source</div><i>${esc(v.source.lwc ?? v.source.french_lsg)}</i>${v.source.issue ? `<div class="iss">${esc(v.source.issue)}</div>` : ""}</div>` : ""}
    </div>
    <div class="checks">
      <div class="chh">Checks &amp; verification</div>
      ${v.source?.hebrew_gloss ? `<div class="blk"><div class="bh">Hebrew gloss</div>${esc(v.source.hebrew_gloss)}</div>` : ""}
      ${drafts ? `<div class="blk"><div class="bh">Model drafts</div><div class="drafts">${drafts}</div></div>` : ""}
      ${bt}
      ${v.council ? `<div class="blk"><div class="bh">Council</div>${esc(v.council)}</div>` : ""}
      ${v.attestation_note ? `<div class="blk qc"><div class="bh">Corpus QC</div>${esc(v.attestation_note)}</div>` : ""}
      ${v.resources ? `<div class="blk"><div class="bh">Resources</div><ul>${li(v.resources)}</ul></div>` : ""}
    </div></section>`;
}

const verses = data.verses || [];
const body = verses.map(verseHtml).join("\n");
const navItems = verses.map((v: any, i: number) => `<li data-i="${i}" data-tier="${esc(v.confidence?.tier || 'MEDIUM')}" onclick="go(${i})"><span class="dot ${tc[v.confidence?.tier || 'MEDIUM']}"></span><span class="vl">${esc(v.ref)}</span><span class="ck">✓</span></li>`).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(data.passage)}</title>
<style>
 :root{--bg:#f4f3ef;--card:#fff;--ink:#1d2733;--mut:#717c8a;--line:#e7e4dd;--bad:#fde2e0;--accent:#34506b}
 *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif}
 .app{display:flex;min-height:100vh}
 .nav{width:264px;flex:0 0 264px;background:var(--card);border-right:1px solid var(--line);padding:16px 14px;position:sticky;top:0;height:100vh;overflow:auto}
 .nav h1{font-size:15px;margin:0 0 10px}
 .prog{font-size:12px;color:var(--mut);margin-bottom:10px}.bar{height:6px;background:#eee;border-radius:4px;overflow:hidden;margin-bottom:4px}.bar i{display:block;height:100%;width:0;background:#2e7d32;transition:width .2s}
 .controls{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;font-size:13px}
 .seg{display:inline-flex;border:1px solid #cdd6df;border-radius:7px;overflow:hidden;width:fit-content}.seg button{border:0;background:#fff;font:13px inherit;padding:4px 12px;cursor:pointer}.seg button.on{background:var(--accent);color:#fff}
 .controls button.b{border:1px solid #cdd6df;background:#f2f6fa;border-radius:7px;padding:4px 10px;cursor:pointer;font:13px inherit;text-align:left}
 .vlist{list-style:none;margin:6px 0 0;padding:0}
 .vlist li{display:flex;align-items:center;gap:7px;padding:6px 7px;border-radius:7px;cursor:pointer;font-size:13.5px}
 .vlist li:hover{background:#f1f5f9}.vlist .vl{flex:1}.vlist .ck{color:#2e7d32;opacity:0;font-weight:700}.vlist li.done .ck{opacity:1}
 main{flex:1;max-width:780px;margin:0 auto;padding:20px}
 .v{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:13px 17px;margin-bottom:13px}
 .vhead{display:flex;align-items:center;gap:9px;font-size:13px}.vnum{font-weight:700;color:var(--accent)}.sp{flex:1}
 .dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:0 0 10px}.dot.high{background:#2e7d32}.dot.med{background:#c79a1e}.dot.low{background:#c0392b}
 .t{border:1px solid #cdd6df;background:#fff;border-radius:6px;font:12px inherit;padding:3px 9px;cursor:pointer;color:var(--accent)}
 .appr{border:1px solid #b7d4bf;background:#fff;color:#256135;border-radius:6px;font:12px inherit;padding:3px 11px;cursor:pointer}
 .v.done{box-shadow:inset 4px 0 0 #2e7d32}.v.done .appr{background:#2e7d32;color:#fff;border-color:#2e7d32}
 .prend{font-size:19px;line-height:1.75;margin:9px 0 5px}
 .pedit{font-size:18px;line-height:1.7;border:1px dashed #cdd6df;border-radius:8px;padding:8px 12px;background:#fcfbf9;margin-top:5px}.pedit:focus{outline:2px solid #9cc0ea;background:#fff}
 .note{margin-top:7px;display:flex;gap:8px;align-items:flex-start}.nl{font-size:10px;text-transform:uppercase;letter-spacing:.4px;color:var(--mut);padding-top:6px;flex:0 0 72px}
 .nb{flex:1;min-height:28px;border:1px solid var(--line);border-radius:7px;padding:5px 9px;font-size:14px;background:#fffdf7}.nb:empty:before{content:attr(data-ph);color:#b6bcc4}.nb:focus{outline:2px solid #9cc0ea}
 .w.bad{background:var(--bad);border-radius:3px;padding:0 2px;box-shadow:inset 0 -2px 0 #e57373;cursor:pointer}
 sup.q{color:#b8860b;font-weight:700;cursor:help}sup.oc{color:#3b6ea5;font-size:10px}
 .opt{background:#eaf2fb;border:1px solid #cfe0f2;border-radius:6px;padding:0 6px;cursor:pointer}
 .why,.checks{display:none}.v.ow .why{display:block}.v.oc .checks{display:block}
 .why{margin-top:11px;border-top:1px solid var(--line);padding-top:9px}
 .blk{margin:9px 0}.bh{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--accent);font-weight:700;margin-bottom:3px}
 .ol li,.blk li{margin:3px 0}ul{margin:4px 0 4px 2px;padding-left:18px}.cz{font-weight:600}.warrant{color:var(--mut);font-size:13px}
 .src .iss{color:var(--mut);font-size:13px;margin-top:3px}
 /* level 2 — quieter */
 .checks{margin-top:10px;background:#faf9f6;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-size:13.5px;color:#46505c}
 .chh{font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--mut);font-weight:700;margin-bottom:6px}
 .drafts{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px}
 .dcol{border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:#fff;font-size:14.5px}.dh{font-size:10.5px;font-weight:700;text-transform:uppercase;color:var(--accent);margin-bottom:4px}.darg{margin-top:5px;color:var(--mut);font-size:12px;font-style:italic}
 .r{margin:2px 0}.lbl{display:inline-block;min-width:64px;color:var(--mut);font-size:11px;text-transform:uppercase}.bv{margin-top:5px;font-weight:600;color:#256135}.qc{background:#fff8e6;border:1px solid #f0e2b8;border-radius:7px;padding:7px 9px}
 .pop{position:absolute;z-index:40;background:#22303f;color:#fff;border-radius:8px;padding:9px 11px;font-size:13px;max-width:280px;box-shadow:0 6px 18px rgba(0,0,0,.28)}.pop .ph{color:#ffd9d6;font-weight:700}.pop button{margin-top:7px;font:12px inherit;background:#3b6ea5;color:#fff;border:0;border-radius:5px;padding:3px 10px;cursor:pointer}
 body.reading .pedit,body.reading .why,body.reading .checks,body.reading .vhead .t,body.reading .vhead .appr{display:none}
 body.reading .v{padding:8px 17px;margin-bottom:5px}body.reading .prend{margin:2px 0}
 body.filt .v[data-tier="HIGH"].done{display:none}
</style></head>
<body class="review">
<div class="app">
 <aside class="nav">
  <h1>${esc(data.passage)}</h1>
  <div class="prog"><div class="bar"><i id="bar"></i></div><span id="pc">0 / ${verses.length} approved</span></div>
  <div class="controls">
   <span class="seg"><button id="bR" onclick="mode('reading')">Reading</button><button id="bV" class="on" onclick="mode('review')">Review</button></span>
   <label><input type="checkbox" id="filt" onchange="document.body.classList.toggle('filt',this.checked)"> needs-attention only</label>
   <button class="b" onclick="allWhy()">expand all reasoning</button>
   <button class="b" onclick="copyA()">copy approved (USFM)</button>
   <button class="b" onclick="exportD()">export decisions (JSON)</button>
  </div>
  <ul class="vlist" id="vlist">${navItems}</ul>
 </aside>
 <main>${body}</main>
</div>
<script>
 function tog(b,c){b.closest('.v').classList.toggle(c);b.classList.toggle('on')}
 function go(i){document.getElementById('v'+i).scrollIntoView({behavior:'smooth',block:'start'})}
 function mode(m){document.body.className=m;document.getElementById('bR').classList.toggle('on',m==='reading');document.getElementById('bV').classList.toggle('on',m==='review')}
 function allWhy(){const any=[...document.querySelectorAll('.v')].some(v=>!v.classList.contains('ow'));document.querySelectorAll('.v').forEach(v=>v.classList.toggle('ow',any))}
 function appr(b){const v=b.closest('.v');v.classList.toggle('done');const i=[...document.querySelectorAll('main .v')].indexOf(v);document.querySelector('.vlist li[data-i="'+i+'"]').classList.toggle('done',v.classList.contains('done'));prog()}
 function prog(){const t=document.querySelectorAll('main .v').length,d=document.querySelectorAll('main .v.done').length;document.getElementById('pc').textContent=d+' / '+t+' approved';document.getElementById('bar').style.width=(t?d/t*100:0)+'%'}
 document.querySelectorAll('.opt').forEach(o=>{let i=0;const a=o.dataset.opts.split('|');o.addEventListener('click',e=>{e.stopPropagation();const prev=o.firstChild.textContent;i=(i+1)%a.length;const nx=a[i];o.firstChild.textContent=nx;const pe=o.closest('.v').querySelector('.pedit');if(pe&&prev)pe.innerText=pe.innerText.replace(prev,nx)})});
 function exportD(){const out=[...document.querySelectorAll('main .v')].map(v=>({ref:v.querySelector('.vnum').textContent,approved:v.classList.contains('done'),final:v.querySelector('.pedit').innerText.trim(),note:v.querySelector('.nb').innerText.trim()})).filter(d=>d.approved||d.note);navigator.clipboard.writeText(JSON.stringify(out,null,2));alert('Decisions for '+out.length+' verse(s) copied as JSON — feed to: bun tools/ingest-decisions.ts <file>')}
 let pop;document.addEventListener('click',e=>{if(pop){pop.remove();pop=null}const t=e.target.closest('.w.bad');if(!t)return;e.stopPropagation();const s=t.dataset.sug||'';pop=document.createElement('div');pop.className='pop';pop.innerHTML='<div class="ph">not in corpus</div>'+(s?('<div>try: '+s+'</div><button>use “'+s.split(' / ')[0].split(' ')[0]+'”</button>'):'<div>verify with a speaker</div>');document.body.appendChild(pop);const r=t.getBoundingClientRect();pop.style.left=(scrollX+r.left)+'px';pop.style.top=(scrollY+r.bottom+5)+'px';const b=pop.querySelector('button');if(b)b.onclick=ev=>{ev.stopPropagation();t.textContent=s.split(' / ')[0].split(' ')[0];t.classList.remove('bad');pop.remove();pop=null}});
 function copyA(){let o=[];document.querySelectorAll('main .v.done').forEach(v=>{o.push('\\\\v '+(v.querySelector('.vnum').textContent.match(/(\\d+)\\s*$/)||[''])[1]+' '+v.querySelector('.pedit').innerText.trim())});navigator.clipboard.writeText(o.join('\\n'));alert(o.length+' approved verse(s) copied as USFM.')}
</script></body></html>`;

writeFileSync(outPath, html);
console.log(`✓ wrote ${outPath} (${(html.length / 1024).toFixed(1)} KB, ${verses.length} verse(s))`);
