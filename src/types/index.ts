
export type Priority = "low" | "medium" | "high";

export interface StudyBlock {
  id: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  priority: Priority;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  progress: number;
  steps: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
}

export interface StudySession {
  id: string;
  subjectId: string | null;
  duration: number;
  completed: boolean;
  xpEarned: number;
  startedAt: string;
  endedAt: string | null;
}

export interface UserStats {
  level: number;
  currentXp: number;
  totalXp: number;
  studyStreak: number;
  lastStudyDate: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeImage: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
}

export interface RevisionPlan {
  id: string;
  subjectId: string;
  topic: string;
  reviewDate: string;
  priority: Priority;
  completed: boolean;
}

export interface StudyCompanion {
  name: string;
  type: string;
  level: number;
  happiness: number;
  energy: number;
  lastInteraction: string;
}

export type CompanionType = "owl" | "cat" | "dog" | "robot";
export type CompanionMood = "happy" | "normal" | "tired" | "excited";
