import type { City, Community, School, Class, TimeBlock, SchoolType, DayType, SubjectType } from '@/lib/types';
import { isValidGradeLevel } from '@/lib/grade-levels';
import { prisma } from '@/lib/prisma';

type DbCity = { id: number; nameEn: string; nameHe: string | null; country: string; createdAt: Date };
type DbCommunity = { id: number; cityId: number; nameEn: string; nameHe: string | null; createdAt: Date };
type DbSchool = { id: number; communityId: number; schoolType: string; nameEn: string; nameHe: string | null; isBaseline: boolean; createdAt: Date };
type DbClass = {
  id: number;
  schoolId: number;
  name: string;
  gradeLevel: number;
  sundayStart: string | null;
  sundayEnglishStart: string | null;
  sundayEnd: string | null;
  sundayClosed: boolean;
  weekdayStart: string | null;
  weekdayEnglishStart: string | null;
  weekdayEnd: string | null;
  weekdayClosed: boolean;
  fridayStart: string | null;
  fridayEnglishStart: string | null;
  fridayEnd: string | null;
  fridayClosed: boolean;
  createdAt: Date;
};
type DbTimeBlock = { id: number; classId: number; dayType: string; startTime: string; endTime: string; subjectType: string; description: string | null; teacher: string | null; sortOrder: number; createdAt: Date };

const undef = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

const toCity = (c: DbCity): City => ({
  id: String(c.id),
  nameEn: c.nameEn,
  nameHe: undef(c.nameHe),
  country: c.country,
  createdAt: c.createdAt,
});

const toCommunity = (c: DbCommunity): Community => ({
  id: String(c.id),
  cityId: String(c.cityId),
  nameEn: c.nameEn,
  nameHe: undef(c.nameHe),
  createdAt: c.createdAt,
});

const toSchool = (s: DbSchool): School => ({
  id: String(s.id),
  communityId: String(s.communityId),
  schoolType: s.schoolType as SchoolType,
  nameEn: s.nameEn,
  nameHe: undef(s.nameHe),
  isBaseline: s.isBaseline,
  createdAt: s.createdAt,
});

const toClass = (c: DbClass): Class => ({
  id: String(c.id),
  schoolId: String(c.schoolId),
  name: c.name,
  gradeLevel: c.gradeLevel,
  sundayStart: undef(c.sundayStart),
  sundayEnglishStart: undef(c.sundayEnglishStart),
  sundayEnd: undef(c.sundayEnd),
  sundayClosed: c.sundayClosed,
  weekdayStart: undef(c.weekdayStart),
  weekdayEnglishStart: undef(c.weekdayEnglishStart),
  weekdayEnd: undef(c.weekdayEnd),
  weekdayClosed: c.weekdayClosed,
  fridayStart: undef(c.fridayStart),
  fridayEnglishStart: undef(c.fridayEnglishStart),
  fridayEnd: undef(c.fridayEnd),
  fridayClosed: c.fridayClosed,
  createdAt: c.createdAt,
});

const toTimeBlock = (t: DbTimeBlock): TimeBlock => ({
  id: String(t.id),
  classId: String(t.classId),
  dayType: t.dayType as DayType,
  startTime: t.startTime,
  endTime: t.endTime,
  subjectType: t.subjectType as SubjectType,
  description: undef(t.description),
  teacher: undef(t.teacher),
  sortOrder: t.sortOrder,
  createdAt: t.createdAt,
});

// Cities
export async function getCities(): Promise<City[]> {
  const rows = await prisma.city.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toCity);
}

export async function getCity(id: string): Promise<City | undefined> {
  const row = await prisma.city.findUnique({ where: { id: Number(id) } });
  return row ? toCity(row) : undefined;
}

export async function createCity(data: { nameEn: string; nameHe?: string; country: string }): Promise<City> {
  const row = await prisma.city.create({
    data: { nameEn: data.nameEn, nameHe: data.nameHe ?? null, country: data.country },
  });
  return toCity(row);
}

export async function updateCity(id: string, data: { nameEn: string; nameHe?: string; country: string }): Promise<City> {
  const row = await prisma.city.update({
    where: { id: Number(id) },
    data: { nameEn: data.nameEn, nameHe: data.nameHe ?? null, country: data.country },
  });
  return toCity(row);
}

export async function deleteCity(id: string): Promise<void> {
  await prisma.city.delete({ where: { id: Number(id) } });
}

