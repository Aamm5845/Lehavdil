'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';
import type { Class, DayType, SubjectType, TimeBlock } from '@/lib/types';

const DAYS: { value: DayType; label: string }[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'weekday', label: 'Weekdays (Mon–Thu)' },
  { value: 'friday', label: 'Friday' },
];

const SUBJECT_STYLE: Record<SubjectType, string> = {
  hebrew: 'bg-blue-100 text-blue-900 border-blue-200',
  english: 'bg-green-100 text-green-900 border-green-200',
  break: 'bg-amber-100 text-amber-900 border-amber-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
  'bus-start': 'bg-violet-100 text-violet-900 border-violet-200',
};

const SUBJECT_LABEL: Record<SubjectType, string> = {
  hebrew: 'Hebrew',
  english: 'English',
  break: 'Break',
  other: 'Other',
  'bus-start': 'Bus',
};

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export function SchoolScheduleGrid({ classes }: { classes: Class[] }) {
  const [dayType, setDayType] = useState<DayType>('weekday');
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => a.gradeLevel - b.gradeLevel),
    [classes]
  );
  const classIdsParam = useMemo(() => sortedClasses.map((c) => c.id).join(','), [sortedClasses]);

  useEffect(() => {
    if (!classIdsParam) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/time-blocks?dayType=${dayType}&classIds=${classIdsParam}`)
      .then((r) => r.json())
      .then((j: { timeBlocks?: TimeBlock[]; error?: string }) => {
        if (cancelled) return;
        if (j.error) {
          setError(j.error);
          setBlocks([]);
        } else {
          setBlocks(j.timeBlocks ?? []);
        }
      })
      .catch(() => !cancelled && setError('Failed to load schedule'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dayType, classIdsParam]);

  const blocksByClass = useMemo(() => {
    const m = new Map<string, TimeBlock[]>();
    for (const b of blocks) {
      if (!m.has(b.classId)) m.set(b.classId, []);
      m.get(b.classId)!.push(b);
    }
    return m;
  }, [blocks]);

  // Unique time boundaries across all classes, sorted.
  const boundaries = useMemo(() => {
    const set = new Set<number>();
    for (const b of blocks) {
      set.add(toMin(b.startTime));
      set.add(toMin(b.endTime));
    }
    return [...set].sort((a, b) => a - b);
  }, [blocks]);

  const rows = useMemo(() => {
    const out: { start: number; end: number }[] = [];
    for (let i = 0; i < boundaries.length - 1; i++) {
      out.push({ start: boundaries[i], end: boundaries[i + 1] });
    }
    return out;
  }, [boundaries]);

  const findBlock = (classId: string, slot: { start: number; end: number }) => {
    const list = blocksByClass.get(classId) ?? [];
    return list.find((b) => toMin(b.startTime) <= slot.start && toMin(b.endTime) >= slot.end);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-violet-600" />
            School Schedule Overview
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const selected = d.value === dayType;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDayType(d.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-8">
            No schedule yet for {DAYS.find((d) => d.value === dayType)?.label}. Use the editor above to add hours.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 text-left text-slate-500 font-medium px-2 py-2 border-b border-slate-200 w-24">
                    Time
                  </th>
                  {sortedClasses.map((c) => (
                    <th
                      key={c.id}
                      className="text-center font-semibold text-slate-800 px-2 py-2 border-b border-slate-200 whitespace-nowrap min-w-[100px]"
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((slot, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="sticky left-0 bg-white z-10 text-slate-600 font-mono px-2 py-1 border-b border-slate-100 whitespace-nowrap">
                      {fmt(slot.start)}–{fmt(slot.end)}
                    </td>
                    {sortedClasses.map((c) => {
                      const block = findBlock(c.id, slot);
                      if (!block) {
                        return (
                          <td key={c.id} className="px-1 py-1 border-b border-slate-100" />
                        );
                      }
                      const style = SUBJECT_STYLE[block.subjectType] ?? SUBJECT_STYLE.other;
                      const label = block.description || SUBJECT_LABEL[block.subjectType] || block.subjectType;
                      return (
                        <td key={c.id} className="px-1 py-1 border-b border-slate-100">
                          <div className={`text-center rounded border px-1 py-1 ${style}`}>
                            {label}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {!loading && !error && rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
            {(['hebrew', 'english', 'break', 'other'] as SubjectType[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded border ${SUBJECT_STYLE[s]}`} />
                <span className="text-slate-600">{SUBJECT_LABEL[s]}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
