
export interface Subject {
  id: string;
  name: string;
  shortName: string;
  periodsPerWeek: number;
  staffId?: string | null;
  isLab: boolean;
  priority: number;
  type?: string; // For compatibility with existing code
  code?: string; // For compatibility with existing code
  title?: string; // For compatibility with existing code
  staff?: string; // For compatibility with existing code
  continuous?: boolean; // For compatibility with existing code
  span?: number; // For compatibility with existing code
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  maxPeriods?: number;
  subjects?: string[]; // List of subject codes this staff teaches
}

export interface BreakInfo {
  name: string;
  after: number;
}

export interface TimetableSettings {
  periodsPerDay: number;
  periodTimings: string[];
  breaks: BreakInfo[];
  hardConstraints: {
    noTeacherOverlap: boolean;
    exactSubjectCounts: boolean;
    preserveLockedSlots: boolean;
  };
  softConstraints: {
    loadBalancing: boolean;
    priorityScheduling: boolean;
    labClustering: boolean;
    teacherPreferences: boolean;
    requireBackupTeacher: boolean;
  };
}

export interface TimeSlot {
  day: string;
  period: number;
  subjectId: string | null;
  staffId: string | null;
  isBreak?: boolean;
  breakName?: string;
  locked?: boolean;
  absent?: boolean;
  reminderSent?: boolean;
}

// Define TimetableEntry type for the UI representation
export interface TimetableEntry {
  subject: string;
  title: string;
  staff: string;
  continuous?: boolean;
  span?: number;
}

// TimetableData type for the UI representation
export interface TimetableData {
  [key: string]: TimetableEntry[];
}

export interface TimetableDraft {
  id: string;
  name: string;
  year: string;
  dept: string;
  section: string;
  timeSlots: TimeSlot[];
  lastUpdated: Date;
}

export interface ConflictInfo {
  timeSlot1: TimeSlot;
  timeSlot2: TimeSlot;
  type: 'staff' | 'resource';
  description: string;
}

export enum TimetableStatus {
  Draft = 'draft',
  Conflict = 'conflict',
  Proposal = 'proposal',
  Master = 'master'
}

export interface DepartmentTimetable {
  id: string;
  year: string;
  dept: string;
  drafts: Record<string, TimetableDraft>; // Section ID -> Draft
  conflicts: ConflictInfo[];
  masterProposal?: TimeSlot[];
  status: TimetableStatus;
  lastUpdated: Date;
}

// New interfaces for substitution system
export interface Substitution {
  id: string;
  slotId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  createdAt: Date;
  day: string;
  period: number;
  section: string;
  dept: string;
  year: string;
}

export interface Notification {
  id: string;
  type: 'substitution' | 'reminder' | 'announcement';
  recipientId: string;
  payload: any;
  sentAt?: Date;
  read?: boolean;
}

// New interfaces for app state
export interface RecentUpdate {
  id: string;
  time: Date;
  message: string;
  type: 'substitution' | 'timetable' | 'staff' | 'subject' | 'notification' | 'master';
  relatedId?: string;
}

export interface AppState {
  staffList: Staff[];
  subjectList: Subject[];
  timetables: Record<string, {
    status: TimetableStatus;
    grid: TimetableData;
  }>;
  masterCards: Array<{
    sectionKey: string;
    year: string;
    dept: string;
    section: string;
    createdAt: Date;
    lastEdited: Date;
    status: 'Confirmed' | 'Pending';
    grid: TimetableData;
  }>;
  recentUpdates: RecentUpdate[];
  substitutions: Substitution[];
  notifications: Notification[];
  history: {
    undoStack: any[];
    redoStack: any[];
  };
}

// Helper function to create a section key
export const createSectionKey = (year: string, dept: string, section: string): string => {
  return `${year}-${dept}-${section}`;
};
