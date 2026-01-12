export interface UserProfile {
  date?: string; // ISO Date of assessment
  age: string;
  gender: string;
  dailyCaffeine: string;
  screenTime: string;
  typicalBedtimeRoutine: string[];
  averageSleepDuration: string;
  sleepIssues: string[];
  aiAnalysis?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  profile?: UserProfile;
  assessmentHistory: UserProfile[];
}

export interface SleepSession {
  id: string;
  date: string; // ISO Date
  startTime?: string; // Optional now
  endTime?: string; // Optional now
  durationMinutes: number;
  quality: number; // 0-100
  stages: {
    awake: number; // minutes
    light: number;
    deep: number;
    rem: number;
  };
  noiseEvents: number;
  dreamNotes?: string;
  dreamAnalysis?: { interpretation: string; themes: string[] };
  aiAnalysis?: string;
  caffeineIntake?: string;
  preSleepActivity?: string[];
}

export enum ViewState {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  SLEEP_LAB = 'SLEEP_LAB',
  JOURNAL = 'JOURNAL',
  SETTINGS = 'SETTINGS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
