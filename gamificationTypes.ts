
// --- Gamification Types ---

export type ActivityType =
  | 'COURSE_CREATED'
  | 'QUIZ_COMPLETED'
  | 'QUIZ_PERFECT_SCORE';

export interface ActivityEvent {
  type: ActivityType;
  timestamp: number; // UTC timestamp
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: (log: ActivityEvent[], streak: number) => boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  timestamp: number;
}
