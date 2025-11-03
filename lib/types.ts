// Type Definitions for Lehavdil

export type SchoolType = 'boys' | 'yeshivah' | 'girls';
export type DayType = 'sunday' | 'weekday' | 'friday';
export type SubjectType = 'bus-start' | 'hebrew' | 'english' | 'break' | 'other';

export interface City {
  id: string;
  nameEn: string;
  nameHe?: string;
  country: string;
  createdAt: Date;
}

export interface Community {
  id: string;
  cityId: string;
  nameEn: string;
  nameHe?: string;
  createdAt: Date;
}

export interface School {
  id: string;
  communityId: string;
  schoolType: SchoolType;
  nameEn: string;
  nameHe?: string;
  isBaseline?: boolean;
  createdAt: Date;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: number;
  // Start and end times per day type
  sundayStart?: string;  // HH:MM format
  sundayEnd?: string;
  weekdayStart?: string;
  weekdayEnd?: string;
  fridayStart?: string;
  fridayEnd?: string;
  createdAt: Date;
}

export interface TimeBlock {
  id: string;
  classId: string;
  dayType: DayType;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  subjectType: SubjectType;
  description?: string;
  teacher?: string;
  sortOrder: number;
  createdAt: Date;
}

// Calculation Types
export interface DayTotals {
  hebrew: number;
  english: number;
  break: number;
  other: number;
  total: number;
}

export interface WeeklyTotals extends DayTotals {
  breakdown: {
    sunday: DayTotals;
    weekday: DayTotals;
    friday: DayTotals;
  };
}

export interface ComparisonResult {
  hebrewDiff: number;
  englishDiff: number;
  breakDiff: number;
  totalDiff: number;
  percentDiff: number;
}

// Extended types with relationships
export interface CityWithCommunities extends City {
  communities?: Community[];
}

export interface CommunityWithSchools extends Community {
  schools?: School[];
  city?: City;
}

export interface SchoolWithClasses extends School {
  classes?: Class[];
  community?: Community;
}

export interface ClassWithTimeBlocks extends Class {
  timeBlocks?: TimeBlock[];
  school?: School;
}
