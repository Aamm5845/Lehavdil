'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Building2, MapPin, Users, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { City, Community, School } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SchoolsPage() {
  const { t, lang } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameHe: '', country: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [citiesRes, communitiesRes, schoolsRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/communities'),
        fetch('/api/schools'),
      ]);
      const [citiesData, communitiesData, schoolsData] = await Promise.all([
        citiesRes.json(),
        communitiesRes.json(),
        schoolsRes.json(),
      ]);
      setCities(citiesData.cities || []);
      setCommunities(communitiesData.communities || []);
      setSchools(schoolsData.schools || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
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
      if (!response.ok) throw new Error();
      toast.success(editingCity ? t('updated') : t('created'));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save' : 'כשלון בשמירה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCity) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/cities/${deletingCity.id}`, { method: 'DELETE' });
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

  const getCommunityCount = (cityId: string) => {
    return communities.filter(c => c.cityId === cityId).length;
  };

  const getSchoolsCount = (cityId: string) => {
    const cityCommunities = communities.filter(c => c.cityId === cityId);
    return schools.filter(s => cityCommunities.some(c => c.id === s.communityId)).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            {lang === 'en' ? 'Cities' : 'ערים'}
          </h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base">
            {lang === 'en' ? 'Select a city to view communities and schools' : 'בחר עיר כדי לראות קהילות ובתי ספר'}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          size="lg"
          className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          {lang === 'en' ? 'Add City' : 'הוסף עיר'}
        </Button>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {lang === 'en' ? 'No cities yet' : 'אין ערים עדיין'}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {lang === 'en' 
                ? 'Get started by adding cities. You can then add communities and schools.' 
                : 'התחל על ידי הוספת ערים. לאחר מכן תוכל להוסיף קהילות ובתי ספר.'}
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              size="lg"
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              {lang === 'en' ? 'Add Your First City' : 'הוסף את העיר הראשונה'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city, index) => {
            const communityCount = getCommunityCount(city.id);
            const schoolsCount = getSchoolsCount(city.id);
            
            return (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/dashboard/schools/${city.id}`}>
                  <Card className="group cursor-pointer bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-slate-300">
                    <CardContent className="p-4">
                    
                      {/* Icon and Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-sky-50">
                          <Building2 style={{ color: '#0ea5e9' }} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
                            {lang === 'en' ? city.nameEn : (city.nameHe || city.nameEn)}
                          </h3>
                          <p className="text-xs text-slate-500">{city.country}</p>
                        </div>
                      </div>

                      {/* Stats - Compact */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{lang === 'en' ? 'Communities' : 'קהילות'}</span>
                          <span className="font-semibold text-slate-800">{communityCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{lang === 'en' ? 'Schools' : 'בתי ספר'}</span>
                          <span className="font-semibold text-slate-800">{schoolsCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCity ? (lang === 'en' ? 'Edit City' : 'ערוך עיר') : (lang === 'en' ? 'Add City' : 'הוסף עיר')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'English Name' : 'שם באנגלית'}</Label>
                <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Hebrew Name (Optional)' : 'שם בעברית (רשות)'}</Label>
                <Input value={formData.nameHe} onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })} className="font-hebrew" />
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Country' : 'מדינה'}</Label>
                <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
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
                ? `This will delete "${deletingCity?.nameEn}" and all associated communities, schools, and classes.`
                : `זה ימחק את "${deletingCity?.nameHe || deletingCity?.nameEn}" ואת כל הקהילות, בתי הספר והכיתות.`}
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
