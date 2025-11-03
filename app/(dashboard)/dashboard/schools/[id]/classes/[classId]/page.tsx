'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, ChevronLeft, Clock, BookOpen, Pencil, Trash2, GraduationCap, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import type { School, Class, TimeBlock, DayType, SubjectType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { motion } from 'framer-motion';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;
  const classId = params.classId as string;
  const { t, lang } = useLanguage();

  const [school, setSchool] = useState<School | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);
  const [deletingTimeBlock, setDeletingTimeBlock] = useState<TimeBlock | null>(null);
  const [selectedDayType, setSelectedDayType] = useState<DayType>('sunday');
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    subjectType: 'hebrew' as SubjectType,
    description: '',
    teacher: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schoolId, classId]);

  const fetchData = async () => {
    try {
      const [schoolRes, classRes, timeBlocksRes] = await Promise.all([
        fetch(`/api/schools/${schoolId}`),
        fetch(`/api/classes/${classId}`),
        fetch(`/api/time-blocks?classId=${classId}`),
      ]);

      if (!schoolRes.ok || !classRes.ok) {
        throw new Error('Data not found');
      }

      const [schoolData, classResData, timeBlocksData] = await Promise.all([
        schoolRes.json(),
        classRes.json(),
        timeBlocksRes.json(),
      ]);

      setSchool(schoolData.school);
      setClassData(classResData.class);
      setTimeBlocks(timeBlocksData.timeBlocks || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load class data' : 'כשלון בטעינת נתוני כיתה');
      router.push(`/dashboard/schools/${schoolId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (timeBlock?: TimeBlock, dayType?: DayType) => {
    if (timeBlock) {
      setEditingTimeBlock(timeBlock);
      setFormData({
        startTime: timeBlock.startTime,
        endTime: timeBlock.endTime,
        subjectType: timeBlock.subjectType,
        description: timeBlock.description || '',
        teacher: timeBlock.teacher || '',
      });
      setSelectedDayType(timeBlock.dayType);
    } else {
      setEditingTimeBlock(null);
      setFormData({
        startTime: '',
        endTime: '',
        subjectType: 'hebrew',
        description: '',
        teacher: '',
      });
      if (dayType) setSelectedDayType(dayType);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Get current time blocks for this day to determine sortOrder
      const dayTimeBlocks = timeBlocks.filter(tb => tb.dayType === selectedDayType);
      const sortOrder = editingTimeBlock 
        ? editingTimeBlock.sortOrder 
        : dayTimeBlocks.length > 0 
          ? Math.max(...dayTimeBlocks.map(tb => tb.sortOrder)) + 1 
          : 0;

      const url = editingTimeBlock ? `/api/time-blocks/${editingTimeBlock.id}` : '/api/time-blocks';
      const method = editingTimeBlock ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          classId,
          dayType: selectedDayType,
          sortOrder,
        }),
      });
      if (!response.ok) throw new Error();
      toast.success(editingTimeBlock ? t('updated') : t('created'));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save' : 'כשלון בשמירה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTimeBlock) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/time-blocks/${deletingTimeBlock.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success(t('deleted'));
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to delete' : 'כשלון במחיקה');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubjectColor = (type: SubjectType) => {
    switch (type) {
      case 'hebrew':
        return 'from-blue-500 to-cyan-500';
      case 'english':
        return 'from-green-500 to-emerald-500';
      case 'break':
        return 'from-amber-500 to-orange-500';
      case 'other':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getSubjectBadgeVariant = (type: SubjectType): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'hebrew':
        return 'default';
      case 'english':
        return 'secondary';
      case 'break':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTimeBlocksForDay = (dayType: DayType) => {
    return timeBlocks
      .filter(tb => tb.dayType === dayType)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getDayLabel = (dayType: DayType) => {
    if (lang === 'en') {
      return dayType === 'sunday' ? 'Sunday' : dayType === 'weekday' ? 'Monday-Thursday' : 'Friday';
    }
    return dayType === 'sunday' ? 'יום ראשון' : dayType === 'weekday' ? 'שני-חמישי' : 'יום שישי';
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!school || !classData) {
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
              <Link href="/dashboard/schools">{t('schools')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/schools/${schoolId}`} className="flex items-center gap-1">
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

      {/* Class Header Card */}
      <Card className="overflow-hidden border-slate-200 shadow-lg">
        <div className={`h-3 w-full bg-gradient-to-r ${gradientClass}`} />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <GraduationCap className="w-8 h-8 text-white" />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {classData.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-slate-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{lang === 'en' ? `Grade ${classData.gradeLevel}` : `כיתה ${classData.gradeLevel}`}</span>
                  </div>
                  <span>•</span>
                  <span>{lang === 'en' ? school.nameEn : (school.nameHe || school.nameEn)}</span>
                </div>
              </div>
            </div>

            <Link href={`/dashboard/schools/${schoolId}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                {lang === 'en' ? 'Back to School' : 'חזור לבית הספר'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Management */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="sunday" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-violet-600" />
                  {lang === 'en' ? 'Weekly Schedule' : 'לוח זמנים שבועי'}
                </h2>
                <p className="text-slate-600 mt-1 text-sm">
                  {lang === 'en' ? 'Manage time blocks for each day' : 'נהל בלוקי זמן לכל יום'}
                </p>
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="sunday">{lang === 'en' ? 'Sunday' : 'ראשון'}</TabsTrigger>
              <TabsTrigger value="weekday">{lang === 'en' ? 'Mon-Thu' : 'שני-חמישי'}</TabsTrigger>
              <TabsTrigger value="friday">{lang === 'en' ? 'Friday' : 'שישי'}</TabsTrigger>
            </TabsList>

            {(['sunday', 'weekday', 'friday'] as DayType[]).map(dayType => {
              const dayTimeBlocks = getTimeBlocksForDay(dayType);
              
              return (
                <TabsContent key={dayType} value={dayType} className="space-y-4">
                  {/* Add Time Block Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleOpenDialog(undefined, dayType)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {lang === 'en' ? 'Add Time Block' : 'הוסף בלוק זמן'}
                    </Button>
                  </div>

                  {/* Time Blocks */}
                  {dayTimeBlocks.length === 0 ? (
                    <Card className="border-2 border-dashed border-slate-200">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {lang === 'en' ? 'No time blocks yet' : 'אין בלוקי זמן עדיין'}
                        </h3>
                        <p className="text-slate-600 text-center mb-4 max-w-md text-sm">
                          {lang === 'en'
                            ? `Add time blocks to create a schedule for ${getDayLabel(dayType)}.`
                            : `הוסף בלוקי זמן כדי ליצור לוח זמנים עבור ${getDayLabel(dayType)}.`}
                        </p>
                        <Button
                          onClick={() => handleOpenDialog(undefined, dayType)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {lang === 'en' ? 'Add First Block' : 'הוסף בלוק ראשון'}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {dayTimeBlocks.map((timeBlock, index) => {
                        const gradientColor = getSubjectColor(timeBlock.subjectType);
                        
                        return (
                          <motion.div
                            key={timeBlock.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="group hover:shadow-md transition-all duration-200 border-slate-200 overflow-hidden">
                              <div className={`h-1.5 w-full bg-gradient-to-r ${gradientColor}`} />
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  {/* Time and Icon */}
                                  <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                      <Clock className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      {/* Time Range */}
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg font-bold text-slate-900">
                                          {timeBlock.startTime} - {timeBlock.endTime}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {calculateDuration(timeBlock.startTime, timeBlock.endTime)}
                                        </Badge>
                                        <Badge variant={getSubjectBadgeVariant(timeBlock.subjectType)}>
                                          {timeBlock.subjectType === 'hebrew'
                                            ? (lang === 'en' ? 'Hebrew' : 'קודש')
                                            : timeBlock.subjectType === 'english'
                                            ? (lang === 'en' ? 'English' : 'חול')
                                            : timeBlock.subjectType === 'break'
                                            ? (lang === 'en' ? 'Break' : 'הפסקה')
                                            : (lang === 'en' ? 'Other' : 'אחר')
                                          }
                                        </Badge>
                                      </div>

                                      {/* Description and Teacher */}
                                      {timeBlock.description && (
                                        <p className="text-sm text-slate-700 mb-1 line-clamp-2">
                                          {timeBlock.description}
                                        </p>
                                      )}
                                      {timeBlock.teacher && (
                                        <p className="text-sm text-slate-500">
                                          {lang === 'en' ? 'Teacher: ' : 'מורה: '}{timeBlock.teacher}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleOpenDialog(timeBlock)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setDeletingTimeBlock(timeBlock);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Time Block Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTimeBlock
                  ? (lang === 'en' ? 'Edit Time Block' : 'ערוך בלוק זמן')
                  : (lang === 'en' ? 'Add Time Block' : 'הוסף בלוק זמן')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{lang === 'en' ? 'Start Time' : 'שעת התחלה'}</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{lang === 'en' ? 'End Time' : 'שעת סיום'}</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Subject Type' : 'סוג מקצוע'}</Label>
                <Select
                  value={formData.subjectType}
                  onValueChange={(value: SubjectType) => setFormData({ ...formData, subjectType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hebrew">{lang === 'en' ? 'Hebrew' : 'קודש'}</SelectItem>
                    <SelectItem value="english">{lang === 'en' ? 'English' : 'חול'}</SelectItem>
                    <SelectItem value="break">{lang === 'en' ? 'Break' : 'הפסקה'}</SelectItem>
                    <SelectItem value="other">{lang === 'en' ? 'Other' : 'אחר'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Description (Optional)' : 'תיאור (רשות)'}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={lang === 'en' ? 'e.g., Math, History, Recess' : 'לדוגמה: מתמטיקה, היסטוריה, הפסקה'}
                />
              </div>

              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Teacher (Optional)' : 'מורה (רשות)'}</Label>
                <Input
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder={lang === 'en' ? 'Teacher name' : 'שם המורה'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{lang === 'en' ? 'Are you sure?' : 'האם אתה בטוח?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'en'
                ? `This will delete the time block from ${deletingTimeBlock?.startTime} to ${deletingTimeBlock?.endTime}.`
                : `זה ימחק את בלוק הזמן מ-${deletingTimeBlock?.startTime} עד ${deletingTimeBlock?.endTime}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
