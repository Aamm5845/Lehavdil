import type { SchoolType } from '@/lib/types';

/**
 * Grade level definitions for Boys School
 * כיתה א through כיתה ט (Grades 1-9)
 */
export const BOYS_GRADES = [
  { value: 1, label: 'כיתה א', labelEn: 'Grade 1' },
  { value: 2, label: 'כיתה ב', labelEn: 'Grade 2' },
  { value: 3, label: 'כיתה ג', labelEn: 'Grade 3' },
  { value: 4, label: 'כיתה ד', labelEn: 'Grade 4' },
  { value: 5, label: 'כיתה ה', labelEn: 'Grade 5' },
  { value: 6, label: 'כיתה ו', labelEn: 'Grade 6' },
  { value: 7, label: 'כיתה ז', labelEn: 'Grade 7' },
  { value: 8, label: 'כיתה ח', labelEn: 'Grade 8' },
  { value: 9, label: 'כיתה ט', labelEn: 'Grade 9' },
];

/**
 * Grade level definitions for Yeshivah School
 * שיעור א through שיעור ג (Shiur 1-3)
 */
export const YESHIVAH_SHIURIM = [
  { value: 1, label: 'שיעור א', labelEn: 'Shiur 1' },
  { value: 2, label: 'שיעור ב', labelEn: 'Shiur 2' },
  { value: 3, label: 'שיעור ג', labelEn: 'Shiur 3' },
];

/**
 * Grade level definitions for Girls School
 * Pre1A, Grade 1 through Grade 12 (13 levels)
 */
export const GIRLS_GRADES = [
  { value: 0, label: 'Pre1A', labelEn: 'Pre1A' },
  { value: 1, label: 'Grade 1', labelEn: 'Grade 1' },
  { value: 2, label: 'Grade 2', labelEn: 'Grade 2' },
  { value: 3, label: 'Grade 3', labelEn: 'Grade 3' },
  { value: 4, label: 'Grade 4', labelEn: 'Grade 4' },
  { value: 5, label: 'Grade 5', labelEn: 'Grade 5' },
  { value: 6, label: 'Grade 6', labelEn: 'Grade 6' },
  { value: 7, label: 'Grade 7', labelEn: 'Grade 7' },
  { value: 8, label: 'Grade 8', labelEn: 'Grade 8' },
  { value: 9, label: 'Grade 9', labelEn: 'Grade 9' },
  { value: 10, label: 'Grade 10', labelEn: 'Grade 10' },
  { value: 11, label: 'Grade 11', labelEn: 'Grade 11' },
  { value: 12, label: 'Grade 12', labelEn: 'Grade 12' },
];

/**
 * Get grade options by school type
 */
export function getGradesBySchoolType(type: SchoolType) {
  switch (type) {
    case 'boys':
      return BOYS_GRADES;
    case 'yeshivah':
      return YESHIVAH_SHIURIM;
    case 'girls':
      return GIRLS_GRADES;
    default:
      return [];
  }
}

/**
 * Get default class name based on school type and grade level
 */
export function getDefaultClassName(type: SchoolType, gradeLevel: number): string {
  const grades = getGradesBySchoolType(type);
  const grade = grades.find(g => g.value === gradeLevel);
  return grade ? grade.label : '';
}

/**
 * Get grade level number from class name
 */
export function getGradeLevelNumber(type: SchoolType, name: string): number {
  const grades = getGradesBySchoolType(type);
  const grade = grades.find(g => g.label === name);
  return grade ? grade.value : -1;
}

/**
 * Validate if grade level is valid for school type
 */
export function isValidGradeLevel(type: SchoolType, gradeLevel: number): boolean {
  const grades = getGradesBySchoolType(type);
  return grades.some(g => g.value === gradeLevel);
}

/**
 * Get grade range for school type
 */
export function getGradeRange(type: SchoolType): { min: number; max: number } {
  const grades = getGradesBySchoolType(type);
  if (grades.length === 0) return { min: 0, max: 0 };
  return {
    min: grades[0].value,
    max: grades[grades.length - 1].value,
  };
}

/**
 * Format school type for display
 */
export function formatSchoolType(type: SchoolType, lang: 'en' | 'he' = 'en'): string {
  const labels = {
    boys: { en: 'Boys', he: 'בנים' },
    yeshivah: { en: 'Yeshivah', he: 'ישיבה' },
    girls: { en: 'Girls', he: 'בנות' },
  };
  return labels[type][lang];
}

/**
 * Get badge variant for school type (for UI styling)
 */
export function getSchoolTypeVariant(type: SchoolType): 'default' | 'secondary' | 'destructive' {
  switch (type) {
    case 'boys':
      return 'default';
    case 'yeshivah':
      return 'destructive';
    case 'girls':
      return 'secondary';
    default:
      return 'default';
  }
}
