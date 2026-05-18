'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ChevronLeft, GraduationCap, BookOpen, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, Class, DayType } from '@/lib/types';
import type { BulkScheduleInitial } from '@/components/bulk-schedule-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { motion } from 'framer-motion';
import { BulkScheduleEditor } from '@/components/bulk-schedule-editor';
import { SchoolScheduleGrid } from '@/components/school-schedule-grid';

export default function SchoolTypePage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const communityId = params.communityId as string;
  const schoolId = params.schoolId as string;
  const { t, lang } = useLanguage();

  const [city, setCity] = useState<City | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitial, setEditorInitial] = useState<BulkScheduleInitial | undefined>(undefined);
  const [gridRefresh, setGridRefresh] = useState(0);

  const openEditor = (_day: DayType, initial: BulkScheduleInitial) => {
    setEditorInitial(initial);
    setEditorOpen(true);
  };
  const handleSaved = () => {
    setEditorOpen(false);
    setGridRefresh((n) => n + 1);
  };

  useEffect(() => {
    fetchData();
  }, [cityId, communityId, schoolId]);

  const fetchData = async () => {
    try {
      const [cityRes, communityRes, schoolRes, classesRes] = await Promise.all([
        fetch(`/api/cities/${cityId}`),
        fetch(`/api/communities/${communityId}`),
        fetch(`/api/schools/${schoolId}`),
        fetch(`/api/classes?schoolId=${schoolId}`),
      ]);

      if (!cityRes.ok || !communityRes.ok || !schoolRes.ok) {
        throw new Error('Data not found');
      }

      const [cityData, communityData, schoolData, classesData] = await Promise.all([
        cityRes.json(),
        communityRes.json(),
        schoolRes.json(),
        classesRes.json(),
      ]);

      setCity(cityData.city);
      setCommunity(communityData.community);
      setSchool(schoolData.school);
      setClasses(classesData.classes || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
      router.push(`/dashboard/schools/${cityId}/${communityId}`);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolTypeAccent = (type: 'boys' | 'yeshivah' | 'girls') => {
    switch (type) {
      case 'boys':
        return { iconBg: 'bg-blue-50 text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'yeshivah':
        return { iconBg: 'bg-violet-50 text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200' };
      case 'girls':
        return { iconBg: 'bg-rose-50 text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { iconBg: 'bg-slate-50 text-slate-600', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!city || !community || !school) {
    return null;
  }

  const accent = getSchoolTypeAccent(school.schoolType);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/schools">
                {lang === 'en' ? 'Cities' : 'ערים'}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/schools/${cityId}`}>
                {lang === 'en' ? city.nameEn : (city.nameHe || city.nameEn)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/schools/${cityId}/${communityId}`}>
                {lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* School Header Card */}
      <Card className="overflow-hidden border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accent.iconBg}`}>
              <GraduationCap className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                  {lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
                </h1>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent.badge}`}>
                  {school.schoolType === 'boys'
                    ? (lang === 'en' ? 'Boys' : 'בנים')
                    : school.schoolType === 'yeshivah'
                    ? (lang === 'en' ? 'Yeshivah' : 'ישיבה')
                    : (lang === 'en' ? 'Girls' : 'בנות')
                  }
                </span>
              </div>

              {school.nameHe && lang === 'en' && (
                <p className="text-sm text-muted-foreground font-hebrew mb-2">{school.nameHe}</p>
              )}
              {lang === 'he' && (
                <p className="text-sm text-muted-foreground mb-2">{school.nameEn}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}</span>
                <span>·</span>
                <span>
                  {classes.length} {lang === 'en' ? (classes.length === 1 ? 'class' : 'classes') : 'כיתות'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule (grid + Add/Edit) */}
      {classes.length > 0 && (
        <SchoolScheduleGrid
          classes={classes}
          refreshKey={gridRefresh}
          onEdit={openEditor}
        />
      )}

      {/* Schedule editor (shown only when Add/Edit is pressed) */}
      {classes.length > 0 && editorOpen && (
        <BulkScheduleEditor
          key={`${editorInitial?.dayType ?? 'weekday'}-${editorInitial?.classIds?.join(',') ?? ''}`}
          classes={classes}
          initial={editorInitial}
          onSaved={handleSaved}
          onCancel={() => setEditorOpen(false)}
        />
      )}

      {/* Classes Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {lang === 'en' ? 'Classes & Schedules' : 'כיתות ולוחות זמנים'}
          </h2>
          <p className="text-slate-600 mt-1">
            {lang === 'en' ? 'View and manage class schedules' : 'צפה ונהל לוחות זמנים של כיתות'}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'No classes yet' : 'אין כיתות עדיין'}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {lang === 'en'
                ? 'Classes need to be added through the Settings page first.'
                : 'יש להוסיף כיתות דרך דף ההגדרות תחילה.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/dashboard/schools/${cityId}/${communityId}/${schoolId}/classes/${classItem.id}`}>
                <Card className="group cursor-pointer border-border hover:border-primary/30 transition-colors duration-200 py-0">
                  <CardContent className="p-4">
                    {/* Icon and Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg shrink-0 ${accent.iconBg}`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {classItem.name}
                        </h3>
                      </div>
                    </div>

                    {/* Grade Level */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {lang === 'en' ? 'Grade' : 'כיתה'}
                      </span>
                      <span className="font-medium text-foreground">
                        {classItem.gradeLevel}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
