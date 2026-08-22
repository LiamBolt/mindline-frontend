// src/config/checkinQuestions.ts
export const CHECKIN_QUESTIONS = [
  { id: 'sleep', icon: 'BedtimeRounded', prompt: 'How has your sleep been this week?',
    options: ['Fine', 'Struggling', 'Really bad'], elevatedFromIndex: 1 },
  { id: 'appetite', icon: 'RestaurantRounded', prompt: 'Have you been eating the way you normally do?',
    options: ['Normal', 'Eating much less', 'More than usual', 'Really struggling'], elevatedFromIndex: 2 },
  { id: 'overwhelm', icon: 'LayersRounded', prompt: "Have things felt like they're piling up and hard to face?",
    options: ['Not really', 'Some days', 'Most days', 'Nearly every day'], elevatedFromIndex: 2 },
  { id: 'social', icon: 'Groups2Rounded', prompt: 'Have you reached out to friends, classmates or family, or mostly kept to yourself?',
    options: ['Often', 'Sometimes', 'Rarely', 'Not at all'], elevatedFromIndex: 2 },
  { id: 'focus', icon: 'CenterFocusWeakRounded', prompt: 'Has it been hard to focus on classes or tasks this week?',
    options: ['Not really', 'A little', 'Fairly difficult', 'Really hard'], elevatedFromIndex: 2 },
  { id: 'energy', icon: 'BoltRounded', prompt: 'Have you felt physically drained, even without doing much?',
    options: ['Not at all', 'A little', 'Somewhat', 'Yes, quite drained'], elevatedFromIndex: 2 },
  { id: 'selfRegard', icon: 'SentimentSatisfiedAltRounded', prompt: "I've felt okay about myself this week",
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'], elevatedFromIndex: 2 },
] as const;
