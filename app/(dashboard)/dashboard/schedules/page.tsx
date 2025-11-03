'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, Building2, Users, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School, Class } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleBuilder } from '@/components/schedule/schedule-builder';

export default function SchedulesPage() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCities();
    
    // Auto-select from query params
    const cityId = searchParams.get('cityId');
    const communityId = searchParams.get('communityId');
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    
    if (cityId) setSelectedCityId(cityId);
    if (communityId) setSelectedCommunityId(communityId);
    if (schoolId) setSelectedSchoolId(schoolId);
    if (classId) setSelectedClassId(classId);
  }, [searchParams]);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      const data = await res.json();
      setCities(data.cities || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load cities' : 'כשלון בטעינת ערים');
    }
  };

  useEffect(() => {
    if (selectedCityId) {
      fetchCommunities(selectedCityId);
      setSelectedCommunityId('');
      setSelectedSchoolId('');
      setSelectedClassId('');
    }
  }, [selectedCityId]);

  const fetchCommunities = async (cityId: string) => {
    try {
      const res = await fetch(`/api/communities?cityId=${cityId}`);
      const data = await res.json();
      setCommunities(data.communities || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load communities' : 'כשלון בטעינת קהילות');
    }
  };

  useEffect(() => {
    if (selectedCommunityId) {
      fetchSchools(selectedCommunityId);
      setSelectedSchoolId('');
      setSelectedClassId('');
    }
  }, [selectedCommunityId]);

  const fetchSchools = async (communityId: string) => {
    try {
      const res = await fetch('/api/schools');
      const data = await res.json();
      const filtered = (data.schools || []).filter((s: School) => s.communityId === communityId);
      setSchools(filtered);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load schools' : 'כשלון בטעינת בתי ספר');
    }
  };

  useEffect(() => {
    if (selectedSchoolId) {
      fetchClasses(selectedSchoolId);
      setSelectedClassId('');
    }
  }, [selectedSchoolId]);

  const fetchClasses = async (schoolId: string) => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      const filtered = (data.classes || []).filter((c: Class) => c.schoolId === schoolId);
      setClasses(filtered);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load classes' : 'כשלון בטעינת כיתות');
    }
  };

  const selectedCity = cities.find(c => c.id === selectedCityId);
  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t('schedules')}
        </h1>
        <p className="text-slate-600 mt-2 text-sm md:text-base">
          {lang === 'en' ? 'Select a class and manage its weekly schedule' : 'בחר כיתה ונהל את לוח הזמנים השבועי'}
        </p>
      </div>

      {/* Selection Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4" />
                {lang === 'en' ? 'City' : 'עיר'}
              </Label>
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'en' ? 'Select city' : 'בחר עיר'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {lang === 'en' ? city.nameEn : (city.nameHe || city.nameEn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Community Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4" />
                {lang === 'en' ? 'Community' : 'קהילה'}
              </Label>
              <Select 
                value={selectedCommunityId} 
                onValueChange={setSelectedCommunityId}
                disabled={!selectedCityId || communities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'en' ? 'Select community' : 'בחר קהילה'} />
                </SelectTrigger>
                <SelectContent>
                  {communities.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      {lang === 'en' ? community.nameEn : (community.nameHe || community.nameEn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4" />
                {lang === 'en' ? 'School' : 'בית ספר'}
              </Label>
              <Select 
                value={selectedSchoolId} 
                onValueChange={setSelectedSchoolId}
                disabled={!selectedCommunityId || schools.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'en' ? 'Select school' : 'בחר בית ספר'} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <BookOpen className="w-4 h-4" />
                {lang === 'en' ? 'Class' : 'כיתה'}
              </Label>
              <Select 
                value={selectedClassId} 
                onValueChange={setSelectedClassId}
                disabled={!selectedSchoolId || classes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'en' ? 'Select class' : 'בחר כיתה'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {lang === 'en' ? `Grade ${classItem.gradeLevel}` : `כיתה ${classItem.gradeLevel}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Builder */}
      {selectedClassId ? (
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedClass?.name}
              </h2>
              <p className="text-slate-600 text-sm">
                {selectedSchool && (lang === 'en' ? selectedSchool.nameEn : (selectedSchool.nameHe || selectedSchool.nameEn))} • 
                {selectedCommunity && (lang === 'en' ? selectedCommunity.nameEn : (selectedCommunity.nameHe || selectedCommunity.nameEn))} • 
                {selectedCity && (lang === 'en' ? selectedCity.nameEn : (selectedCity.nameHe || selectedCity.nameEn))}
              </p>
            </div>

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
                <ScheduleBuilder classId={selectedClassId} dayType="sunday" />
              </TabsContent>

              <TabsContent value="weekday" className="mt-6">
                <ScheduleBuilder classId={selectedClassId} dayType="weekday" />
              </TabsContent>

              <TabsContent value="friday" className="mt-6">
                <ScheduleBuilder classId={selectedClassId} dayType="friday" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'Select a class to start' : 'בחר כיתה כדי להתחיל'}
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              {lang === 'en'
                ? 'Choose a city, community, school, and class from the dropdowns above to manage its schedule.'
                : 'בחר עיר, קהילה, בית ספר וכיתה מהתפריטים למעלה כדי לנהל את לוח הזמנים.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
