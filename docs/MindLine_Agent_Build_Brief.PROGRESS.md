# MindLine Engagement Loop — Progress Log

This file is the single source of truth for what's been done against `MindLine_Agent_Build_Brief.md`. Any agent, in any session, should read this file first before starting work, and append to it before stopping. Do not rely on chat history — this file is what persists.

---

## Stage 0 Decisions (locked once filled in — do not re-ask)

- **Separate backend repo exists?** No — this repo (`mindline-frontend`) is self-contained and localStorage-only. All new logic follows the local-adapter simulation pattern.
- **Delivery mechanism for nudges/reminders** (in-app banner vs. real OS push): In-app banner (`DueNudgeBanner.tsx`) surfaced when the app is opened, checking scheduled timestamps against `Date.now()`.
- **Timing defaults** (`extremeNudgeDelayHours`, `reminderCadenceDays`): 36 hours for extreme-answer nudge follow-up; 3.5 days for periodic check-in reminder. Stored as named constants in `src/config/engagementConfig.ts` flagged as pilot-tunable defaults pending Clinical Lead sign-off.

---

## Stage Status Overview

| Stage | Description | Status |
|---|---|---|
| 0 | Confirmations before writing code | Done |
| 1 | Data model & config foundations | Done |
| 2 | Section 2.1 — extreme-answer nudge | Done |
| 3 | Section 2.2 — post-referral confirmation loop | Done |
| 4 | Section 2.3 — aggregate dashboard reporting | Done |
| 5 | Section 3 — reminder cadence | Done |
| 6 | Section 1 — institution-agnostic config | Done |
| 7 | Final guardrail pass | Done |

(Status values: `Not started` / `In Progress` / `Blocked` / `Done`)

---

## Log Entries

## Stage 0 — Confirmations Before Writing Code
Date: 2026-09-14T03:50:00Z
Status: Done
Decisions/confirmations made this stage:
- Backend: Verified no separate backend repository exists. Kept frontend self-contained with local adapters.
- Delivery: In-app banner on app load via `DueNudgeBanner.tsx` checking `scheduledFor <= now`.
- Timing: `extremeNudgeDelayHours = 36`, `reminderCadenceDays = 3.5` in `src/config/engagementConfig.ts`.

## Stage 1 — Data Model & Config Foundations
Date: 2026-09-14T03:52:00Z
Status: Done
Files changed:
- `src/services/types.ts` — Added `NotificationType`, `ScheduledNudge`, extended `CounsellorSignal` with `referralRecommendedAt` and `studentSelfReportReached`.
- `src/config/engagementConfig.ts` — Created with `ENGAGEMENT_CONFIG` containing `extremeNudgeDelayHours: 36` and `reminderCadenceDays: 3.5`.
Decisions/confirmations made this stage:
- Derived `counsellor_log_contacted` from `status === 'contacted'` without creating duplicate fields.

## Stage 2 — Section 2.1: Delayed Re-Check Nudge After an Extreme Negative Answer
Date: 2026-09-14T04:00:00Z
Status: Done
Files changed:
- `src/services/engagementService.ts` — Created interface for scheduling, querying, and recording responses to nudges and periodic reminders; added `isExtremeAnswer(qId, val)` helper.
- `src/services/adapters/local/localEngagementAdapter.ts` — Implemented `EngagementService` backed by localStorage key `mindline_scheduled_nudges`.
- `src/services/adapters/local/localCheckinAdapter.ts` — Scanned check-in answers on submission and scheduled `extreme_nudge` if `isExtremeAnswer` is true.
- `src/components/engagement/DueNudgeBanner.tsx` — Created in-app banner surfacing due `extreme_nudge` prompts, feeding answers back into normal check-in pipeline.
- `src/components/layout/AppShell.tsx` — Mounted `<DueNudgeBanner />` inside `AppShell` for all non-checkin, non-counsellor routes.
Decisions/confirmations made this stage:
- Extreme answers checked strictly against `options.length - 1` (worst option).

