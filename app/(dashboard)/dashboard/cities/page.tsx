'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Loader2, Building } from 'lucide-react';
import { toast } from 'sonner';
import type { City } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CitiesPage() {
  const { t, lang } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameHe: '', country: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data.cities || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load cities' : 'כשלון בטעינת ערים');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({ nameEn: city.nameEn, nameHe: city.nameHe || '', country: city.country });
    } else {
      setEditingCity(null);
      setFormData({ nameEn: '', nameHe: '', country: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCity(null);
    setFormData({ nameEn: '', nameHe: '', country: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCity ? `/api/cities/${editingCity.id}` : '/api/cities';
      const method = editingCity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save city');
      }

      toast.success(
        editingCity
          ? lang === 'en' ? 'City updated successfully' : 'העיר עודכנה בהצלחה'
          : lang === 'en' ? 'City created successfully' : 'העיר נוצרה בהצלחה'
      );

      handleCloseDialog();
      fetchCities();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save city' : 'כשלון בשמירת העיר');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCity) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/cities/${deletingCity.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete city');
      }

      toast.success(lang === 'en' ? 'City deleted successfully' : 'העיר נמחקה בהצלחה');
      setDeleteDialogOpen(false);
      setDeletingCity(null);
      fetchCities();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to delete city' : 'כשלון במחיקת העיר');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container-sky">
              <Building className="w-6 h-6 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">{t('cities')}</h1>
          </div>
          <p className="text-slate-600 mt-2">
            {lang === 'en' ? 'Manage cities and locations' : 'נהל ערים ומיקומים'}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-sky text-white hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Add City' : 'הוסף עיר'}
        </Button>
      </div>

      {/* Table */}
      <Card className="gradient-card border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">
            {lang === 'en' ? 'All Cities' : 'כל העריםן'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {lang === 'en' 
                ? 'No cities yet. Click "Add City" to get started.' 
                : 'אין ערים עדיין. לחץ על "הוסף עיר" כדי להתחיל.'}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table className="data-table">
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'English Name' : 'שם באנגלית'}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'Hebrew Name' : 'שם בעברית'}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'Country' : 'מדינה'}</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((city, index) => (
                    <TableRow key={city.id} className="border-b border-slate-100 last:border-0">
                      <TableCell className="font-medium text-slate-900">{city.nameEn}</TableCell>
                      <TableCell className="font-hebrew text-slate-700">{city.nameHe}</TableCell>
                      <TableCell className="text-slate-600">{city.country}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(city)}
                            className="hover:bg-sky-100 hover:text-sky-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingCity(city);
                              setDeleteDialogOpen(true);
                            }}
                            className="hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCity
                  ? lang === 'en' ? 'Edit City' : 'ערוך עיר'
                  : lang === 'en' ? 'Add City' : 'הוסף עיר'}
              </DialogTitle>
              <DialogDescription>
                {lang === 'en'
                  ? 'Enter city information in both English and Hebrew.'
                  : 'הזן מידע על העיר באנגלית ובעברית.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nameEn">{lang === 'en' ? 'English Name' : 'שם באנגלית'}</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nameHe">{lang === 'en' ? 'Hebrew Name (Optional)' : 'שם בעברית (רשות)'}</Label>
                <Input
                  id="nameHe"
                  value={formData.nameHe}
                  onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })}
                  className="font-hebrew"
                  placeholder={lang === 'en' ? 'Optional' : 'רשות'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">{lang === 'en' ? 'Country' : 'מדינה'}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={submitting} className="gradient-sky text-white">
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
            <AlertDialogTitle>
              {lang === 'en' ? 'Are you sure?' : 'האם אתה בטוח?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'en'
                ? `This will permanently delete "${deletingCity?.nameEn}" and all associated data (communities, schools, classes). This action cannot be undone.`
                : `פעולה זו תמחק לצמיתות את "${deletingCity?.nameHe}" ואת כל הנתונים הקשורים (קהילות, בתי ספר, כיתות). לא ניתן לבטל פעולה זו.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t('cancel')}
            </AlertDialogCancel>
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
