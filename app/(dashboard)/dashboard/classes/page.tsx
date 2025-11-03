'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { getDefaultClassName, getGradeOptions } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Class, School } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ClassesPage() {
  const { t, lang } = useLanguage();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: '', schoolId: '', gradeLevel: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, schoolsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/schools'),
      ]);
      const [classesData, schoolsData] = await Promise.all([
        classesRes.json(),
        schoolsRes.json(),
      ]);
      setClasses(classesData.classes || []);
      setSchools(schoolsData.schools || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({ name: classItem.name, schoolId: classItem.schoolId, gradeLevel: classItem.gradeLevel });
    } else {
      setEditingClass(null);
      setFormData({ name: '', schoolId: '', gradeLevel: 1 });
    }
    setDialogOpen(true);
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school && !editingClass) {
      const defaultName = getDefaultClassName(school.schoolType, formData.gradeLevel);
      setFormData({ ...formData, schoolId, name: defaultName });
    } else {
      setFormData({ ...formData, schoolId });
    }
  };

  const handleGradeLevelChange = (gradeLevel: number) => {
    const school = schools.find(s => s.id === formData.schoolId);
    if (school && !editingClass) {
      const defaultName = getDefaultClassName(school.schoolType, gradeLevel);
      setFormData({ ...formData, gradeLevel, name: defaultName });
    } else {
      setFormData({ ...formData, gradeLevel });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error();
      toast.success(editingClass ? t('updated') : t('created'));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save' : 'כשלון בשמירה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClass) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/classes/${deletingClass.id}`, { method: 'DELETE' });
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

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? (lang === 'en' ? school.nameEn : school.nameHe) : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('classes')}</h1>
          <p className="text-muted-foreground mt-2">
            {lang === 'en' ? 'Manage class schedules' : 'נהל כיתות ולוחות זמנים'}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Add Class' : 'הוסף כיתה'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'All Classes' : 'כל הכיתות'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {lang === 'en' ? 'No classes yet.' : 'אין כיתות עדיין.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === 'en' ? 'Class Name' : 'שם כיתה'}</TableHead>
                  <TableHead>{lang === 'en' ? 'School' : 'בית ספר'}</TableHead>
                  <TableHead>{lang === 'en' ? 'Grade' : 'כיתה'}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>{getSchoolName(classItem.schoolId)}</TableCell>
                    <TableCell>{classItem.gradeLevel}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/schedules/${classItem.id}`}>
                          <Button variant="ghost" size="icon">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(classItem)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingClass(classItem); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? (lang === 'en' ? 'Edit Class' : 'ערוך כיתה') : (lang === 'en' ? 'Add Class' : 'הוסף כיתה')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'School' : 'בית ספר'}</Label>
                <Select value={formData.schoolId} onValueChange={handleSchoolChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id}>{lang === 'en' ? school.nameEn : school.nameHe}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Grade Level' : 'רמת כיתה'}</Label>
                <Select 
                  value={formData.gradeLevel.toString()} 
                  onValueChange={(v) => handleGradeLevelChange(parseInt(v))}
                  disabled={!formData.schoolId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.schoolId ? '' : (lang === 'en' ? 'Select school first' : 'בחר בית ספר קודם')} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.schoolId && (() => {
                      const school = schools.find(s => s.id === formData.schoolId);
                      if (!school) return null;
                      const grades = getGradeOptions(school.schoolType);
                      return grades.map(grade => (
                        <SelectItem key={grade.value} value={grade.value.toString()}>
                          {lang === 'en' ? grade.labelEn : grade.label}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Class Name' : 'שם כיתה'}</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <p className="text-xs text-muted-foreground">
                  {lang === 'en' ? 'Auto-generated, but you can edit it' : 'נוצר אוטומטית, אך ניתן לערוך'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{lang === 'en' ? 'Are you sure?' : 'האם אתה בטוח?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'en'
                ? `This will delete "${deletingClass?.name}" and all time blocks.`
                : `זה ימחק את "${deletingClass?.name}" ואת כל בלוקי הזמן.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive hover:bg-destructive/90">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
