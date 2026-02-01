export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  isBodyweight?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  exercises: Exercise[];
  notes: string;
  tags: string[]; // e.g., "Chest", "Back"
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  duration?: number; // minutes
  cardioDuration?: number; // 有酸素運動の時間（分）
  cardioDistance?: number; // 有酸素運動の距離（km）
}

export enum Tab {
  LOG = 'LOG',
  HISTORY = 'HISTORY',
  STATISTICS = 'STATISTICS',
  CALENDAR = 'CALENDAR',
  EXPORT = 'EXPORT'
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  tags: string[];
  notes?: string;
  createdAt: string;
}

export const MUSCLE_GROUPS = [
  "胸 (Chest)",
  "背中 (Back)",
  "脚 (Legs)",
  "肩 (Shoulders)",
  "腕 (Arms)",
  "腹筋 (Abs)",
  "有酸素 (Cardio)"
];