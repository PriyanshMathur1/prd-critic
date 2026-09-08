// PRD Critic: deterministic scoring of a product requirements document.
// Pure functions, no dependencies. index.html inlines a copy; keep them in sync (node scripts/sync.js).
//
// Eight dimensions, each 0..3 with evidence. The point is not the number; it is the
// evidence line, which quotes the sentence that earned or lost the points.

export const DIMENSIONS = [
  { id: "problem", name: "Problem", ask: "Who is stuck, doing what, and why it matters." },
  { id: "user", name: "Target user", ask: "A specific segment, not 'users'." },
  { id: "metric", name: "Success metric", ask: "A number with a baseline and a target." },
  { id: "nongoals", name: "Non-goals", ask: "What this explicitly will not do." },
  { id: "scope", name: "Scope", ask: "Requirements ranked: must, should, later." },
  { id: "risks", name: "Risks and assumptions", ask: "What could make this wrong, and how you would know." },
  { id: "rollout", name: "Rollout", ask: "How it ships: phases, flags, who sees it first." },
  { id: "clarity", name: "Clarity", ask: "Short sentences, concrete words, few hedges." },
];

export const BUZZWORDS = [
  "leverage", "synergy", "seamless", "seamlessly", "robust", "best-in-class", "cutting-edge", "world-class",
  "delight", "delightful", "empower", "revolutionary", "next-generation", "holistic", "frictionless",
  "scalable", "innovative", "state-of-the-art", "game-changing", "unlock", "supercharge", "elevate",
];

export const HEDGES = ["etc", "various", "and so on", "and more", "as needed", "if possible", "ideally", "somehow", "tbd", "to be decided", "at some point"];

