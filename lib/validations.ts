import { z } from 'zod';

// City validation
export const citySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameHe: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

export type CityInput = z.infer<typeof citySchema>;

// Community validation
export const communitySchema = z.object({
  cityId: z.string().min(1, 'City is required'),
  nameEn: z.string().min(1, 'English name is required'),
  nameHe: z.string().optional(),
});

export type CommunityInput = z.infer<typeof communitySchema>;

// School validation
export const schoolSchema = z.object({
  communityId: z.string().min(1, 'Community is required'),
  nameEn: z.string().min(1, 'English name is required'),
  nameHe: z.string().optional(),
  schoolType: z.enum(['boys', 'girls'], 'School type is required'),
  isBaseline: z.boolean().optional(),
});

export type SchoolInput = z.infer<typeof schoolSchema>;

// Class validation
export const classSchema = z.object({
  schoolId: z.string().min(1, 'School is required'),
  name: z.string().min(1, 'Class name is required'),
  gradeLevel: z.number().min(1).max(8, 'Grade level must be between 1 and 8'),
});

export type ClassInput = z.infer<typeof classSchema>;

// Time block validation
export const timeBlockSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  dayType: z.enum(['sunday', 'weekday', 'friday'], 'Day type is required'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  subjectType: z.enum(['bus-start', 'class-start', 'hebrew', 'english', 'break', 'end-day', 'other'], 'Subject type is required'),
  description: z.string().optional(),
  teacher: z.string().optional(),
  sortOrder: z.number().default(0),
}).refine(
  (data) => {
    // Validate that endTime is after startTime
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export type TimeBlockInput = z.infer<typeof timeBlockSchema>;
