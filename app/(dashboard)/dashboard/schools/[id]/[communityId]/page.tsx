'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Users, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, SchoolType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { motion } from 'framer-motion';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const communityId = params.communityId as string;
  const { t, lang } = useLanguage();

  const [city, setCity] = useState<City | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [cityId, communityId]);

  const fetchData = async () => {
    try {
      const [cityRes, communityRes, schoolsRes] = await Promise.all([
        fetch(`/api/cities/${cityId}`),
        fetch(`/api/communities/${communityId}`),
        fetch(`/api/schools`),
      ]);

      if (!cityRes.ok || !communityRes.ok) {
        throw new Error('Data not found');
      }

      const [cityData, communityData, schoolsData] = await Promise.all([
        cityRes.json(),
        communityRes.json(),
        schoolsRes.json(),
      ]);

      setCity(cityData.city);
      setCommunity(communityData.community);
      
      const communitySchools = (schoolsData.schools || []).filter(
        (s: School) => s.communityId === communityId
      );
      setSchools(communitySchools);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
      router.push(`/dashboard/schools/${cityId}`);
    } finally {
      setLoading(false);
    }
  };

  const getSchoolByType = (type: SchoolType) => {
    return schools.find(s => s.schoolType === type);
  };

  const schoolTypes: { type: SchoolType; icon: any; gradient: string; labelEn: string; labelHe: string }[] = [
    {
      type: 'boys',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500',
      labelEn: 'Boys School',
      labelHe: 'בית ספר לבנים'
    },
    {
      type: 'yeshivah',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      labelEn: 'Yeshivah',
      labelHe: 'ישיבה'
    },
    {
      type: 'girls',
      icon: Users,
      gradient: 'from-rose-500 to-pink-500',
      labelEn: 'Girls School',
      labelHe: 'בית ספר לבנות'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!city || !community) {
    return null;
  }

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
            <BreadcrumbPage>{lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Community Header Card */}
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <div className="h-3 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-xl">
              <Users className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}
              </h1>
              {community.nameHe && lang === 'en' && (
                <p className="text-lg text-slate-600 font-hebrew">{community.nameHe}</p>
              )}
              {lang === 'he' && (
                <p className="text-lg text-slate-600">{community.nameEn}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Types Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {lang === 'en' ? 'Select School Type' : 'בחר סוג בית ספר'}
        </h2>
        <p className="text-slate-600">
          {lang === 'en' ? 'Choose a school type to view classes and schedules' : 'בחר סוג בית ספר כדי לראות כיתות ולוחות זמנים'}
        </p>
      </div>

      {/* School Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schoolTypes.map((schoolType, index) => {
          const school = getSchoolByType(schoolType.type);
          const Icon = schoolType.icon;
          
          return (
            <motion.div
              key={schoolType.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={school ? `/dashboard/schools/${cityId}/${communityId}/${school.id}` : '#'}>
                <Card className={`group cursor-pointer overflow-hidden border-slate-200 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] relative ${!school ? 'opacity-60 cursor-not-allowed' : 'hover:border-violet-300'}`}>
                  <div className={`h-3 w-full bg-gradient-to-r ${schoolType.gradient}`} />
                  
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${schoolType.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 text-center mb-4 group-hover:text-violet-600 transition-colors">
                      {lang === 'en' ? schoolType.labelEn : schoolType.labelHe}
                    </h3>

                    {/* Status */}
                    <div className="text-center">
                      {school ? (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">
                            {lang === 'en' ? 'School Name:' : 'שם בית הספר:'}
                          </p>
                          <p className="font-medium text-slate-900">
                            {lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
                          </p>
                          <div className="pt-4 mt-4 border-t border-slate-100">
                            <div className="flex items-center justify-center gap-2 text-violet-600 font-medium">
                              <span>{lang === 'en' ? 'View Classes' : 'צפה בכיתות'}</span>
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <p className="text-sm text-slate-500">
                            {lang === 'en' ? 'Not available yet' : 'לא זמין כרגע'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {schools.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'No schools yet' : 'אין בתי ספר עדיין'}
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              {lang === 'en'
                ? 'Schools need to be added through the Settings page first.'
                : 'יש להוסיף בתי ספר דרך דף ההגדרות תחילה.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