const HEADING = /^(#{1,6}\s+|[A-Z][A-Za-z /&-]{2,40}:?\s*$)/;
// Tier labels inside a scope list are not sections.
const NOT_HEADING = /^(must|should|could|won'?t|later|now|next|p[0-3]|v[0-9]|mvp|nice[- ]to[- ]have|phase\s*\d+|week\s*\d+|day\s*\d+)\b/i;

export function splitSections(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const sections = [];
  let current = { title: "(intro)", lines: [] };
  for (const raw of lines) {
    const line = raw.trim();
    const isHeading = line.length > 0 && line.length < 60 && HEADING.test(line) && !/[.]$/.test(line) && !NOT_HEADING.test(line.replace(/^#+\s*/, ""));
    if (isHeading) {
      if (current.lines.length || current.title !== "(intro)") sections.push(current);
      current = { title: line.replace(/^#+\s*/, "").replace(/:$/, ""), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections.map((s) => ({ ...s, body: s.lines.filter(Boolean).join(" ") }));
}

export function sentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

// Patterns are in priority order; a section needs a body to count. The document title never matches.
function findSection(sections, patterns) {
  const candidates = sections.filter((s, i) => s.body && !(i === 0 && s.title !== "(intro)") );
  for (const p of patterns) {
    const hit = candidates.find((s) => p.test(s.title));
    if (hit) return hit;
  }
  return undefined;
}

function firstMatch(text, re) {
  const m = text.match(re);
  return m ? m[0] : null;
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

function clip(s, n = 140) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const NUMBER = /(\d+(?:[.,]\d+)?\s*(%|x|×|k|m|cr|lakh|crore|days?|weeks?|months?|sec|s|ms|min|hrs?|users|sessions|leads|₹|\$)|\b\d{2,}\b)/i;
const BASELINE = /\b(from|baseline|currently|today|now at|is at)\b[^.]{0,60}?\d/i;
const TARGET = /\b(to|target|goal|reach|hit|increase|reduce|cut|lift)\b[^.]{0,60}?\d/i;

export function scoreProblem(sections, full) {
  const sec = findSection(sections, [/problem/i, /background/i, /context/i, /why/i, /opportunity/i, /overview/i, /summary/i, /intro/i]);
  const text = sec ? sec.body : sentences(full.replace(/^#.*$/gm, "")).slice(0, 5).join(" ");
  if (!text) return { score: 0, evidence: "No problem statement found. Start with who is stuck and what it costs them." };
  const who = /\b(users?|customers?|founders?|investors?|merchants?|teams?|people|[A-Z][a-z]+s)\b/.test(text);
  const pain = /\b(can't|cannot|fail|drop|abandon|confus|slow|manual|lose|churn|wait|frustrat|expensive|costs?|hours?|minutes?)\b/i.test(text);
  const evidence = NUMBER.test(text);
  const score = (who ? 1 : 0) + (pain ? 1 : 0) + (evidence ? 1 : 0);
  const quote = clip(sentences(text)[0]);
  const missing = [!who && "who is affected", !pain && "what actually goes wrong", !evidence && "a number that proves it matters"].filter(Boolean);
  return {
    score,
    evidence: score === 3 ? `Good: "${quote}"` : `"${quote}" is missing ${missing.join(", ")}.`,
  };
}

export function scoreUser(sections, full) {
  const sec = findSection(sections, [/user/i, /persona/i, /audience/i, /customer/i, /who/i]);
  const text = sec ? sec.body : full;
  const generic = /\b(all users|everyone|anyone|users in general|our users)\b/i.test(text);
  const specific = /\b(\d{2}\s*(to|-|–)\s*\d{2}|first-time|tier[- ]?2|salaried|founders?|SMBs?|merchants?|students?|traders?|investors?|admins?|ops teams?|analysts?)\b/i.test(text);
  const jtbd = /\b(when|trying to|so that|needs? to|wants? to)\b/i.test(text);
  let score = 0;
  if (sec) score++;
  if (specific) score++;
  if (jtbd && !generic) score++;
  if (!sec && !specific) return { score: 0, evidence: "No target user. Name one segment and what they are trying to do." };
  const quote = clip(firstMatch(text, /[^.]*\b(first-time|tier[- ]?2|salaried|founders?|SMBs?|merchants?|students?|traders?|investors?|admins?|analysts?)\b[^.]*\./i) || sentences(text)[0]);
  return {
    score,
    evidence: generic ? `"${quote}" then widens to everyone. Pick one segment for v1.` : score === 3 ? `Good: "${quote}"` : `"${quote}". Add the job they are trying to do.`,
  };
}

export function scoreMetric(sections, full) {
  const sec = findSection(sections, [/metric/i, /success/i, /kpi/i, /goal/i, /outcome/i, /measure/i]);
  const text = sec ? sec.body : full;
  const hasNumber = NUMBER.test(text);
  const hasBaseline = BASELINE.test(text);
  const hasTarget = TARGET.test(text);
  const vanity = /\b(page ?views|impressions|downloads|signups?|sign-ups|installs|engagement|awareness)\b/i.test(text);
  if (!sec && !hasNumber) return { score: 0, evidence: "No success metric. Say what number moves, from what, to what, by when." };
  let score = (hasNumber ? 1 : 0) + (hasBaseline ? 1 : 0) + (hasTarget ? 1 : 0);
  if (vanity && score > 1) score--;
  const quote = clip(firstMatch(text, /[^.]*\d[^.]*\./) || sentences(text)[0]);
  const notes = [!hasNumber && "no number", !hasBaseline && "no baseline", !hasTarget && "no target", vanity && "leans on a vanity metric"].filter(Boolean);
  return { score, evidence: notes.length ? `"${quote}": ${notes.join(", ")}.` : `Good: "${quote}"` };
}

export function scoreNonGoals(sections) {
  const sec = findSection(sections, [/non[- ]?goals?/i, /out of scope/i, /not (in|doing)/i, /won'?t/i, /exclusions?/i]);
  if (!sec) return { score: 0, evidence: "No non-goals. The fastest way to earn engineering trust is to say what you are not building." };
  const items = sec.lines.filter((l) => l && /^[-*•\d]/.test(l));
  const concrete = items.length || sec.body.split(/[.;]/).filter((s) => s.trim().length > 12).length;
  const score = Math.min(3, 1 + (concrete >= 2 ? 1 : 0) + (concrete >= 3 ? 1 : 0));
  return { score, evidence: score === 3 ? `Good: ${concrete} explicit exclusions.` : `Only ${concrete} exclusion${concrete === 1 ? "" : "s"}. List what people will assume is included and is not.` };
}

export function scoreScope(sections, full) {
  const sec = findSection(sections, [/scope/i, /requirements?/i, /features?/i, /solution/i, /what we('| a)re building/i, /functional/i]);
  const text = sec ? sec.body + " " + sec.lines.join(" ") : full;
  const tiered = /\b(must|should|could|p0|p1|p2|v1|later|phase ?[12]|mvp|nice[- ]to[- ]have)\b/i.test(text);
  const bullets = (sec ? sec.lines : full.split("\n")).filter((l) => /^[-*•]|\b\d+[.)]/.test(l.trim())).length;
  const testable = /\b(when|given|then|shall|must|can|able to|within \d|less than|at most|at least)\b/i.test(text);
  if (!sec && bullets === 0) return { score: 0, evidence: "No scope section. List the requirements and rank them." };
  const score = (bullets >= 3 ? 1 : 0) + (tiered ? 1 : 0) + (testable ? 1 : 0);
  return {
    score,
    evidence: score === 3 ? `Good: ${bullets} ranked, testable requirements.` : cap([bullets < 3 && "fewer than 3 concrete requirements", !tiered && "not ranked (must / should / later)", !testable && "not testable (no conditions or thresholds)"].filter(Boolean).join("; ") + "."),
  };
}

export function scoreRisks(sections, full) {
  const sec = findSection(sections, [/risks?/i, /assumptions?/i, /open questions?/i, /unknowns?/i, /dependenc/i]);
  const text = sec ? sec.body : full;
  const has = /\b(risk|assum|unknown|depends? on|might not|could fail|if .* then)\b/i.test(text);
  const mitigation = /\b(mitigat|we will know|kill (it|switch)|fallback|roll ?back|monitor|guardrail|if .* we)\b/i.test(text);
  const count = sec ? sec.lines.filter((l) => l && /^[-*•\d]/.test(l)).length : 0;
  if (!sec && !has) return { score: 0, evidence: "No risks or assumptions. Every PRD has at least three; the ones you do not write down are the ones that ship." };
  const score = (has ? 1 : 0) + (count >= 2 ? 1 : 0) + (mitigation ? 1 : 0);
  return { score, evidence: score === 3 ? `Good: ${count} risks with a way to detect or mitigate.` : `${count || "Some"} risk${count === 1 ? "" : "s"} listed${mitigation ? "" : ", none say how you would know or what you would do"}.` };
}

export function scoreRollout(sections, full) {
  const sec = findSection(sections, [/rollout/i, /launch/i, /release/i, /go[- ]to[- ]market/i, /gtm/i, /timeline/i, /milestones?/i, /plan/i]);
  const text = sec ? sec.body : full;
  const phased = /\b(phase|beta|pilot|cohort|% of|percent of|feature flag|flag|gradual|staged|internal first|dogfood)\b/i.test(text);
  const dated = /\b(week|sprint|q[1-4]|20\d\d|by (end of|mid)|day \d|d\+?\d)\b/i.test(text);
  const owner = /\b(owner|dri|responsible|@\w+|eng lead|pm:|design:)\b/i.test(text);
  if (!sec && !phased && !dated) return { score: 0, evidence: "No rollout plan. Who sees it first, behind what flag, and when do you decide to widen?" };
  const score = (phased ? 1 : 0) + (dated ? 1 : 0) + (owner ? 1 : 0);
  return { score, evidence: score === 3 ? "Good: phased, dated, owned." : cap([!phased && "not phased", !dated && "no dates", !owner && "no owners"].filter(Boolean).join(", ") + ".") };
}

export function scoreClarity(full) {
  const sents = sentences(full);
  const words = full.split(/\s+/).filter(Boolean);
  const avg = sents.length ? words.length / sents.length : 0;
  const long = sents.filter((s) => s.split(/\s+/).length > 30);
  const lower = full.toLowerCase();
  const buzz = BUZZWORDS.filter((b) => new RegExp(`\\b${b.replace(/-/g, "[- ]")}\\b`, "i").test(lower));
  const hedges = HEDGES.filter((h) => new RegExp(`\\b${h}\\b`, "i").test(lower));
  const passive = sents.filter((s) => /\b(is|are|was|were|be|been|being)\s+\w+(ed|en)\b/.test(s)).length;
  const passiveRatio = sents.length ? passive / sents.length : 0;
  let score = 3;
  if (avg > 24 || long.length > 2) score--;
  if (buzz.length >= 2) score--;
  if (hedges.length >= 2 || passiveRatio > 0.35) score--;
  const notes = [
    long.length ? `${long.length} sentence${long.length === 1 ? "" : "s"} over 30 words` : null,
    buzz.length ? `buzzwords: ${buzz.slice(0, 4).join(", ")}` : null,
    hedges.length ? `hedges: ${hedges.slice(0, 4).join(", ")}` : null,
    passiveRatio > 0.35 ? `${Math.round(passiveRatio * 100)}% passive sentences` : null,
  ].filter(Boolean);
  return {
    score: Math.max(0, score),
    evidence: notes.length ? notes.join("; ") + "." : `Good: ${Math.round(avg)} words per sentence on average, no buzzwords.`,
    stats: { sentences: sents.length, words: words.length, avgWords: +avg.toFixed(1), buzz, hedges, passiveRatio: +passiveRatio.toFixed(2), longest: clip(long[0] || "", 200) },
  };
}

export function critique(text) {
  const full = (text || "").trim();
  if (full.split(/\s+/).length < 40) {
    return { total: 0, max: 24, grade: "Too short", dimensions: [], weakest: null, summary: "Paste a PRD of at least a few paragraphs." };
  }
  const sections = splitSections(full);
  const results = {
    problem: scoreProblem(sections, full),
    user: scoreUser(sections, full),
    metric: scoreMetric(sections, full),
    nongoals: scoreNonGoals(sections),
    scope: scoreScope(sections, full),
    risks: scoreRisks(sections, full),
    rollout: scoreRollout(sections, full),
    clarity: scoreClarity(full),
  };
  const dimensions = DIMENSIONS.map((d) => ({ ...d, ...results[d.id] }));
  const total = dimensions.reduce((a, d) => a + d.score, 0);
  const weakest = [...dimensions].sort((a, b) => a.score - b.score || DIMENSIONS.findIndex((x) => x.id === a.id) - DIMENSIONS.findIndex((x) => x.id === b.id))[0];
  const grade = total >= 21 ? "Decision-ready" : total >= 15 ? "Needs one more pass" : total >= 9 ? "Not ready for engineering" : "Idea, not a PRD";
  const missing = dimensions.filter((d) => d.score === 0).map((d) => d.name.toLowerCase());
  const summary = missing.length
    ? `Missing entirely: ${missing.join(", ")}. Fix ${weakest.name.toLowerCase()} first.`
    : `Nothing is missing outright. The weakest section is ${weakest.name.toLowerCase()}: ${weakest.evidence}`;
  return { total, max: 24, grade, dimensions, weakest, summary, sections: sections.map((s) => s.title) };
}

export function toMarkdown(result, title = "PRD critique") {
  const lines = [
    `# ${title}`,
    ``,
    `**Score:** ${result.total} / ${result.max} (${result.grade})`,
    ``,
    result.summary,
    ``,
    `| Dimension | Score | Evidence |`,
    `|---|---|---|`,
    ...result.dimensions.map((d) => `| ${d.name} | ${d.score} / 3 | ${d.evidence.replace(/\|/g, "/")} |`),
  ];
  return lines.join("\n");
}