## Stage 3 — Section 2.2: Post-Referral Confirmation Loop (Both Sides)
Date: 2026-09-14T04:07:00Z
Status: Done
Files changed:
- `src/services/checkinService.ts` — Updated `submitCheckin` return type to `Promise<{ record: CheckinRecord; referralRecommended: boolean }>`.
- `src/services/adapters/local/localCheckinAdapter.ts` — Returned `referralRecommended` from trend evaluation, and passed `referralRecommended: true` to `processSignal`.
- `src/services/dashboardService.ts` — Added `referralRecommended` to `ProcessSignalInput` and added `recordStudentSelfReport(anonId, value)` method.
- `src/services/adapters/local/localDashboardAdapter.ts` — Recorded `referralRecommendedAt` on signal when flagged; added independent `recordStudentSelfReport` write path.
- `src/features/checkin/CheckinFlow.tsx` — Captured `referralRecommended` and passed it to `ConfirmationScreen`.
- `src/components/checkin/ConfirmationScreen.tsx` — Added conditional messaging for referral recommendations (opted-in vs anonymous).
- `src/components/engagement/DueNudgeBanner.tsx` — Added self-report prompt when `referralRecommendedAt` is present and student hasn't answered yet.
Decisions/confirmations made this stage:
- Guaranteed student self-report write path and counsellor status write path remain strictly separated. Non-diagnostic phrasing used throughout.

## Stage 4 — Section 2.3: Aggregate Reporting for Disagreement Cases
Date: 2026-09-14T04:08:00Z
Status: Done
Files changed:
- `src/features/counsellor/CounsellorDashboard.tsx` — Added `ReachBadge` component and `reachFilter` dropdown ('all' | 'confirmed' | 'not_reached' | 'awaiting').
- `src/services/adapters/local/localDashboardAdapter.ts` — Included seed cases demonstrating reached, not-reached, and awaiting confirmation states.
Decisions/confirmations made this stage:
- Neutral badge styling used: amber for awaiting, slate/muted for student reports not reached (no alarmist red).

## Stage 5 — Section 3: Scheduled Re-Engagement Reminder Cadence
Date: 2026-09-14T04:08:30Z
Status: Done
Files changed:
- `src/services/adapters/local/localCheckinAdapter.ts` — Called `schedulePeriodicReminder` after each check-in submission using `lastCheckinTimestamp`.
- `src/services/adapters/local/localEngagementAdapter.ts` — Implemented `schedulePeriodicReminder` and `getDueReminders` based on `reminderCadenceDays`.
- `src/components/engagement/DueNudgeBanner.tsx` — Integrated periodic reminder prompt ("30 seconds for you today?" linking to `/check-in`) with distinct priority and state handling.
Decisions/confirmations made this stage:
- Both `extreme_nudge` and `periodic_reminder` coexist independently with separate discriminators and scheduling logic.

## Stage 6 — Section 1: Institution-Agnostic Configuration
Date: 2026-09-14T07:15:45Z
Status: Done
Files changed:
- `src/config/institutionConfig.ts` — Created `INSTITUTION` config object with `name`, `fullName`, `counsellingUnitLabel`, and `contacts`.
- `src/config/emergencyContacts.ts` — Re-exported `EMERGENCY_CONTACTS` from `INSTITUTION.contacts`.
- `src/config/counsellorAccess.ts` — Referenced `INSTITUTION.counsellingUnitLabel`.
- `src/features/landing/LandingPage.tsx` — Replaced hardcoded MUST with `INSTITUTION.name`.
- `src/features/help/HelpPage.tsx` — Replaced hardcoded MUST with `INSTITUTION.name`.
- `src/features/privacy/PrivacyPage.tsx` — Replaced hardcoded MUST with `INSTITUTION.counsellingUnitLabel`.
- `src/components/checkin/ConsentStep.tsx` — Replaced hardcoded MUST with `INSTITUTION.counsellingUnitLabel`.
- `src/features/counsellor/CounsellorDashboard.tsx` — Replaced hardcoded MUST references with `INSTITUTION.name`.
Decisions/confirmations made this stage:
- `grep -rn "MUST" src` returns zero hits outside `src/config/institutionConfig.ts`.

## Stage 7 — Final Guardrail Pass
Date: 2026-09-14T07:16:15Z
Status: Done
Decisions/confirmations made this stage:
- All 8 checklist items verified:
  1. In-app banner on load; no backend, service worker, or Push API.
  2. No multi-tenant infrastructure; single config in `institutionConfig.ts`.
  3. No dedicated analytics dashboard; filtered column on existing dashboard.
  4. Timing values stored as named constants in `engagementConfig.ts`.
  5. `extreme_nudge` and `periodic_reminder` architecturally distinct via `type`.
  6. Separate write paths for `studentSelfReportReached` and counsellor `status`.
  7. Anonymity preserved: all data keyed strictly by `anonId`.
  8. Check-in questions and core flow preserved.
- Full TypeScript compilation passes cleanly (`npx tsc --noEmit` exited 0).
