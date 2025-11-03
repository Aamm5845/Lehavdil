'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ChevronLeft, GraduationCap, BookOpen, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, Class } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    fetchData();
  }, [cityId, communityId, schoolId]);

  const fetchData = async () => {
    try {
      const [cityRes, communityRes, schoolRes, classesRes] = await Promise.all([
        fetch(`/api/cities/${cityId}`),
        fetch(`/api/communities/${communityId}`),
        fetch(`/api/schools/${schoolId}`),
        fetch(`/api/classes`),
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
      
      const schoolClasses = (classesData.classes || []).filter(
        (c: Class) => c.schoolId === schoolId
      );
      setClasses(schoolClasses);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
      router.push(`/dashboard/schools/${cityId}/${communityId}`);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolTypeColor = (type: 'boys' | 'yeshivah' | 'girls') => {
    switch (type) {
      case 'boys':
        return 'from-blue-500 to-cyan-500';
      case 'yeshivah':
        return 'from-purple-500 to-pink-500';
      case 'girls':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
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

  const gradientClass = getSchoolTypeColor(school.schoolType);

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
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <div className={`h-3 w-full bg-gradient-to-r ${gradientClass}`} />
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-xl`}>
              <GraduationCap className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
                </h1>
                <Badge variant={school.schoolType === 'boys' ? 'default' : school.schoolType === 'yeshivah' ? 'destructive' : 'secondary'}>
                  {school.schoolType === 'boys'
                    ? (lang === 'en' ? 'Boys' : 'בנים')
                    : school.schoolType === 'yeshivah'
                    ? (lang === 'en' ? 'Yeshivah' : 'ישיבה')
                    : (lang === 'en' ? 'Girls' : 'בנות')
                  }
                </Badge>
              </div>

              {school.nameHe && lang === 'en' && (
                <p className="text-lg text-slate-600 font-hebrew mb-2">{school.nameHe}</p>
              )}
              {lang === 'he' && (
                <p className="text-lg text-slate-600 mb-2">{school.nameEn}</p>
              )}

              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-5 h-5" />
                <span>{lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}</span>
                <span>•</span>
                <span>
                  {classes.length} {lang === 'en' ? (classes.length === 1 ? 'Class' : 'Classes') : 'כיתות'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <Card className="group cursor-pointer bg-white border-slate-200 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    {/* Icon and Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientClass} shrink-0`}>
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 truncate">
                          {classItem.name}
                        </h3>
                      </div>
                    </div>

                    {/* Grade Level */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {lang === 'en' ? 'Grade' : 'כיתה'}
                      </span>
                      <span className="font-semibold text-slate-800">
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
