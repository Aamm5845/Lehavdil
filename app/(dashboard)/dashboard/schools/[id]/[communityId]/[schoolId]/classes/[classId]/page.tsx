'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Edit, Clock, Bus, BookOpen, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, Class, TimeBlock, SubjectType } from '@/lib/types';
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
  const [timeBlocks, setTimeBlocks] = useState<{ [key: string]: TimeBlock[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sunday');

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
      
      // Fetch time blocks for all day types
      const [sundayRes, weekdayRes, fridayRes] = await Promise.all([
        fetch(`/api/time-blocks?classId=${classId}&dayType=sunday`),
        fetch(`/api/time-blocks?classId=${classId}&dayType=weekday`),
        fetch(`/api/time-blocks?classId=${classId}&dayType=friday`),
      ]);
      
      const [sundayData, weekdayData, fridayData] = await Promise.all([
        sundayRes.json(),
        weekdayRes.json(),
        fridayRes.json(),
      ]);
      
      setTimeBlocks({
        sunday: (sundayData.timeBlocks || []).sort((a: TimeBlock, b: TimeBlock) => a.sortOrder - b.sortOrder),
        weekday: (weekdayData.timeBlocks || []).sort((a: TimeBlock, b: TimeBlock) => a.sortOrder - b.sortOrder),
        friday: (fridayData.timeBlocks || []).sort((a: TimeBlock, b: TimeBlock) => a.sortOrder - b.sortOrder),
      });
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
  
  const getSubjectIcon = (type: SubjectType) => {
    switch (type) {
      case 'bus-start': return Bus;
      case 'hebrew': return BookOpen;
      case 'english': return BookOpen;
      case 'break': return Coffee;
      default: return Clock;
    }
  };
  
  const getSubjectColor = (type: SubjectType) => {
    switch (type) {
      case 'bus-start': return 'bg-blue-500';
      case 'hebrew': return 'bg-purple-500';
      case 'english': return 'bg-green-500';
      case 'break': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };
  
  const getSubjectLabel = (type: SubjectType) => {
    const labels: { [key in SubjectType]: { en: string; he: string } } = {
      'bus-start': { en: 'Bus Arrival', he: 'הגעת אוטובוס' },
      'hebrew': { en: 'Hebrew Learning', he: 'לימוד עברית' },
      'english': { en: 'English Learning', he: 'לימוד אנגלית' },
      'break': { en: 'Break', he: 'הפסקה' },
      'other': { en: 'Other', he: 'אחר' },
    };
    return lang === 'en' ? labels[type].en : labels[type].he;
  };
  
  const getDayTypeLabel = (type: string) => {
    const labels: { [key: string]: { en: string; he: string } } = {
      'sunday': { en: 'Sunday', he: 'ראשון' },
      'weekday': { en: 'Weekdays (Mon-Thu)', he: 'ימי חול (ב-ה)' },
      'friday': { en: 'Friday', he: 'שישי' },
    };
    return lang === 'en' ? labels[type].en : labels[type].he;
  };
  
  const getClassTime = (dayType: string, isEnd: boolean) => {
    if (!classData) return '--:--';
    if (dayType === 'sunday') return isEnd ? classData.sundayEnd : classData.sundayStart;
    if (dayType === 'weekday') return isEnd ? classData.weekdayEnd : classData.weekdayStart;
    if (dayType === 'friday') return isEnd ? classData.fridayEnd : classData.fridayStart;
    return isEnd ? '13:00' : '08:00';
  };

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

      {/* Schedule View */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {lang === 'en' ? 'Weekly Schedule' : 'לוח זמנים שבועי'}
            </h2>
            <Link href={`/dashboard/schedules?cityId=${cityId}&communityId=${communityId}&schoolId=${schoolId}&classId=${classId}`}>
              <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Edit className="w-4 h-4" />
                {lang === 'en' ? 'Edit Schedule' : 'ערוך לוח זמנים'}
              </Button>
            </Link>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

            {['sunday', 'weekday', 'friday'].map((dayType) => (
              <TabsContent key={dayType} value={dayType} className="mt-6 space-y-4">
                {/* Class Times */}
                <Card className="border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      {lang === 'en' ? 'Class Times' : 'שעות כיתה'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-white">
                          <Clock className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">
                            {lang === 'en' ? 'Class Starts' : 'תחילת שיעור'}
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {getClassTime(dayType, false) || '--:--'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-white">
                          <Clock className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">
                            {lang === 'en' ? 'End of Day' : 'סיום יום'}
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {getClassTime(dayType, true) || '--:--'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Time Blocks */}
                {timeBlocks[dayType] && timeBlocks[dayType].length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {lang === 'en' ? 'Schedule Blocks' : 'בלוקי זמן'}
                    </h3>
                    {timeBlocks[dayType].map((block) => {
                      const Icon = getSubjectIcon(block.subjectType);
                      const color = getSubjectColor(block.subjectType);
                      
                      return (
                        <Card key={block.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-slate-900">
                                    {getSubjectLabel(block.subjectType)}
                                  </span>
                                </div>
                                {block.description && (
                                  <p className="text-sm text-slate-600">{block.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                  {block.startTime} - {block.endTime}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="w-12 h-12 text-slate-400 mb-3" />
                      <p className="text-slate-600 text-center">
                        {lang === 'en' 
                          ? `No schedule blocks for ${getDayTypeLabel(dayType).toLowerCase()} yet`
                          : `אין בלוקי זמן ל${getDayTypeLabel(dayType)} עדיין`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
