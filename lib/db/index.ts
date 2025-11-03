// Database connection utility with persistent JSON storage
import type { City, Community, School, Class, TimeBlock, SchoolType } from '@/lib/types';
import { isValidGradeLevel } from '@/lib/grade-levels';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface Database {
  cities: City[];
  communities: Community[];
  schools: School[];
  classes: Class[];
  timeBlocks: TimeBlock[];
  nextId: number;
}

// Initialize database
function initDB(): Database {
  return {
    cities: [],
    communities: [],
    schools: [],
    classes: [],
    timeBlocks: [],
    nextId: 1,
  };
}

// Read database
function readDB(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const db = initDB();
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      return db;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return initDB();
  }
}

// Write database
function writeDB(db: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

// Cities
export async function getCities(): Promise<City[]> {
  const db = readDB();
  return db.cities;
}

export async function getCity(id: string): Promise<City | undefined> {
  const db = readDB();
  return db.cities.find(c => c.id === id);
}

export async function createCity(data: { nameEn: string; nameHe?: string; country: string }): Promise<City> {
  const db = readDB();
  const city: City = {
    id: String(db.nextId++),
    nameEn: data.nameEn,
    nameHe: data.nameHe,
    country: data.country,
    createdAt: new Date(),
  };
  db.cities.push(city);
  writeDB(db);
  return city;
}

export async function updateCity(id: string, data: { nameEn: string; nameHe?: string; country: string }): Promise<City> {
  const db = readDB();
  const index = db.cities.findIndex(c => c.id === id);
  if (index === -1) throw new Error('City not found');
  
  db.cities[index] = {
    ...db.cities[index],
    nameEn: data.nameEn,
    nameHe: data.nameHe,
    country: data.country,
  };
  writeDB(db);
  return db.cities[index];
}

export async function deleteCity(id: string): Promise<void> {
  const db = readDB();
  db.cities = db.cities.filter(c => c.id !== id);
  db.communities = db.communities.filter(c => c.cityId !== id);
  const communityIds = db.communities.filter(c => c.cityId === id).map(c => c.id);
  db.schools = db.schools.filter(s => !communityIds.includes(s.communityId));
  const schoolIds = db.schools.filter(s => communityIds.includes(s.communityId)).map(s => s.id);
  db.classes = db.classes.filter(c => !schoolIds.includes(c.schoolId));
  const classIds = db.classes.filter(c => schoolIds.includes(c.schoolId)).map(c => c.id);
  db.timeBlocks = db.timeBlocks.filter(tb => !classIds.includes(tb.classId));
  writeDB(db);
}

// Communities
export async function getCommunities(cityId?: string): Promise<Community[]> {
  const db = readDB();
  if (cityId) return db.communities.filter(c => c.cityId === cityId);
  return db.communities;
}

export async function getCommunity(id: string): Promise<Community | undefined> {
  const db = readDB();
  return db.communities.find(c => c.id === id);
}

export async function createCommunity(data: { cityId: string; nameEn: string; nameHe?: string }): Promise<Community> {
  const db = readDB();
  const community: Community = {
    id: String(db.nextId++),
    cityId: data.cityId,
    nameEn: data.nameEn,
    nameHe: data.nameHe,
    createdAt: new Date(),
  };
  db.communities.push(community);
  writeDB(db);
  return community;
}

export async function updateCommunity(id: string, data: { cityId: string; nameEn: string; nameHe?: string }): Promise<Community> {
  const db = readDB();
  const index = db.communities.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Community not found');
  
  db.communities[index] = {
    ...db.communities[index],
    cityId: data.cityId,
    nameEn: data.nameEn,
    nameHe: data.nameHe,
  };
  writeDB(db);
  return db.communities[index];
}

export async function deleteCommunity(id: string): Promise<void> {
  const db = readDB();
  db.communities = db.communities.filter(c => c.id !== id);
  const schoolIds = db.schools.filter(s => s.communityId === id).map(s => s.id);
  db.schools = db.schools.filter(s => s.communityId !== id);
  const classIds = db.classes.filter(c => schoolIds.includes(c.schoolId)).map(c => c.id);
  db.classes = db.classes.filter(c => !schoolIds.includes(c.schoolId));
  db.timeBlocks = db.timeBlocks.filter(tb => !classIds.includes(tb.classId));
  writeDB(db);
}

// Schools
export async function getSchools(communityId?: string): Promise<School[]> {
  const db = readDB();
  if (communityId) return db.schools.filter(s => s.communityId === communityId);
  return db.schools;
}

export async function getSchool(id: string): Promise<School | undefined> {
  const db = readDB();
  return db.schools.find(s => s.id === id);
}

export async function createSchool(data: { communityId: string; schoolType: 'boys' | 'yeshivah' | 'girls'; nameEn: string; nameHe?: string; isBaseline?: boolean }): Promise<School> {
  const db = readDB();
  const school: School = {
    id: String(db.nextId++),
    communityId: data.communityId,
    schoolType: data.schoolType,
    nameEn: data.nameEn,
    nameHe: data.nameHe,
    isBaseline: data.isBaseline,
    createdAt: new Date(),
  };
  db.schools.push(school);
  writeDB(db);
  return school;
}

export async function updateSchool(id: string, data: { communityId: string; schoolType: 'boys' | 'yeshivah' | 'girls'; nameEn: string; nameHe?: string; isBaseline?: boolean }): Promise<School> {
  const db = readDB();
  const index = db.schools.findIndex(s => s.id === id);
  if (index === -1) throw new Error('School not found');
  
  db.schools[index] = {
    ...db.schools[index],
    communityId: data.communityId,
    schoolType: data.schoolType,
    nameEn: data.nameEn,
    nameHe: data.nameHe,
    isBaseline: data.isBaseline,
  };
  writeDB(db);
  return db.schools[index];
}

export async function deleteSchool(id: string): Promise<void> {
  const db = readDB();
  db.schools = db.schools.filter(s => s.id !== id);
  const classIds = db.classes.filter(c => c.schoolId === id).map(c => c.id);
  db.classes = db.classes.filter(c => c.schoolId !== id);
  db.timeBlocks = db.timeBlocks.filter(tb => !classIds.includes(tb.classId));
  writeDB(db);
}

// Helper function to get school type
export async function getSchoolType(schoolId: string): Promise<SchoolType | null> {
  const db = readDB();
  const school = db.schools.find(s => s.id === schoolId);
  return school ? school.schoolType : null;
}

// Classes
export async function getClasses(schoolId?: string): Promise<Class[]> {
  const db = readDB();
  if (schoolId) return db.classes.filter(c => c.schoolId === schoolId);
  return db.classes;
}

export async function getClass(id: string): Promise<Class | undefined> {
  const db = readDB();
  return db.classes.find(c => c.id === id);
}

export async function createClass(data: { schoolId: string; name: string; gradeLevel: number }): Promise<Class> {
  const db = readDB();
  
  // Validate grade level against school type
  const school = db.schools.find(s => s.id === data.schoolId);
  if (!school) throw new Error('School not found');
  
  if (!isValidGradeLevel(school.schoolType, data.gradeLevel)) {
    throw new Error(`Invalid grade level ${data.gradeLevel} for ${school.schoolType} school`);
  }
  
  const classItem: Class = {
    id: String(db.nextId++),
    schoolId: data.schoolId,
    name: data.name,
    gradeLevel: data.gradeLevel,
    createdAt: new Date(),
  };
  db.classes.push(classItem);
  writeDB(db);
  return classItem;
}

export async function updateClass(id: string, data: any): Promise<Class> {
  const db = readDB();
  const index = db.classes.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Class not found');
  
  // Validate grade level against school type
  const school = db.schools.find(s => s.id === data.schoolId);
  if (!school) throw new Error('School not found');
  
  if (!isValidGradeLevel(school.schoolType, data.gradeLevel)) {
    throw new Error(`Invalid grade level ${data.gradeLevel} for ${school.schoolType} school`);
  }
  
  db.classes[index] = {
    ...db.classes[index],
    ...data,
  };
  writeDB(db);
  return db.classes[index];
}

export async function deleteClass(id: string): Promise<void> {
  const db = readDB();
  db.classes = db.classes.filter(c => c.id !== id);
  db.timeBlocks = db.timeBlocks.filter(tb => tb.classId !== id);
  writeDB(db);
}

// Time Blocks
export async function getTimeBlocks(classId?: string): Promise<TimeBlock[]> {
  const db = readDB();
  if (classId) return db.timeBlocks.filter(tb => tb.classId === classId);
  return db.timeBlocks;
}

export async function createTimeBlock(data: any): Promise<TimeBlock> {
  const db = readDB();
  const timeBlock: TimeBlock = {
    id: String(db.nextId++),
    classId: data.classId,
    dayType: data.dayType,
    startTime: data.startTime,
    endTime: data.endTime,
    subjectType: data.subjectType,
    description: data.description,
    teacher: data.teacher,
    sortOrder: data.sortOrder || 0,
    createdAt: new Date(),
  };
  db.timeBlocks.push(timeBlock);
  writeDB(db);
  return timeBlock;
}

export async function updateTimeBlock(id: string, data: any): Promise<TimeBlock> {
  const db = readDB();
  const index = db.timeBlocks.findIndex(tb => tb.id === id);
  if (index === -1) throw new Error('Time block not found');
  
  db.timeBlocks[index] = {
    ...db.timeBlocks[index],
    ...data,
  };
  writeDB(db);
  return db.timeBlocks[index];
}

export async function deleteTimeBlock(id: string): Promise<void> {
  const db = readDB();
  db.timeBlocks = db.timeBlocks.filter(tb => tb.id !== id);
  writeDB(db);
}
