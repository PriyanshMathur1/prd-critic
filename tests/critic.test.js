import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { critique, toMarkdown, splitSections, scoreClarity, DIMENSIONS } from "../src/critic.js";

const weak = readFileSync(new URL("../examples/weak.md", import.meta.url), "utf8");
const strong = readFileSync(new URL("../examples/strong.md", import.meta.url), "utf8");

test("splitSections finds markdown headings", () => {
  const s = splitSections(strong).map((x) => x.title);
  assert.ok(s.includes("Problem"));
  assert.ok(s.includes("Non-goals"));
  assert.ok(s.includes("Rollout"));
});

test("strong PRD scores decision-ready", () => {
  const r = critique(strong);
  assert.ok(r.total >= 20, `expected >= 20, got ${r.total}: ${JSON.stringify(r.dimensions.map((d) => [d.id, d.score]))}`);
  assert.equal(r.grade, "Decision-ready");
  for (const d of r.dimensions) assert.ok(d.score >= 2, `${d.id} scored ${d.score}: ${d.evidence}`);
});

test("weak PRD scores low and names what is missing", () => {
  const r = critique(weak);
  assert.ok(r.total <= 9, `expected <= 9, got ${r.total}: ${JSON.stringify(r.dimensions.map((d) => [d.id, d.score]))}`);
  const byId = Object.fromEntries(r.dimensions.map((d) => [d.id, d]));
  assert.equal(byId.nongoals.score, 0);
  assert.ok(byId.metric.score <= 1, byId.metric.evidence);
  assert.ok(byId.user.evidence.includes("everyone") || byId.user.score <= 1, byId.user.evidence);
  assert.ok(byId.clarity.stats.buzz.length >= 3, byId.clarity.evidence);
  assert.ok(r.summary.toLowerCase().includes("missing"));
});

test("every dimension returns evidence and a 0..3 score", () => {
  for (const text of [weak, strong]) {
    const r = critique(text);
    assert.equal(r.dimensions.length, DIMENSIONS.length);
    for (const d of r.dimensions) {
      assert.ok(d.score >= 0 && d.score <= 3);
      assert.ok(typeof d.evidence === "string" && d.evidence.length > 10, d.id);
    }
  }
});

test("short input is rejected gracefully", () => {
  const r = critique("Build a thing.");
  assert.equal(r.grade, "Too short");
  assert.equal(r.dimensions.length, 0);
});

test("clarity catches buzzwords, hedges and long sentences", () => {
  const r = scoreClarity("We will leverage a seamless, robust and world-class platform to empower users, etc. " + "word ".repeat(40) + "end.");
  assert.ok(r.stats.buzz.length >= 3);
  assert.ok(r.stats.hedges.includes("etc"));
  assert.ok(r.score <= 1);
});

test("markdown export has a table row per dimension", () => {
  const md = toMarkdown(critique(strong));
  assert.equal((md.match(/^\| /gm) || []).length, DIMENSIONS.length + 1);
  assert.ok(md.includes("Decision-ready"));
});

test("index.html carries an in-sync copy of critic.js", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const src = readFileSync(new URL("../src/critic.js", import.meta.url), "utf8").replace(/^export /gm, "");
  const start = html.indexOf("/* critic.js start */");
  const end = html.indexOf("/* critic.js end */");
  assert.ok(start > 0 && end > start, "markers missing in index.html");
  assert.equal(html.slice(start + "/* critic.js start */".length, end).trim(), src.trim(), "run node scripts/sync.js");
});
