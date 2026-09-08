# PRD Critic: paste a PRD, get the sentence that lost you the point

> A reviewer for product requirements documents. Eight dimensions, three points each, and for every point lost it quotes the exact sentence responsible. Optionally asks Claude to rewrite the weakest section without inventing facts.

**Status:** v1, working · **Owner:** Priyansh Mathur · **Live:** https://claude.ai/code/artifact/36a31848-1fc0-4ab5-aed9-15939556249a (preview; move to prdcritic.priyanshmathur.com on Cloudflare Pages)

## How to run

No build step, no dependencies.

- **Use it:** open `index.html`. The scorer runs entirely in the browser. The "Ask Claude" button appears only where the page is hosted with that capability (the live link above); the file works without it.
- **Test it:** `node --test` (Node 20+). Eight tests cover section detection, the two example PRDs, every dimension's contract, and that `index.html` carries an in-sync copy of the scorer.
- **Edit the scorer:** change `src/critic.js`, then `node scripts/sync.js`. The test suite fails if the copy inside `index.html` drifts.
- **Examples:** `examples/weak.md` (scores 5 of 24) and `examples/strong.md` (23 of 24). Both are built into the page as one-click demos.

## 1. Problem

Most PRDs fail in the same eight places, and reviewers say "this needs work" without pointing at the line. The writer gets a vibe, not a fix. Engineering gets a document that cannot answer their first five questions, and the estimate becomes a guess.

## 2. Users

- **Primary:** product managers with 0 to 4 years of experience, before they send a PRD to their lead or to engineering.
- **Secondary:** engineering leads who want a fast, consistent first pass before a review meeting; PM interviewers grading take-home PRDs.

## 3. Job to be done

"When I have a draft PRD and no senior PM free to read it, tell me exactly which sentences are weak and show me a stronger version, so I walk into review with the obvious gaps already closed."

## 4. Success metric

- North star: PRDs re-scored at least once in the same session (the writer fixed something and came back). Target 40% of sessions with a paste.
- Leading: median time from paste to first score under 5 seconds (it is instant); Claude rewrite requested in at least 25% of scored sessions.
- Ignored: page views, total pastes.

## 5. Scope (v1)

| Must | Should | Won't (v1) |
|---|---|---|
| Deterministic 0 to 24 score across problem, user, metric, non-goals, scope, risks, rollout, clarity | Claude rewrite of the weakest section, streamed, with [FILL] markers instead of invented facts | Accounts, saved history |
| Evidence per dimension that quotes the document | Copy critique as Markdown (with the rewrite if requested) | Google Docs or Notion import |
| Two built-in example PRDs so the demo works in one click | Keyboard shortcut (Ctrl or Cmd + Enter) | Team templates, custom rubrics |
| Works from `file://`, no backend, nothing leaves the browser unless Claude is asked | | Scoring in languages other than English |

## 6. How it works

1. `splitSections` finds headings (Markdown or plain "Title:" lines) and ignores tier labels like "Must:" so a ranked scope list stays inside its section.
2. Each `score*` function looks for its section by priority (for example `metric`, then `success`, then `kpi`), and falls back to the whole document. It returns `{score, evidence}` where evidence quotes the document.
3. `scoreClarity` counts sentences over 30 words, a fixed list of buzzwords and hedges, and the passive-voice ratio.
4. The grade bands are: 21+ decision-ready, 15 to 20 needs one more pass, 9 to 14 not ready for engineering, under 9 an idea, not a PRD.
5. The Claude step sends the PRD plus the scorecard and asks for four fixed headings: verdict, rewrite of the weakest section, three fixes with replacement sentences, five questions an engineer will ask.

## 7. Non-goals

Not a writing assistant, not a template library, not a scoring API. It ends when the writer knows which sentences to fix.

## 8. Risks

- Regex heuristics misread unusual layouts. Mitigation: every dimension falls back to full-document search, the evidence line makes any misread visible, and the section count is shown.
- False confidence in the number. Mitigation: the UI says the number is not the point, and the weakest dimension is highlighted for action.
- Claude invents metrics in a rewrite. Mitigation: the prompt requires `[FILL: what is needed]` placeholders and forbids new numbers.

## 9. Resume line (draft)

> Built PRD Critic, a browser-based reviewer that scores requirement docs on eight dimensions with sentence-level evidence and a Claude-drafted rewrite; used to review [N] PRDs at [company/community].

## 10. Repo layout

```
prd-critic/
  README.md            this PRD and how to run
  index.html           single-file app (inlines src/critic.js between markers)
  src/critic.js        scoring logic, pure functions, unit-tested
  scripts/sync.js      copies critic.js into index.html
  tests/critic.test.js node:test suite
  examples/weak.md     scores 5 of 24
  examples/strong.md   scores 23 of 24
  docs/DEMO.md         45-second demo script
```

## 11. Not built in v1 (ideas for v2)

- Diff view: paste the revised PRD and see which dimensions moved.
- Custom rubric: teams edit the eight dimensions and their weights.
- Reviewer mode: annotate the PRD inline instead of a separate table.
