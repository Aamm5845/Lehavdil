import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Returns one row per school that has any time blocks, including which day
 * types are populated. Used on the dashboard so the user can immediately see
 * which schools already have schedules instead of clicking into each one.
 */
export async function GET() {
  try {
    type Row = {
      schoolId: number;
      schoolNameEn: string;
      schoolNameHe: string | null;
      schoolType: string;
      cityId: number;
      cityNameEn: string;
      communityId: number;
      communityNameEn: string;
      dayType: string;
      classesWithSchedule: bigint;
    };

    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        s.id            AS "schoolId",
        s."nameEn"      AS "schoolNameEn",
        s."nameHe"      AS "schoolNameHe",
        s."schoolType"  AS "schoolType",
        ci.id           AS "cityId",
        ci."nameEn"     AS "cityNameEn",
        c.id            AS "communityId",
        c."nameEn"      AS "communityNameEn",
        tb."dayType"    AS "dayType",
        COUNT(DISTINCT tb."classId") AS "classesWithSchedule"
      FROM "TimeBlock" tb
      JOIN "Class" cl       ON cl.id = tb."classId"
      JOIN "School" s       ON s.id = cl."schoolId"
      JOIN "Community" c    ON c.id = s."communityId"
      JOIN "City" ci        ON ci.id = c."cityId"
      GROUP BY s.id, s."nameEn", s."nameHe", s."schoolType",
               ci.id, ci."nameEn", c.id, c."nameEn", tb."dayType"
      ORDER BY ci."nameEn", c."nameEn", s."nameEn"
    `;

    // Roll up by school
    type Out = {
      schoolId: string;
      schoolNameEn: string;
      schoolNameHe: string | null;
      schoolType: string;
      cityId: string;
      cityNameEn: string;
      communityId: string;
      communityNameEn: string;
      days: { dayType: string; classCount: number }[];
    };
    const map = new Map<number, Out>();
    for (const r of rows) {
      const existing = map.get(r.schoolId);
      const entry = {
        dayType: r.dayType,
        classCount: Number(r.classesWithSchedule),
      };
      if (existing) {
        existing.days.push(entry);
      } else {
        map.set(r.schoolId, {
          schoolId: String(r.schoolId),
          schoolNameEn: r.schoolNameEn,
          schoolNameHe: r.schoolNameHe,
          schoolType: r.schoolType,
          cityId: String(r.cityId),
          cityNameEn: r.cityNameEn,
          communityId: String(r.communityId),
          communityNameEn: r.communityNameEn,
          days: [entry],
        });
      }
    }

    return NextResponse.json({ schools: Array.from(map.values()) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load schedule status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
