# MindLine — Engagement Loop, Reminders & Config
## Staged Build Brief for the Coding Agent
### Grounded in `LiamBolt/mindline-frontend` (main, as pulled from GitHub)

Source: `MindLine_Final_Concept_Note.pdf` (final pitch concept) + `MindLine_Tech_Addendum_Engagement_Loop.docx` (facilitator feedback, for Amwine), cross-checked against the actual repo. Every file path, type name, and function name below is real, not illustrative. Where the addendum assumes something that isn't true of the current code, that's called out explicitly.

**Repo root**: `/mnt/c/Users/amwin/Desktop/projects/mindline/frontend` (WSL). All paths below are relative to this root — e.g. `src/services/types.ts` means `/mnt/c/Users/amwin/Desktop/projects/mindline/frontend/src/services/types.ts`. Work directly in this checkout; there is no separate GitHub step involved in executing this brief.

**How to use this brief:** Work one stage at a time, in the order given. After each stage, stop, report exactly what you changed (files touched, types/fields added, functions added or modified), and wait for the human to say "continue" before moving to the next stage. Where a stage says "flag for confirmation," stop and surface the question instead of guessing.

**Progress log — read this before touching anything:** A companion file, `MindLine_Agent_Build_Brief.PROGRESS.md`, sits next to this one in the same folder. It is the single source of truth for what's been done — not this chat, not any other session's memory. Before starting *any* stage:
1. Open `MindLine_Agent_Build_Brief.PROGRESS.md`.
2. Read the "Stage 0 Decisions" section — if it's already filled in, those answers are locked; do not re-ask or re-decide them.
3. Find the last stage marked `Done`, and resume at the next one. If a stage is marked `Blocked`, resolve the blocker described there before proceeding.

Before stopping at the end of *any* stage (whether finished, or blocked), append an entry to `MindLine_Agent_Build_Brief.PROGRESS.md` using the template already in that file, filling in the status, files changed, and any decisions made. This is what lets a different agent, model, or session pick up exactly where the last one left off, purely from what's on disk.

---

## Codebase Facts That Shape Every Stage Below

- **Stack**: Vite + React 19 + TypeScript + Tailwind + Zustand (persisted to `localStorage`) + `react-router-dom`. No backend, no API routes, no service worker, no push-notification library anywhere in `package.json`.
- **The "backend" is simulated in the frontend.** `src/services/adapters/local/localCheckinAdapter.ts` already contains the comment *"In a real app, this would happen securely on the backend... For local demo, we simulate it."* All new engagement-loop logic should follow this exact same pattern: a `Service` interface (e.g. `checkinService.ts`, `dashboardService.ts`) backed by a `local*Adapter.ts` implementation, so a real backend can later be swapped in without touching call sites.
- **Trend/pattern logic** lives in `src/services/trendService.ts` (`evaluateTrend`): flags when ≥2 questions are "elevated" (per `elevatedFromIndex` in `checkinQuestions.ts`) across the 3 most recent check-ins. This is a pure function; it is not currently persisted anywhere as an event, only used to decide whether to call `dashboardService.processSignal`.
- **Extreme answer = the worst option for a question**, i.e. `answerValue === CHECKIN_QUESTIONS[i].options.length - 1`. This is a *stricter, lower bar* than `elevatedFromIndex` (which triggers the multi-check-in trend, not the Stage 2 nudge). Don't conflate the two.
- **There is currently no referral-recommendation message shown to the student anywhere.** `ConfirmationScreen.tsx` always renders the same generic thank-you regardless of whether `evaluateTrend` flagged anything. Section 2.2 of the addendum assumes a "student has been shown a recommendation to reach out" moment exists — it doesn't yet. Stage 3 below has to build it, not just hook into it.
- **Counsellor dashboard status** (`CounsellorSignal.status` in `src/services/types.ts`) is already `'new' | 'reviewed' | 'contacted' | 'closed'`, rendered and edited in `src/features/counsellor/CounsellorDashboard.tsx`. This confirms the addendum's own suggestion: `counsellor_log_contacted` = `status === 'contacted'`. **Do not add a duplicate field for this.**
- **Anonymous identity**: `src/stores/identityStore.ts` (`useIdentityStore`) generates and persists `anonId` (`ML-XXXXXX`) client-side with `zustand/persist`. No phone number or name exists anywhere in the identity model — keep it that way.
- **Consent**: `src/stores/consentStore.ts` (`useConsentStore`) tracks `optedIn` / `contactMethod`, set once during the check-in flow's `ConsentStep.tsx`.
- **Hardcoded "MUST" references found** (Section 1 target list — confirmed by grep, this is the complete list):
  1. `src/config/emergencyContacts.ts` — `EMERGENCY_CONTACTS` array, labels reference "MUST Counselling Unit."
  2. `src/components/checkin/ConsentStep.tsx` line ~25 — copy mentions "the MUST Counselling Unit."
  3. `src/features/landing/LandingPage.tsx` line ~18 — "A short, anonymous check-in for MUST students."
  4. `src/features/help/HelpPage.tsx` line ~11 — "direct lines to support at MUST."
  5. `src/features/privacy/PrivacyPage.tsx` line ~67 — "the MUST Counselling Unit can reach out."
  (The `mindline-logo.jpeg` used in `TopNav.tsx` is the MindLine product logo, not an institution logo — leave it alone.)

