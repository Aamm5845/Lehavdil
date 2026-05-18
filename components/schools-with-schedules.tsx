'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, ChevronRight, CalendarCheck } from 'lucide-react';

type DayCount = { dayType: string; classCount: number };
type SchoolStatus = {
  schoolId: string;
  schoolNameEn: string;
  schoolNameHe: string | null;
  schoolType: string;
  cityId: string;
  cityNameEn: string;
  communityId: string;
  communityNameEn: string;
  days: DayCount[];
};

const DAY_LABEL: Record<string, string> = {
  sunday: 'Sun',
  weekday: 'Mon–Thu',
  friday: 'Fri',
};

const ACCENT: Record<string, string> = {
  boys: 'bg-blue-50 text-blue-600',
  yeshivah: 'bg-violet-50 text-violet-600',
  girls: 'bg-rose-50 text-rose-600',
};

export function SchoolsWithSchedules() {
  const [schools, setSchools] = useState<SchoolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/schools/schedule-status')
      .then((r) => r.json())
      .then((j: { schools?: SchoolStatus[]; error?: string }) => {
        if (j.error) setError(j.error);
        else setSchools(j.schools ?? []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarCheck className="w-4 h-4 text-primary" />
          Schools with schedules
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick jump to schools that already have hours entered.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : schools.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No schedules entered yet. Open a school and use Add Schedule to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {schools.map((s) => {
              const accent = ACCENT[s.schoolType] ?? 'bg-slate-50 text-slate-600';
              return (
                <li key={s.schoolId}>
                  <Link
                    href={`/dashboard/schools/${s.cityId}/${s.communityId}/${s.schoolId}`}
                    className="flex items-center gap-3 py-3 px-1 -mx-1 hover:bg-accent/40 rounded-lg transition-colors group"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${accent}`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {s.schoolNameEn}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {s.cityNameEn} · {s.communityNameEn}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {s.days.map((d) => (
                        <span
                          key={d.dayType}
                          className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-foreground"
                          title={`${d.classCount} class${d.classCount === 1 ? '' : 'es'}`}
                        >
                          {DAY_LABEL[d.dayType] ?? d.dayType} · {d.classCount}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
