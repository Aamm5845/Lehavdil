'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Pencil } from 'lucide-react';
import type { Class, DayType, SubjectType, TimeBlock } from '@/lib/types';
import type { BulkScheduleInitial } from '@/components/bulk-schedule-editor';

const DAYS: { value: DayType; label: string }[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'weekday', label: 'Weekdays (Mon–Thu)' },
  { value: 'friday', label: 'Friday' },
];

const SUBJECT_STYLE: Record<SubjectType, string> = {
  hebrew: 'bg-blue-50 text-blue-800 border-blue-100',
  english: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  break: 'bg-amber-50 text-amber-800 border-amber-100',
  other: 'bg-slate-50 text-slate-700 border-slate-100',
  'bus-start': 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100',
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
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

export function SchoolScheduleGrid({
  classes,
  refreshKey = 0,
  onEdit,
}: {
  classes: Class[];
  refreshKey?: number;
  onEdit?: (dayType: DayType, initial: BulkScheduleInitial) => void;
}) {
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
  }, [dayType, classIdsParam, refreshKey]);

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

  // Reverse-engineer anchor times + break list from a class's blocks. Used so
  // clicking "Edit" pre-fills the form with the existing schedule.
  const deriveInitial = (classId: string): BulkScheduleInitial | null => {
    const list = (blocksByClass.get(classId) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    if (list.length === 0) return null;
    const firstEnglishIdx = list.findIndex((b) => b.subjectType === 'english');
    const hebrewStart = list[0].startTime;
    const englishStart = firstEnglishIdx >= 0 ? list[firstEnglishIdx].startTime : list[list.length - 1].endTime;
    const endTime = list[list.length - 1].endTime;
    const hebrewPart = firstEnglishIdx >= 0 ? list.slice(0, firstEnglishIdx) : list;
    const englishPart = firstEnglishIdx >= 0 ? list.slice(firstEnglishIdx) : [];
    const hebrewBreaks = hebrewPart
      .filter((b) => b.subjectType === 'break')
      .map((b) => ({ start: b.startTime, end: b.endTime, label: b.description }));
    const englishBreaks = englishPart
      .filter((b) => b.subjectType === 'break')
      .map((b) => ({ start: b.startTime, end: b.endTime, label: b.description }));
    return { dayType, classIds: [classId], hebrewStart, englishStart, endTime, hebrewBreaks, englishBreaks };
  };

  // Build the "Edit" preset: pick the first class that has blocks for this day,
  // grab its schedule, and pre-select every class that shares the exact same
  // block fingerprint (start/end/subject/description).
  const buildEditInitial = (): BulkScheduleInitial | null => {
    const populatedClasses = sortedClasses.filter((c) => (blocksByClass.get(c.id) ?? []).length > 0);
    if (populatedClasses.length === 0) return null;
    const template = populatedClasses[0];
    const initial = deriveInitial(template.id);
    if (!initial) return null;
    const fingerprint = (list: TimeBlock[]) =>
      list
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((b) => `${b.startTime}|${b.endTime}|${b.subjectType}|${b.description ?? ''}`)
        .join(';');
    const target = fingerprint(blocksByClass.get(template.id) ?? []);
    const matchingIds = populatedClasses
      .filter((c) => fingerprint(blocksByClass.get(c.id) ?? []) === target)
      .map((c) => c.id);
    return { ...initial, classIds: matchingIds };
  };

  const hasData = rows.length > 0;
  const handleAddClick = () => onEdit?.(dayType, { dayType });
  const handleEditClick = () => {
    const init = buildEditInitial();
    if (init) onEdit?.(dayType, init);
  };

  // Per-class totals (minutes) for the current day.
  const totals = useMemo(() => {
    const m = new Map<string, { hebrew: number; english: number; break: number }>();
    for (const c of sortedClasses) m.set(c.id, { hebrew: 0, english: 0, break: 0 });
    for (const b of blocks) {
      const t = m.get(b.classId);
      if (!t) continue;
      const dur = toMin(b.endTime) - toMin(b.startTime);
      if (b.subjectType === 'hebrew') t.hebrew += dur;
      else if (b.subjectType === 'english') t.english += dur;
      else if (b.subjectType === 'break') t.break += dur;
    }
    return m;
  }, [blocks, sortedClasses]);

  const fmtDur = (mins: number) => {
    if (mins <= 0) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="w-4 h-4 text-primary" />
            Schedule
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const selected = d.value === dayType;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDayType(d.value)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selected
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-foreground border-border hover:border-foreground/40'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {onEdit && hasData && (
              <Button size="sm" variant="outline" onClick={handleEditClick}>
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
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
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <p className="text-sm text-slate-600">
              No schedule yet for {DAYS.find((d) => d.value === dayType)?.label}.
            </p>
            {onEdit && (
              <Button onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-1" />
                Add Schedule
              </Button>
            )}
          </div>
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
              <tfoot>
                {[
                  { key: 'hebrew' as const, label: 'Hebrew', style: SUBJECT_STYLE.hebrew },
                  { key: 'english' as const, label: 'English', style: SUBJECT_STYLE.english },
                  { key: 'break' as const, label: 'Break', style: SUBJECT_STYLE.break },
                ].map((row, idx) => (
                  <tr key={row.key} className={idx === 0 ? 'border-t-2 border-slate-300' : ''}>
                    <td className={`sticky left-0 bg-white z-10 text-slate-700 font-semibold px-2 py-2 whitespace-nowrap ${idx === 0 ? 'border-t-2 border-slate-300' : ''}`}>
                      {row.label}
                    </td>
                    {sortedClasses.map((c) => {
                      const mins = totals.get(c.id)?.[row.key] ?? 0;
                      return (
                        <td key={c.id} className={`px-1 py-2 ${idx === 0 ? 'border-t-2 border-slate-300' : ''}`}>
                          <div className={`text-center rounded border px-1 py-1 font-mono text-[11px] ${row.style}`}>
                            {fmtDur(mins)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="sticky left-0 bg-white z-10 text-slate-900 font-bold px-2 py-2 whitespace-nowrap border-t border-slate-200">
                    Total
                  </td>
                  {sortedClasses.map((c) => {
                    const t = totals.get(c.id);
                    const total = (t?.hebrew ?? 0) + (t?.english ?? 0) + (t?.break ?? 0);
                    return (
                      <td key={c.id} className="px-1 py-2 border-t border-slate-200">
                        <div className="text-center font-mono text-[11px] font-bold text-slate-900">
                          {fmtDur(total)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
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
