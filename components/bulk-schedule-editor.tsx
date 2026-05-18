'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Class, DayType, TimeBlock } from '@/lib/types';

type BreakRow = { id: string; start: string; end: string; label: string };

const DAY_LABELS: { value: DayType; label: string }[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'weekday', label: 'Weekdays (Mon–Thu)' },
  { value: 'friday', label: 'Friday' },
];

const newRow = (start = '', end = '', label = ''): BreakRow => ({
  id: Math.random().toString(36).slice(2),
  start,
  end,
  label,
});

export type BulkScheduleInitial = {
  dayType?: DayType;
  classIds?: string[];
  hebrewStart?: string;
  englishStart?: string;
  endTime?: string;
  hebrewBreaks?: { start: string; end: string; label?: string }[];
  englishBreaks?: { start: string; end: string; label?: string }[];
};

export function BulkScheduleEditor({
  classes,
  initial,
  onSaved,
  onCancel,
}: {
  classes: Class[];
  initial?: BulkScheduleInitial;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    () => new Set(initial?.classIds ?? [])
  );
  const [dayType, setDayType] = useState<DayType>(initial?.dayType ?? 'weekday');
  const [hebrewStart, setHebrewStart] = useState(initial?.hebrewStart ?? '09:00');
  const [englishStart, setEnglishStart] = useState(initial?.englishStart ?? '13:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '16:15');
  // One unified list of breaks. On save we split by start time vs englishStart.
  const [breaks, setBreaks] = useState<BreakRow[]>(() => {
    const combined = [
      ...(initial?.hebrewBreaks ?? []),
      ...(initial?.englishBreaks ?? []),
    ];
    return combined.length > 0
      ? combined.map((b) => newRow(b.start, b.end, b.label ?? ''))
      : [newRow()];
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [classesWithData, setClassesWithData] = useState<Class[]>([]);

  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => a.gradeLevel - b.gradeLevel),
    [classes]
  );

  const toggleClass = (id: string) => {
    setSelectedClassIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedClassIds.size === sortedClasses.length) {
      setSelectedClassIds(new Set());
    } else {
      setSelectedClassIds(new Set(sortedClasses.map((c) => c.id)));
    }
  };

  const updateBreak = (id: string, patch: Partial<BreakRow>) => {
    setBreaks((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const addBreak = () => {
    setBreaks((rows) => [...rows, newRow()]);
  };
  const removeBreak = (id: string) => {
    setBreaks((rows) => (rows.length === 1 ? [newRow()] : rows.filter((r) => r.id !== id)));
  };

  // Skip incomplete rows; split the rest by start time relative to englishStart.
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const splitBreaks = (rows: BreakRow[], englishStart: string) => {
    const valid = rows
      .filter((r) => r.start && r.end)
      .map((r) => ({ start: r.start, end: r.end, label: r.label || undefined }));
    const cut = toMin(englishStart);
    const hebrew = valid.filter((b) => toMin(b.start) < cut);
    const english = valid.filter((b) => toMin(b.start) >= cut);
    return { hebrew, english };
  };

  const handleSavePressed = async () => {
    if (selectedClassIds.size === 0) {
      toast.error('Pick at least one class');
      return;
    }
    // Single round-trip: fetch blocks for ALL selected classes in one call.
    setSubmitting(true);
    try {
      const ids = Array.from(selectedClassIds).join(',');
      const r = await fetch(`/api/time-blocks?dayType=${dayType}&classIds=${ids}`);
      const j = (await r.json()) as { timeBlocks?: TimeBlock[] };
      const occupied = new Set((j.timeBlocks ?? []).map((b) => b.classId));
      const withData = Array.from(selectedClassIds).filter((id) => occupied.has(id));
      if (withData.length > 0) {
        setClassesWithData(sortedClasses.filter((c) => withData.includes(c.id)));
        setConfirmOpen(true);
        setSubmitting(false);
        return;
      }
      await doSave();
    } catch {
      toast.error('Failed to check existing schedules');
      setSubmitting(false);
    }
  };

  const doSave = async () => {
    setSubmitting(true);
    setConfirmOpen(false);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);
    try {
      const split = splitBreaks(breaks, englishStart);
      const r = await fetch('/api/schedules/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          classIds: Array.from(selectedClassIds),
          dayType,
          hebrewStart,
          englishStart,
          endTime,
          hebrewBreaks: split.hebrew,
          englishBreaks: split.english,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to save');
      toast.success(`Saved schedule to ${j.classCount} class${j.classCount === 1 ? '' : 'es'} (${j.blocksPerClass} blocks each)`);
      onSaved?.();
    } catch (e: unknown) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      const msg = aborted ? 'Save took too long — try again' : e instanceof Error ? e.message : 'Failed to save';
      toast.error(msg);
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  const fmt12 = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Save className="w-4 h-4 text-primary" />
          Schedule Editor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick classes, set anchor times, and list breaks inside each section. Save applies the same schedule to every selected class.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class multi-select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Classes</Label>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-primary hover:underline"
            >
              {selectedClassIds.size === sortedClasses.length ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedClasses.map((c) => {
              const selected = selectedClassIds.has(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleClass(c.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day type */}
        <div className="space-y-2">
          <Label>Day</Label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((d) => {
              const selected = dayType === d.value;
              return (
                <button
                  type="button"
                  key={d.value}
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
        </div>

        {/* Anchor times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hebrewStart">Hebrew starts</Label>
            <Input id="hebrewStart" type="time" value={hebrewStart} onChange={(e) => setHebrewStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="englishStart">English starts</Label>
            <Input id="englishStart" type="time" value={englishStart} onChange={(e) => setEnglishStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime">End of day</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        {/* Unified breaks */}
        <BreaksEditor
          breaks={breaks}
          onAdd={addBreak}
          onUpdate={updateBreak}
          onRemove={removeBreak}
        />

        {/* Save / Cancel */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-sm text-slate-600">
            {selectedClassIds.size} class{selectedClassIds.size === 1 ? '' : 'es'} selected
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button onClick={handleSavePressed} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save to selected classes
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite existing schedules?</AlertDialogTitle>
            <AlertDialogDescription>
              {classesWithData.length} of the selected classes already have hours for{' '}
              {DAY_LABELS.find((d) => d.value === dayType)?.label}: {classesWithData.map((c) => c.name).join(', ')}.
              Saving will replace them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doSave} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function BreaksEditor({
  breaks,
  onAdd,
  onUpdate,
  onRemove,
}: {
  breaks: BreakRow[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<BreakRow>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-foreground">Breaks</div>
          <div className="text-xs text-muted-foreground">
            Add any breaks throughout the day — start, end, optional label. Order and timing don&apos;t need to be exact.
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {breaks.map((b) => (
          <div key={b.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center">
            <Input
              type="time"
              value={b.start}
              onChange={(e) => onUpdate(b.id, { start: e.target.value })}
              placeholder="Start"
            />
            <Input
              type="time"
              value={b.end}
              onChange={(e) => onUpdate(b.id, { end: e.target.value })}
              placeholder="End"
            />
            <Input
              type="text"
              value={b.label}
              onChange={(e) => onUpdate(b.id, { label: e.target.value })}
              placeholder="Label (e.g. Lunch)"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(b.id)}
              aria-label="Remove break"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Add break
        </Button>
      </div>
    </div>
  );
}
