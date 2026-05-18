/**
 * One-time migration: fetch seed data from lehavdil.vercel.app and load it
 * into the Prisma Postgres database, preserving original IDs so existing
 * URLs (e.g. /dashboard/schools/3/19/81) keep working.
 *
 * Usage: npx tsx scripts/migrate-from-live.ts
 */
import { PrismaClient } from '@prisma/client';

const SOURCE = 'https://lehavdil.vercel.app';
const prisma = new PrismaClient();

type LiveCity = { id: string; nameEn: string; nameHe?: string; country: string; createdAt: string };
type LiveCommunity = { id: string; cityId: string; nameEn: string; nameHe?: string; createdAt: string };
type LiveSchool = { id: string; communityId: string; schoolType: 'boys' | 'yeshivah' | 'girls'; nameEn: string; nameHe?: string; isBaseline?: boolean; createdAt: string };
type LiveClass = {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: number;
  sundayStart?: string;
  sundayEnglishStart?: string;
  sundayEnd?: string;
  weekdayStart?: string;
  weekdayEnglishStart?: string;
  weekdayEnd?: string;
  fridayStart?: string;
  fridayEnglishStart?: string;
  fridayEnd?: string;
  createdAt: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(`${SOURCE}${path}`);
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json() as Promise<T>;
}

async function main() {
  console.log('Fetching from', SOURCE);
  const [{ cities }, { communities }, { schools }, { classes }] = await Promise.all([
    fetchJson<{ cities: LiveCity[] }>('/api/cities'),
    fetchJson<{ communities: LiveCommunity[] }>('/api/communities'),
    fetchJson<{ schools: LiveSchool[] }>('/api/schools'),
    fetchJson<{ classes: LiveClass[] }>('/api/classes'),
  ]);

  console.log(`Got ${cities.length} cities, ${communities.length} communities, ${schools.length} schools, ${classes.length} classes`);

  console.log('Clearing existing tables...');
  await prisma.timeBlock.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.community.deleteMany();
  await prisma.city.deleteMany();

  console.log('Inserting cities...');
  await prisma.$transaction(
    cities.map((c) =>
      prisma.city.create({
        data: {
          id: Number(c.id),
          nameEn: c.nameEn,
          nameHe: c.nameHe ?? null,
          country: c.country,
          createdAt: new Date(c.createdAt),
        },
      })
    )
  );

  console.log('Inserting communities...');
  await prisma.$transaction(
    communities.map((c) =>
      prisma.community.create({
        data: {
          id: Number(c.id),
          cityId: Number(c.cityId),
          nameEn: c.nameEn,
          nameHe: c.nameHe ?? null,
          createdAt: new Date(c.createdAt),
        },
      })
    )
  );

  console.log('Inserting schools...');
  await prisma.$transaction(
    schools.map((s) =>
      prisma.school.create({
        data: {
          id: Number(s.id),
          communityId: Number(s.communityId),
          schoolType: s.schoolType,
          nameEn: s.nameEn,
          nameHe: s.nameHe ?? null,
          isBaseline: s.isBaseline ?? false,
          createdAt: new Date(s.createdAt),
        },
      })
    )
  );

  console.log('Inserting classes...');
  await prisma.$transaction(
    classes.map((c) =>
      prisma.class.create({
        data: {
          id: Number(c.id),
          schoolId: Number(c.schoolId),
          name: c.name,
          gradeLevel: c.gradeLevel,
          sundayStart: c.sundayStart ?? null,
          sundayEnglishStart: c.sundayEnglishStart ?? null,
          sundayEnd: c.sundayEnd ?? null,
          weekdayStart: c.weekdayStart ?? null,
          weekdayEnglishStart: c.weekdayEnglishStart ?? null,
          weekdayEnd: c.weekdayEnd ?? null,
          fridayStart: c.fridayStart ?? null,
          fridayEnglishStart: c.fridayEnglishStart ?? null,
          fridayEnd: c.fridayEnd ?? null,
          createdAt: new Date(c.createdAt),
        },
      })
    )
  );

  console.log('Resetting sequences...');
  for (const table of ['City', 'Community', 'School', 'Class', 'TimeBlock']) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
    );
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