---

## Read This First — Non-Negotiable Rules Across All Stages

1. **Priority order is fixed**: Stage 1 (data model) → Stage 2 (Section 2.1 nudge) → Stage 3 (Section 2.2 confirmation loop) → Stage 4 (Section 2.3 dashboard reporting) → Stage 5 (Section 3 reminders) → Stage 6 (Section 1 config). This matches the addendum's own stated priority: all of Section 2 first, then Section 3, then Section 1 last (deprioritise first if time is short).
2. **Do not touch the check-in itself** — `CheckinFlow.tsx`, `QuestionStep.tsx`, `checkinQuestions.ts`'s question set/format are frozen for this pass.
3. **Two notification types must stay architecturally distinct in code**: the extreme-answer nudge (Stage 2) and the periodic reminder (Stage 5) need separate trigger logic, separate stored records, and a `type` discriminator — never one generic "notification" path.
4. **Two confirmation signals must never be merged**: `studentSelfReportReached` (written by the student-facing app) and `status === 'contacted'` (written by the counsellor dashboard via `updateSignalStatus`) must go through separate write paths and never overwrite each other. Disagreement between them is an expected, valid state.
5. **Anonymity is non-negotiable.** Everything new keys off `anonId` from `useIdentityStore`. Nothing in this pass introduces a phone number, name, or other identity field.
6. **Reuse before duplicating.** `counsellor_log_contacted` = `status === 'contacted'`. Do not add a parallel field.
7. **No magic numbers.** Nudge delay and reminder cadence live in one named config object, not inline literals, and are clearly commented as pilot-tunable defaults pending Clinical Lead sign-off.
8. **Do not build**: a real backend, a service worker / Push API integration, real multi-tenant infrastructure, or a dedicated analytics dashboard for reach/not-reached discrepancies. A simple filtered list/column on the existing dashboard is enough.

---

## Stage 0 — Three Confirmations Before Writing Code

Not exploration (already done) — just decisions that shouldn't be guessed silently:

