# Portfolio tracker inside partner news apps

## Problem
Salaried investors aged 25 to 45 check their mutual fund portfolio 3 to 4 times a week, but 62% of them do it across two or more apps. They abandon our onboarding at the "link your holdings" step because it asks for a CAS PDF they do not have handy. Paid installs cost ₹410 each and 71% of those users never link a portfolio. Organic sessions are at 10K a month.

## Target user
Salaried, urban, 25 to 45, holds 3 to 8 mutual funds bought through Groww or Zerodha, reads Moneycontrol or Livemint on the commute. When they open a news app they want to know "am I up or down today" without opening a second app.

## Success metric
Organic sessions from partner surfaces: from 10K a month today to 100K a month within 12 months. Portfolio-link completion rate: from 29% to 55%. Cost per qualified lead at least 50% below paid, measured monthly.

## Non-goals
- We will not build a news product or editorial content.
- We will not support direct equity holdings in v1; mutual funds only.
- We will not run paid placements inside partner apps.
- No transactions inside the partner surface; buy and redeem stay in our app.

## Scope
Must:
- Embeddable tracker widget that renders inside a partner webview within 800 ms on a mid-range Android device.
- Link holdings via CAS email consent, no PDF upload.
- Daily "up or down" summary card.
Should:
- Deep link into our app for redemption.
Later:
- Direct equity, NPS.

## Risks and assumptions
- Assumption: partners will accept a third-party widget. We will know within 3 weeks of outreach; if two of three decline, we pivot to a content partnership.
- Risk: CAS consent flow fails on partner webviews. Mitigation: fallback to SMS OTP link, monitored via a completion-rate guardrail below 40%.
- Risk: SEBI advertising code applies to the summary card copy. Compliance reviews all copy before launch.

## Rollout
Phase 1 (weeks 1 to 4): internal dogfood behind a feature flag, 50 employees. Owner: Priyansh (PM), Rahul (eng lead).
Phase 2 (weeks 5 to 8): 5% of Moneycontrol app traffic, kill switch if crash rate exceeds 0.5%.
Phase 3 (Q2): all three partners.