// Communities
export async function getCommunities(cityId?: string): Promise<Community[]> {
  const rows = await prisma.community.findMany({
    where: cityId ? { cityId: Number(cityId) } : undefined,
    orderBy: { id: 'asc' },
  });
  return rows.map(toCommunity);
}

export async function getCommunity(id: string): Promise<Community | undefined> {
  const row = await prisma.community.findUnique({ where: { id: Number(id) } });
  return row ? toCommunity(row) : undefined;
}

export async function createCommunity(data: { cityId: string; nameEn: string; nameHe?: string }): Promise<Community> {
  const row = await prisma.community.create({
    data: { cityId: Number(data.cityId), nameEn: data.nameEn, nameHe: data.nameHe ?? null },
  });
  return toCommunity(row);
}

export async function updateCommunity(id: string, data: { cityId: string; nameEn: string; nameHe?: string }): Promise<Community> {
  const row = await prisma.community.update({
    where: { id: Number(id) },
    data: { cityId: Number(data.cityId), nameEn: data.nameEn, nameHe: data.nameHe ?? null },
  });
  return toCommunity(row);
}

export async function deleteCommunity(id: string): Promise<void> {
  await prisma.community.delete({ where: { id: Number(id) } });
}

// Schools
export async function getSchools(communityId?: string): Promise<School[]> {
  const rows = await prisma.school.findMany({
    where: communityId ? { communityId: Number(communityId) } : undefined,
    orderBy: { id: 'asc' },
  });
  return rows.map(toSchool);
}

export async function getSchool(id: string): Promise<School | undefined> {
  const row = await prisma.school.findUnique({ where: { id: Number(id) } });
  return row ? toSchool(row) : undefined;
}

export async function createSchool(data: { communityId: string; schoolType: 'boys' | 'yeshivah' | 'girls'; nameEn: string; nameHe?: string; isBaseline?: boolean }): Promise<School> {
  const row = await prisma.school.create({
    data: {
      communityId: Number(data.communityId),
      schoolType: data.schoolType,
      nameEn: data.nameEn,
      nameHe: data.nameHe ?? null,
      isBaseline: data.isBaseline ?? false,
    },
  });
  return toSchool(row);
}

export async function updateSchool(id: string, data: { communityId: string; schoolType: 'boys' | 'yeshivah' | 'girls'; nameEn: string; nameHe?: string; isBaseline?: boolean }): Promise<School> {
  const row = await prisma.school.update({
    where: { id: Number(id) },
    data: {
      communityId: Number(data.communityId),
      schoolType: data.schoolType,
      nameEn: data.nameEn,
      nameHe: data.nameHe ?? null,
      isBaseline: data.isBaseline ?? false,
    },
  });
  return toSchool(row);
}

export async function deleteSchool(id: string): Promise<void> {
  await prisma.school.delete({ where: { id: Number(id) } });
}

export async function getSchoolType(schoolId: string): Promise<SchoolType | null> {
  const row = await prisma.school.findUnique({ where: { id: Number(schoolId) }, select: { schoolType: true } });
  return row ? (row.schoolType as SchoolType) : null;
}