1. **No separate backend repo exists** (this repo is `mindline-frontend`, self-contained, `localStorage`-only). *Assumption going into every stage below.* If a `mindline-backend` repo actually exists elsewhere, stop and say so — this brief's "local adapter" approach should target real endpoints instead.
2. **Delivery mechanism for nudges/reminders**: given there's no service worker or push infrastructure, the recommended approach is an **in-app banner surfaced when the app is opened** (checked against a `scheduledFor` timestamp), not a literal OS-level push notification. This is consistent with how the rest of the prototype already simulates backend behavior. Flag to the human if a live, OS-level push notification is a hard requirement for the pitch demo itself — that would need real scope added (Notification API + permission flow), which is a bigger lift than described as "BUILD NOW."
3. **Exact timing defaults**: use `extremeNudgeDelayHours: 36` and `reminderCadenceDays: 3.5` as starting defaults (midpoints of the addendum's suggested ranges) unless the Clinical Lead has already given a number. Store them as named constants (Stage 1) either way.

Report these three decisions (or overrides) before Stage 1 begins.

---

## Stage 1 — Data Model & Config Foundations
**Priority: BUILD NOW — prerequisite for Stages 2–5**

**In `src/services/types.ts`, add:**
```ts
export type NotificationType = 'extreme_nudge' | 'periodic_reminder';

export interface ScheduledNudge {
  id: string;
  anonId: string;
  type: NotificationType;
  triggerCheckinId?: string;   // set only for extreme_nudge
  triggerQuestionId?: string;  // which domain triggered it, for extreme_nudge
  scheduledFor: string;        // ISO timestamp — when it becomes due
  sentAt?: string;             // when actually surfaced to the student in-app
  respondedAt?: string;
  response?: number;           // reuses the same answer-index scale as the triggering question
}
```

**Extend `CounsellorSignal` in the same file:**
```ts
export interface CounsellorSignal {
  // ...existing fields unchanged...
  referralRecommendedAt?: string;
  studentSelfReportReached?: 'yes' | 'no' | 'not_yet_answered';
}
```
Do **not** add a `counsellorLogContacted` field — derive it from `status === 'contacted'` wherever needed.

**New file `src/config/engagementConfig.ts`:**
```ts
// Pilot-tunable defaults — confirm exact values with the Clinical Lead during the grant period.
export const ENGAGEMENT_CONFIG = {
  extremeNudgeDelayHours: 36,   // addendum-suggested range: 24–48h
  reminderCadenceDays: 3.5,     // addendum-suggested range: 3–4 days
};
```

**Definition of done:** types compile, no behavior wired up yet, config file exists and is unused so far. Report the diff. Wait for "continue."

---

## Stage 2 — Section 2.1: Delayed Re-Check Nudge After an Extreme Negative Answer
**Priority: BUILD NOW — highest priority in the whole addendum**

1. Add a helper (e.g. in `checkinQuestions.ts` or a new `src/services/engagementService.ts`):
   ```ts
   export function isExtremeAnswer(questionId: string, value: number): boolean {
     const q = CHECKIN_QUESTIONS.find(q => q.id === questionId);
     return !!q && value === q.options.length - 1;
   }
   ```
2. Create `src/services/engagementService.ts` + `src/services/adapters/local/localEngagementAdapter.ts`, mirroring the existing `checkinService`/`localCheckinAdapter` pattern, exposing something like:
   ```ts
   export interface EngagementService {
     scheduleNudge(input: { anonId: string; checkinId: string; questionId: string }): Promise<void>;
     getDueNudges(anonId: string): Promise<ScheduledNudge[]>;
     recordNudgeResponse(nudgeId: string, response: number): Promise<void>;
   }
   ```
   Store `ScheduledNudge[]` in `localStorage` under a new key (e.g. `mindline_scheduled_nudges`), following the same `JSON.parse(localStorage.getItem(...) || ...)` pattern used in `localCheckinAdapter.ts` and `localDashboardAdapter.ts`.
3. In `localCheckinAdapter.ts`'s `submitCheckin`, after saving the record, loop over `record.answers` and call `engagementService.scheduleNudge(...)` for each answer where `isExtremeAnswer(questionId, value)` is true, with `scheduledFor = now + ENGAGEMENT_CONFIG.extremeNudgeDelayHours` and `type: 'extreme_nudge'`.
4. Build a small banner component (e.g. `src/components/engagement/DueNudgeBanner.tsx`) and render it inside `AppShell.tsx` (it already wraps every route, so this is the one place that guarantees the banner shows regardless of which page the student lands on next). On mount, call `engagementService.getDueNudges(anonId)`; if any exist, show:
   > "Hi, just checking in. Are you still feeling that way?" — use the same wording as the check-in's answer options for that question so the response is comparable.
5. On response, call `recordNudgeResponse`, then feed the response into the **same pattern-logic pipeline as a normal check-in** — i.e. append it to that question's value in a new `CheckinRecord` (or merge into the existing one) via `checkinService`, so `evaluateTrend` treats it identically to a scheduled check-in answer. Do not create a separate data type for this.

**Definition of done:** an extreme answer reliably schedules exactly one `ScheduledNudge` (`type: 'extreme_nudge'`), delivered as an in-app banner on next app open once due, using only `anonId` — no phone number or identity involved. The response flows into existing trend logic. Report the files touched and where `ENGAGEMENT_CONFIG.extremeNudgeDelayHours` is referenced. Wait for "continue."

---

## Stage 3 — Section 2.2: Post-Referral Confirmation Loop (Both Sides)
**Priority: BUILD NOW**

This stage has two parts, because the referral-recommendation surface doesn't exist yet (see codebase facts above).

**3a. Build the missing "referral recommended" surface:**
- `checkinService.submitCheckin`'s return type currently is just `CheckinRecord`. Change it (or add a second return field) so callers learn whether this submission triggered a flagged trend — the trend result is already computed inside `localCheckinAdapter.ts`, it's just discarded after being passed to `dashboardService.processSignal`. Surface it, e.g. `Promise<{ record: CheckinRecord; referralRecommended: boolean }>`.
- In `dashboardService.processSignal` (`localDashboardAdapter.ts`), when `input` corresponds to a flagged trend, set `referralRecommendedAt` on the `CounsellorSignal` (new signal or existing).
- In `CheckinFlow.tsx`, capture `referralRecommended` from `submitCheckin` and pass it as a prop to `ConfirmationScreen.tsx`. When true, `ConfirmationScreen` should show additional messaging consistent with the concept note's "consent-separated outreach" model:
  - If `useConsentStore().optedIn` is true: message that a counsellor may reach out (matches `ConsentStep.tsx` copy already in the app).
  - If not opted in: surface in-app resources directly (reuse `EMERGENCY_CONTACTS` / link to `HelpPage.tsx`), per the concept note's "otherwise the system offers in-app resources directly."
  - Never invent a diagnosis or risk label in this copy — MindLine explicitly excludes diagnostic/treatment content.

**3b. Student self-report ("Did you reach out, or were you contacted by a counsellor?"):**
- This doesn't need its own push-style `ScheduledNudge` — surface it as an in-app prompt (similar banner mechanism as Stage 2, or inline on `LandingPage.tsx`) the next time the student opens the app after `referralRecommendedAt` is set, while `studentSelfReportReached` is still `'not_yet_answered'` or unset.
- Add a new `dashboardService` method, e.g. `recordStudentSelfReport(anonId: string, value: 'yes' | 'no'): Promise<void>`, that patches **only** `studentSelfReportReached` on the matching signal in `localDashboardAdapter.ts`. This must be a completely separate write path from `updateSignalStatus` (which the counsellor uses) — never let one call touch the other's field.

**Definition of done:** a flagged check-in produces a `referralRecommendedAt` timestamp, the student sees an appropriate message on `ConfirmationScreen`, and a later in-app prompt can independently record `studentSelfReportReached` without ever touching `status`. Report exactly which functions now set which field. Wait for "continue."

---

## Stage 4 — Section 2.3: Aggregate Reporting for Disagreement Cases
**Priority: BUILD NOW**

In `CounsellorDashboard.tsx`:
- Add a derived label per row from the pair `(status, studentSelfReportReached)`:
  - **"Confirmed reached"** — `status === 'contacted' && studentSelfReportReached === 'yes'`
  - **"Student reports not reached"** — `studentSelfReportReached === 'no'` (this is the disagreement case worth highlighting, especially alongside `status === 'contacted'`)
  - **"Awaiting student confirmation"** — `referralRecommendedAt` is set and `studentSelfReportReached` is `'not_yet_answered'` or unset
- Render this as a new column (next to the existing "Status" column) or a badge, using the same `cn(...)` badge styling already used for the "Consent" column.
- Extend the existing `filter` state/`<select>` (currently `'all' | 'new' | 'reviewed' | 'contacted' | 'closed'`) with an additional filter dimension for these three labels, or add a second, independent filter control — keep it a simple client-side filter on `signals`, not a new page or analytics view.
- Keep the framing neutral: this is a visibility/quality signal for the counselling team, not a way to flag individual counsellors — avoid alarmist styling (no red "error" treatment for "Student reports not reached").

**Definition of done:** the existing dashboard table surfaces the three states above from Stage 3's two independent fields, filterable. Report where in `CounsellorDashboard.tsx` this was added. Wait for "continue."

---

## Stage 5 — Section 3: Scheduled Re-Engagement Reminder Cadence
**Priority: BUILD NOW — second overall priority, after Section 2 is complete**

- Mirror Stage 2's mechanism, but independent of any extreme answer: use `engagementService`/`localEngagementAdapter` to schedule a `ScheduledNudge` with `type: 'periodic_reminder'`, `scheduledFor` = last check-in date (or last reminder) + `ENGAGEMENT_CONFIG.reminderCadenceDays`.
- Track `reminderLastSentAt` (add to `CounsellorSignal` or keep a lightweight per-`anonId` record in the engagement adapter — whichever avoids duplicating data already in `CheckinRecord.timestamp` history).
- Reuse the same `DueNudgeBanner` component from Stage 2, discriminated by `type`, with copy: *"30 seconds for you today?"* linking to `/check-in`.
- Confirm this pathway is fully independent in code from Stage 2's `extreme_nudge` — different scheduling trigger, different `type`, can coexist and both be due at once without interfering.
- Does not change `CheckinFlow.tsx`, `checkinQuestions.ts`, or the 30-second format in any way — only how often the student is invited back.

**Definition of done:** a student can have both an `extreme_nudge` and a `periodic_reminder` due independently, at different times, for different reasons. Report the scheduling logic and where `reminderCadenceDays` is referenced. Wait for "continue."

---

## Stage 6 — Section 1: Institution-Agnostic Configuration
**Priority: QUICK FIX — do this last, deprioritise first if time is short**

- Create `src/config/institutionConfig.ts`:
  ```ts
  export const INSTITUTION = {
    name: 'MUST',
    fullName: 'Mbarara University of Science and Technology',
    counsellingUnitLabel: 'MUST Counselling Unit',
    contacts: EMERGENCY_CONTACTS, // moved from emergencyContacts.ts, or re-exported from here
  };
  ```
- Update the five call sites found in the grep above (`ConsentStep.tsx`, `LandingPage.tsx`, `HelpPage.tsx`, `PrivacyPage.tsx`, `emergencyContacts.ts`) to reference `INSTITUTION.name` / `INSTITUTION.counsellingUnitLabel` / `INSTITUTION.contacts` instead of the literal string "MUST" or hardcoded labels.
- The live demo keeps rendering identically for MUST — this is a refactor for switchability, not a visible change. Do **not** build actual multi-tenant routing, per-institution auth, or a database — a single config object is sufficient for the pitch.

**Definition of done:** `grep -rn "MUST" src` (excluding `node_modules`) returns zero hits outside `institutionConfig.ts` itself. App renders identically. Report every call site updated. Wait for "continue."

---

## Stage 7 — Final Guardrail Pass

- [ ] No backend, service worker, or Push API integration was added — nudges/reminders are in-app banners checked on load.
- [ ] No multi-tenant infrastructure was built — config-driven branding only (`institutionConfig.ts`).
- [ ] No dedicated analytics dashboard was built for reach/not-reached — only a column/filter on the existing `CounsellorDashboard.tsx`.
- [ ] `extremeNudgeDelayHours` and `reminderCadenceDays` remain named constants in `engagementConfig.ts`, flagged as pilot-tunable, not hardcoded inline anywhere.
- [ ] `extreme_nudge` and `periodic_reminder` remain distinct `ScheduledNudge` records with a `type` discriminator.
- [ ] `studentSelfReportReached` and `status` remain separate fields with separate write paths (`recordStudentSelfReport` vs `updateSignalStatus`).
- [ ] Nothing added requires a phone number, name, or identity beyond `anonId`.
- [ ] `CheckinFlow.tsx`, `QuestionStep.tsx`, and `checkinQuestions.ts` are untouched apart from the extreme-answer helper.

Report the checklist results. This closes the addendum scope.
