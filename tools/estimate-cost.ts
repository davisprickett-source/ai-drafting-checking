#!/usr/bin/env bun
/**
 * estimate-cost.ts — see what a run will cost BEFORE you launch it.
 *
 * Model-agnostic: reads `models.json` (the active roster + tier->role mix) so the
 * numbers reflect YOUR models, not a hardcoded Claude lineup. Roles are abstract
 * (workhorse / deep / independent); cost_unit is the relative per-agent output-price
 * weight you set per model. See MODELS.md.
 *
 * Usage:
 *   bun tools/estimate-cost.ts <verses>
 *   bun tools/estimate-cost.ts <verses> --roster gemini-only
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = new URL("../", import.meta.url).pathname;
const argv = process.argv.slice(2);
let N = 0, rosterOverride: string | null = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--roster") rosterOverride = argv[++i];
  else if (!N) N = parseInt(argv[i], 10) || 0;
}
if (!N) { console.error("usage: bun tools/estimate-cost.ts <verse-count> [--roster <name>]"); process.exit(2); }

const TOK = 30000; // ~tokens per agent (observed)

// ---- load roster config (graceful fallback if models.json is absent) ----
type Entry = { provider: string; model: string; capability: string; cost_unit: number; invoke: string };
type Cfg = { active_roster: string; rosters: Record<string, Record<string, Entry>>; tiers: Record<string, { role: string; count: number }[]> };

const cfgPath = join(ROOT, "models.json");
let cfg: Cfg | null = null;
if (existsSync(cfgPath)) { try { cfg = JSON.parse(readFileSync(cfgPath, "utf8")); } catch (e) { console.error(`! could not parse models.json (${(e as Error).message}); using built-in defaults`); } }

// built-in fallback mirrors the documented Claude roster + tiers
const FALLBACK: Cfg = {
  active_roster: "claude",
  rosters: { claude: {
    workhorse:   { provider: "anthropic", model: "sonnet", capability: "mid",  cost_unit: 1, invoke: "subagent" },
    deep:        { provider: "anthropic", model: "opus",   capability: "high", cost_unit: 5, invoke: "subagent" },
    independent: { provider: "google",    model: "gemini", capability: "high", cost_unit: 3, invoke: "cli" },
  } },
  tiers: {
    "L1":   [{ role: "workhorse", count: 1 }],
    "L1.5": [{ role: "workhorse", count: 1 }],
    "L2":   [{ role: "workhorse", count: 3 }],
    "L3":   [{ role: "deep", count: 2 }, { role: "workhorse", count: 1 }, { role: "independent", count: 1 }],
  },
};
cfg = cfg ?? FALLBACK;

const rosterName = rosterOverride ?? cfg.active_roster;
const roster = cfg.rosters[rosterName];
if (!roster) { console.error(`✗ roster "${rosterName}" not found in models.json (have: ${Object.keys(cfg.rosters).join(", ")})`); process.exit(1); }

const note: Record<string, string> = {
  "L1": "solo workhorse + the FREE verifier — cheapest AI tier",
  "L1.5": "solo workhorse + FREE verify-revise loop — best value (near-council quality, ~2 cheap agents)",
  "L2": "lean council (workhorse x3) + back-translation",
  "L3": "deep: strong models + independent vendor + deep-analysis lenses — only for hard/flagged verses",
};

console.log(`\nEstimate for ${N} verses · roster "${rosterName}"`);
console.log(`roles: ` + Object.entries(roster).map(([r, e]) => `${r}=${e.provider}:${e.model}(${e.cost_unit}u)`).join("  ") + `\n`);
console.log("tier".padEnd(8) + "agents".padStart(8) + "~tokens".padStart(12) + "cost-units".padStart(12) + "   notes");
console.log("-".repeat(92));
console.log("L0".padEnd(8) + String(0).padStart(8) + "0".padStart(12) + "0".padStart(12) + "   FREE — verifier, grep-corpus, find-structures, rendering. Always run first.");
for (const [tier, mix] of Object.entries(cfg.tiers)) {
  let agents = 0, units = 0, missing = "";
  for (const { role, count } of mix) {
    const e = roster[role];
    if (!e) { missing = ` (role "${role}" undefined in roster)`; continue; }
    agents += count * N;
    units += count * e.cost_unit * N;
  }
  const tokens = agents * TOK;
  console.log(tier.padEnd(8) + String(agents).padStart(8) + ((tokens / 1e6).toFixed(2) + "M").padStart(12) + String(units).padStart(12) + "   " + (note[tier] ?? "") + missing);
}
console.log(`\ncost-units = relative spend from each model's cost_unit in models.json (set Sonnet=1 as baseline).`);
console.log(`L0 (verifier, grep-corpus, find-structures, find-parallels, build-dossier) costs ZERO inference — use it freely.`);
console.log(`Switch vendors: edit active_roster in models.json, or pass --roster <name>. Tip: draft in 3-5 verse batches.\n`);