// Classes
export async function getClasses(schoolId?: string): Promise<Class[]> {
  const rows = await prisma.class.findMany({
    where: schoolId ? { schoolId: Number(schoolId) } : undefined,
    orderBy: [{ schoolId: 'asc' }, { gradeLevel: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toClass);
}

export async function getClass(id: string): Promise<Class | undefined> {
  const row = await prisma.class.findUnique({ where: { id: Number(id) } });
  return row ? toClass(row) : undefined;
}

export async function createClass(data: { schoolId: string; name: string; gradeLevel: number }): Promise<Class> {
  const school = await prisma.school.findUnique({ where: { id: Number(data.schoolId) }, select: { schoolType: true } });
  if (!school) throw new Error('School not found');
  if (!isValidGradeLevel(school.schoolType as SchoolType, data.gradeLevel)) {
    throw new Error(`Invalid grade level ${data.gradeLevel} for ${school.schoolType} school`);
  }
  const row = await prisma.class.create({
    data: { schoolId: Number(data.schoolId), name: data.name, gradeLevel: data.gradeLevel },
  });
  return toClass(row);
}

// Accept partial patches (including the per-day time fields). Keeps origin's
// flexible signature so /api/classes/[id] PUT can update any subset.
type ClassPatch = Partial<{
  schoolId: string;
  name: string;
  gradeLevel: number;
  sundayStart: string | null;
  sundayEnglishStart: string | null;
  sundayEnd: string | null;
  weekdayStart: string | null;
  weekdayEnglishStart: string | null;
  weekdayEnd: string | null;
  fridayStart: string | null;
  fridayEnglishStart: string | null;
  fridayEnd: string | null;
}>;

export async function updateClass(id: string, data: ClassPatch): Promise<Class> {
  const update: Record<string, unknown> = {};
  if (data.schoolId !== undefined) update.schoolId = Number(data.schoolId);
  if (data.name !== undefined) update.name = data.name;
  if (data.gradeLevel !== undefined) update.gradeLevel = data.gradeLevel;
  for (const k of [
    'sundayStart', 'sundayEnglishStart', 'sundayEnd',
    'weekdayStart', 'weekdayEnglishStart', 'weekdayEnd',
    'fridayStart', 'fridayEnglishStart', 'fridayEnd',
  ] as const) {
    if (data[k] !== undefined) update[k] = data[k];
  }

  // Validate grade level against school type when either field is changing.
  if (data.gradeLevel !== undefined || data.schoolId !== undefined) {
    const existing = await prisma.class.findUnique({ where: { id: Number(id) }, select: { schoolId: true, gradeLevel: true } });
    if (!existing) throw new Error('Class not found');
    const schoolId = data.schoolId !== undefined ? Number(data.schoolId) : existing.schoolId;
    const gradeLevel = data.gradeLevel !== undefined ? data.gradeLevel : existing.gradeLevel;
    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { schoolType: true } });
    if (!school) throw new Error('School not found');
    if (!isValidGradeLevel(school.schoolType as SchoolType, gradeLevel)) {
      throw new Error(`Invalid grade level ${gradeLevel} for ${school.schoolType} school`);
    }
  }

  const row = await prisma.class.update({ where: { id: Number(id) }, data: update });
  return toClass(row);
}

export async function deleteClass(id: string): Promise<void> {
  await prisma.class.delete({ where: { id: Number(id) } });
}

// Time Blocks
export async function getTimeBlocks(classId?: string, opts?: { dayType?: DayType; classIds?: string[] }): Promise<TimeBlock[]> {
  const where: { classId?: number | { in: number[] }; dayType?: DayType } = {};
  if (classId) {
    where.classId = Number(classId);
  } else if (opts?.classIds && opts.classIds.length > 0) {
    where.classId = { in: opts.classIds.map((id) => Number(id)) };
  }
  if (opts?.dayType) where.dayType = opts.dayType;

  const rows = await prisma.timeBlock.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: [{ classId: 'asc' }, { dayType: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toTimeBlock);
}

export async function createTimeBlock(data: {
  classId: string;
  dayType: DayType;
  startTime: string;
  endTime: string;
  subjectType: SubjectType;
  description?: string;
  teacher?: string;
  sortOrder?: number;
}): Promise<TimeBlock> {
  const row = await prisma.timeBlock.create({
    data: {
      classId: Number(data.classId),
      dayType: data.dayType,
      startTime: data.startTime,
      endTime: data.endTime,
      subjectType: data.subjectType,
      description: data.description ?? null,
      teacher: data.teacher ?? null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return toTimeBlock(row);
}

export async function updateTimeBlock(id: string, data: Partial<{
  classId: string;
  dayType: DayType;
  startTime: string;
  endTime: string;
  subjectType: SubjectType;
  description: string | null;
  teacher: string | null;
  sortOrder: number;
}>): Promise<TimeBlock> {
  const update: Record<string, unknown> = {};
  if (data.classId !== undefined) update.classId = Number(data.classId);
  if (data.dayType !== undefined) update.dayType = data.dayType;
  if (data.startTime !== undefined) update.startTime = data.startTime;
  if (data.endTime !== undefined) update.endTime = data.endTime;
  if (data.subjectType !== undefined) update.subjectType = data.subjectType;
  if (data.description !== undefined) update.description = data.description;
  if (data.teacher !== undefined) update.teacher = data.teacher;
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
  const row = await prisma.timeBlock.update({ where: { id: Number(id) }, data: update });
  return toTimeBlock(row);
}

export async function deleteTimeBlock(id: string): Promise<void> {
  await prisma.timeBlock.delete({ where: { id: Number(id) } });
}
