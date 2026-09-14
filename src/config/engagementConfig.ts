// Pilot-tunable defaults — confirm exact values with the Clinical Lead during the grant period.
// addendum-suggested ranges: extremeNudgeDelayHours 24–48h, reminderCadenceDays 3–4 days.
// Using midpoints until clinical sign-off is received.
export const ENGAGEMENT_CONFIG = {
  extremeNudgeDelayHours: 36,  // how long after an extreme answer before the follow-up nudge surfaces
  reminderCadenceDays: 3.5,    // days between periodic re-engagement reminders
} as const;
