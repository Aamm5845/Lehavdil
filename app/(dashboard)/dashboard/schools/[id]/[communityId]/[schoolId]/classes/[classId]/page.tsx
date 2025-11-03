'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, Class } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleBuilder } from '@/components/schedule/schedule-builder';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const communityId = params.communityId as string;
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const { lang } = useLanguage();

  const [city, setCity] = useState<City | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [cityId, communityId, schoolId, classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [cityRes, communityRes, schoolRes, classRes] = await Promise.all([
        fetch(`/api/cities/${cityId}`),
        fetch(`/api/communities/${communityId}`),
        fetch(`/api/schools/${schoolId}`),
        fetch(`/api/classes/${classId}`),
      ]);

      if (!cityRes.ok || !communityRes.ok || !schoolRes.ok || !classRes.ok) {
        throw new Error('Data not found');
      }

      const [cityData, communityData, schoolData, classResData] = await Promise.all([
        cityRes.json(),
        communityRes.json(),
        schoolRes.json(),
        classRes.json(),
      ]);

      setCity(cityData.city);
      setCommunity(communityData.community);
      setSchool(schoolData.school);
      setClassData(classResData.class);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
      router.push(`/dashboard/schools/${cityId}/${communityId}/${schoolId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!city || !community || !school || !classData) {
    return null;
  }

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
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/schools/${cityId}/${communityId}/${schoolId}`}>
                {lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{classData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Class Header */}
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <div className={`h-3 w-full bg-gradient-to-r ${gradientClass}`} />
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-xl`}>
              <GraduationCap className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {classData.name}
              </h1>
              <p className="text-slate-600">
                {lang === 'en' ? `Grade ${classData.gradeLevel}` : `כיתה ${classData.gradeLevel}`} • 
                {' '}{lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Tabs */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {lang === 'en' ? 'Weekly Schedule' : 'לוח זמנים שבועי'}
          </h2>
          
          <Tabs defaultValue="sunday" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sunday">
                {lang === 'en' ? 'Sunday' : 'ראשון'}
              </TabsTrigger>
              <TabsTrigger value="weekday">
                {lang === 'en' ? 'Weekdays (Mon-Thu)' : 'ימי חול (ב-ה)'}
              </TabsTrigger>
              <TabsTrigger value="friday">
                {lang === 'en' ? 'Friday' : 'שישי'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sunday" className="mt-6">
              <ScheduleBuilder classId={classId} dayType="sunday" />
            </TabsContent>

            <TabsContent value="weekday" className="mt-6">
              <ScheduleBuilder classId={classId} dayType="weekday" />
            </TabsContent>

            <TabsContent value="friday" className="mt-6">
              <ScheduleBuilder classId={classId} dayType="friday" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
