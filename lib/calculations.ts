import type { TimeBlock, DayTotals, WeeklyTotals, ComparisonResult } from '@/lib/types';

/**
 * Calculate duration between two times in hours
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Duration in decimal hours (e.g., 2.5 for 2 hours 30 minutes)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Handle case where end time is before start time (crossing midnight)
  const durationMinutes = endMinutes >= startMinutes 
    ? endMinutes - startMinutes 
    : (24 * 60 - startMinutes) + endMinutes;
  
  return Number((durationMinutes / 60).toFixed(2));
}

/**
 * Calculate totals for a day by subject type
 * @param timeBlocks - Array of time blocks for a specific day
 * @returns Day totals broken down by subject type
 */
export function calculateDayTotals(timeBlocks: TimeBlock[]): DayTotals {
  const totals: DayTotals = {
    hebrew: 0,
    english: 0,
    break: 0,
    other: 0,
    total: 0,
  };

  timeBlocks.forEach((block) => {
    const duration = calculateDuration(block.startTime, block.endTime);
    
    switch (block.subjectType) {
      case 'hebrew':
        totals.hebrew += duration;
        break;
      case 'english':
        totals.english += duration;
        break;
      case 'break':
        totals.break += duration;
        break;
      case 'other':
        totals.other += duration;
        break;
    }
    
    totals.total += duration;
  });

  // Round to 2 decimal places
  Object.keys(totals).forEach((key) => {
    totals[key as keyof DayTotals] = Number(totals[key as keyof DayTotals].toFixed(2));
  });

  return totals;
}

/**
 * Calculate weekly totals from all three day types
 * Formula: Sunday + (Weekday × 4) + Friday
 * @param sundayBlocks - Time blocks for Sunday
 * @param weekdayBlocks - Time blocks for Monday-Thursday
 * @param fridayBlocks - Time blocks for Friday
 * @returns Weekly totals with breakdown by day type
 */
export function calculateWeeklyTotals(
  sundayBlocks: TimeBlock[],
  weekdayBlocks: TimeBlock[],
  fridayBlocks: TimeBlock[]
): WeeklyTotals {
  const sunday = calculateDayTotals(sundayBlocks);
  const weekday = calculateDayTotals(weekdayBlocks);
  const friday = calculateDayTotals(fridayBlocks);

  const weekly: WeeklyTotals = {
    hebrew: sunday.hebrew + (weekday.hebrew * 4) + friday.hebrew,
    english: sunday.english + (weekday.english * 4) + friday.english,
    break: sunday.break + (weekday.break * 4) + friday.break,
    other: sunday.other + (weekday.other * 4) + friday.other,
    total: sunday.total + (weekday.total * 4) + friday.total,
    breakdown: {
      sunday,
      weekday,
      friday,
    },
  };

  // Round to 2 decimal places
  weekly.hebrew = Number(weekly.hebrew.toFixed(2));
  weekly.english = Number(weekly.english.toFixed(2));
  weekly.break = Number(weekly.break.toFixed(2));
  weekly.other = Number(weekly.other.toFixed(2));
  weekly.total = Number(weekly.total.toFixed(2));

  return weekly;
}

/**
 * Compare class weekly totals against baseline (Belz Montreal)
 * @param classWeekly - Weekly totals for the class being compared
 * @param baselineWeekly - Weekly totals for Belz Montreal baseline
 * @returns Comparison results with differences
 */
export function compareWithBaseline(
  classWeekly: WeeklyTotals,
  baselineWeekly: WeeklyTotals
): ComparisonResult {
  const hebrewDiff = classWeekly.hebrew - baselineWeekly.hebrew;
  const englishDiff = classWeekly.english - baselineWeekly.english;
  const breakDiff = classWeekly.break - baselineWeekly.break;
  const totalDiff = classWeekly.total - baselineWeekly.total;
  
  const percentDiff = baselineWeekly.total > 0
    ? ((totalDiff / baselineWeekly.total) * 100)
    : 0;

  return {
    hebrewDiff: Number(hebrewDiff.toFixed(2)),
    englishDiff: Number(englishDiff.toFixed(2)),
    breakDiff: Number(breakDiff.toFixed(2)),
    totalDiff: Number(totalDiff.toFixed(2)),
    percentDiff: Number(percentDiff.toFixed(2)),
  };
}

/**
 * Format hours for display
 * @param hours - Duration in decimal hours
 * @param short - Use short format (2h 30m) or long format (2.5 hours)
 * @returns Formatted string
 */
export function formatHours(hours: number, short = true): string {
  if (short) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  return `${hours.toFixed(2)} hours`;
}

/**
 * Validate time block data
 * @param block - Partial time block to validate
 * @returns true if valid, false otherwise
 */
export function validateTimeBlock(block: Partial<TimeBlock>): boolean {
  // Required fields
  if (!block.startTime || !block.endTime || !block.subjectType) {
    return false;
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(block.startTime) || !timeRegex.test(block.endTime)) {
    return false;
  }
  
  // Validate subject type
  const validSubjects = ['hebrew', 'english', 'break', 'other'];
  if (!validSubjects.includes(block.subjectType)) {
    return false;
  }
  
  // Ensure end time is after start time (same day)
  const [startHour, startMinute] = block.startTime.split(':').map(Number);
  const [endHour, endMinute] = block.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    return false;
  }
  
  return true;
}
