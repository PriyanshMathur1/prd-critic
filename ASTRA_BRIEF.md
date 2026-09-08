# Astra Codex brief: PRD Critic v2

Paste this into Astra Codex from inside `projects/prd-critic`.

```
Read README.md, src/critic.js, tests/critic.test.js and index.html first. v1 works and all tests pass; do not change scoring semantics without adding a test that shows why.

BUILD (in this order, one commit each)
1. Diff view: a second "Paste the revised PRD" textarea (collapsed by default). When both are filled, show each dimension's score as before -> after with the evidence for both. Add tests.
2. Custom rubric: a settings drawer where the user can rename dimensions, edit the "ask" line, and set a weight (1 to 3). Persist in localStorage. Weighted total shown alongside the raw 0 to 24. Add tests for weighting math.
3. Inline annotations: highlight, inside the textarea's rendered preview, the sentence quoted in each evidence line. Click a dimension row to scroll to its sentence.

RULES
- Keep it one HTML file plus src/critic.js; run node scripts/sync.js after any scorer change; node --test must pass.
- Same visual system: off-white background, one accent (#8A3B12), 4px radius, Public Sans and Schibsted Grotesk. No new colours, no cards with icons, no gradients, no emoji, no em-dashes.
- Copy in plain English, short sentences.
- Mobile stacks; keyboard works; prefers-reduced-motion respected.

When done: list what changed, the new test count, and anything you could not verify.
```
