
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
