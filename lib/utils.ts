import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SchoolType } from "@/lib/types"
import { getDefaultClassName as getGradeName, getGradesBySchoolType, formatSchoolType as formatSchoolTypeInternal, getSchoolTypeVariant } from "@/lib/grade-levels"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate default class name based on school type and grade level
 * Boys: כיתה א through כיתה ט (Hebrew)
 * Yeshivah: שיעור א through שיעור ג (Hebrew)
 * Girls: Pre1A, Grade 1 through Grade 12 (English)
 */
export function getDefaultClassName(schoolType: SchoolType, gradeLevel: number): string {
  return getGradeName(schoolType, gradeLevel);
}

/**
 * Get grade options for a specific school type
 */
export function getGradeOptions(schoolType: SchoolType) {
  return getGradesBySchoolType(schoolType);
}

/**
 * Format school type for display
 */
export function formatSchoolType(type: SchoolType, lang: 'en' | 'he' = 'en'): string {
  return formatSchoolTypeInternal(type, lang);
}

/**
 * Get badge variant/color for school type
 */
export function getSchoolTypeColor(type: SchoolType): 'default' | 'secondary' | 'destructive' {
  return getSchoolTypeVariant(type);
}

/**
 * Format time duration for display
 * @param hours - Duration in decimal hours (e.g., 2.5)
 * @returns Formatted string like "2h 30m" or "2.5 hours"
 */
export function formatDuration(hours: number, short = false): string {
  if (short) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${hours.toFixed(2)} hours`;
}
