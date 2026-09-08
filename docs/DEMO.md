# PRD Critic: 45-second demo

Open the page. The empty state lists the eight dimensions.

**0 to 10s.** Say: "Every PRD review I have sat in ends with 'needs work' and no line numbers. This scores a PRD on eight things and quotes the sentence that cost the point."

Click **a weak PRD**.

**10 to 25s.** Point at the score: 5 of 24, "Idea, not a PRD". Read the metric row aloud: the tool quotes "We expect engagement to go up" and says no number, no baseline, no target, vanity metric. Say: "That is the feedback a senior PM gives. It just gives it in one second."

**25 to 35s.** Click **a strong one**. 23 of 24. Say: "Same rubric. This one has a baseline, a target, four non-goals, ranked scope, three risks with a kill condition, and a phased rollout with owners. It loses one point for long sentences, which is fair."

**35 to 45s.** Click **Ask Claude to rewrite: Clarity** (or whichever dimension is weakest). Say: "The rewrite is not allowed to invent numbers; it writes [FILL] where a fact is missing. Then copy the whole critique as Markdown into the doc's comments."

If asked how it is built: one HTML file, one scoring module with tests, no backend. The scorer is regex heuristics on purpose: deterministic, explainable, instant. Claude is the optional second opinion, not the judge.
