import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { DayType } from '@/lib/types';

type Break = { start: string; end: string; label?: string };

type BulkBody = {
  classIds: string[];
  dayType: DayType;
  hebrewStart: string;
  englishStart: string;
  endTime: string;
  hebrewBreaks?: Break[];
  englishBreaks?: Break[];
};

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function validate(body: BulkBody) {
  if (!Array.isArray(body.classIds) || body.classIds.length === 0) throw new Error('classIds required');
  if (!['sunday', 'weekday', 'friday'].includes(body.dayType)) throw new Error('Invalid dayType');
  for (const f of ['hebrewStart', 'englishStart', 'endTime'] as const) {
    if (!HHMM.test(body[f])) throw new Error(`${f} must be HH:MM`);
  }
  if (toMin(body.hebrewStart) >= toMin(body.englishStart)) {
    throw new Error('hebrewStart must be before englishStart');
  }
  if (toMin(body.englishStart) >= toMin(body.endTime)) {
    throw new Error('englishStart must be before endTime');
  }
  const check = (breaks: Break[] | undefined, lo: number, hi: number, label: string) => {
    if (!breaks) return;
    let prevEnd = lo;
    const sorted = [...breaks].sort((a, b) => toMin(a.start) - toMin(b.start));
    for (const b of sorted) {
      if (!HHMM.test(b.start) || !HHMM.test(b.end)) throw new Error(`${label} break has invalid time`);
      const s = toMin(b.start);
      const e = toMin(b.end);
      if (s >= e) throw new Error(`${label} break ${b.start}-${b.end}: start must be before end`);
      if (s < lo || e > hi) throw new Error(`${label} break ${b.start}-${b.end} is outside the ${label} period`);
      if (s < prevEnd) throw new Error(`${label} break ${b.start}-${b.end} overlaps the previous one`);
      prevEnd = e;
    }
  };
  check(body.hebrewBreaks, toMin(body.hebrewStart), toMin(body.englishStart), 'hebrew');
  check(body.englishBreaks, toMin(body.englishStart), toMin(body.endTime), 'english');
}

type GenBlock = { startTime: string; endTime: string; subjectType: 'hebrew' | 'english' | 'break'; description: string | null };

function generate(body: BulkBody): GenBlock[] {
  const out: GenBlock[] = [];
  const sect = (
    periodStart: string,
    periodEnd: string,
    subj: 'hebrew' | 'english',
    breaks: Break[] | undefined
  ) => {
    const sorted = [...(breaks ?? [])].sort((a, b) => toMin(a.start) - toMin(b.start));
    let cursor = periodStart;
    for (const b of sorted) {
      if (cursor !== b.start) {
        out.push({ startTime: cursor, endTime: b.start, subjectType: subj, description: null });
      }
      out.push({ startTime: b.start, endTime: b.end, subjectType: 'break', description: b.label ?? null });
      cursor = b.end;
    }
    if (cursor !== periodEnd) {
      out.push({ startTime: cursor, endTime: periodEnd, subjectType: subj, description: null });
    }
  };
  sect(body.hebrewStart, body.englishStart, 'hebrew', body.hebrewBreaks);
  sect(body.englishStart, body.endTime, 'english', body.englishBreaks);
  return out;
}

const anchorFields = (dayType: DayType, hebrewStart: string, englishStart: string, endTime: string) => {
  const prefix = dayType === 'weekday' ? 'weekday' : dayType;
  return {
    [`${prefix}Start`]: hebrewStart,
    [`${prefix}EnglishStart`]: englishStart,
    [`${prefix}End`]: endTime,
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BulkBody;
    validate(body);

    const generated = generate(body);
    const classIdsNum = body.classIds.map((id) => Number(id));

    await prisma.$transaction(
      async (tx) => {
        // Wipe existing blocks for selected classes + day, then re-insert.
        await tx.timeBlock.deleteMany({
          where: { classId: { in: classIdsNum }, dayType: body.dayType },
        });

        for (const classId of classIdsNum) {
          await tx.timeBlock.createMany({
            data: generated.map((b, i) => ({
              classId,
              dayType: body.dayType,
              startTime: b.startTime,
              endTime: b.endTime,
              subjectType: b.subjectType,
              description: b.description,
              sortOrder: i,
            })),
          });
          await tx.class.update({
            where: { id: classId },
            data: anchorFields(body.dayType, body.hebrewStart, body.englishStart, body.endTime),
          });
        }
      },
      { maxWait: 10_000, timeout: 30_000 }
    );

    return NextResponse.json({
      ok: true,
      classCount: classIdsNum.length,
      blocksPerClass: generated.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to save bulk schedule';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
