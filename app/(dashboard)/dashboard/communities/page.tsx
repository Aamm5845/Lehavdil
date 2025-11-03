'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Community, City } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunitiesPage() {
  const { t, lang } = useLanguage();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [deletingCommunity, setDeletingCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameHe: '', cityId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [communitiesRes, citiesRes] = await Promise.all([
        fetch('/api/communities'),
        fetch('/api/cities'),
      ]);
      const [communitiesData, citiesData] = await Promise.all([
        communitiesRes.json(),
        citiesRes.json(),
      ]);
      setCommunities(communitiesData.communities || []);
      setCities(citiesData.cities || []);
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to load data' : 'כשלון בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (community?: Community) => {
    if (community) {
      setEditingCommunity(community);
      setFormData({ nameEn: community.nameEn, nameHe: community.nameHe || '', cityId: community.cityId });
    } else {
      setEditingCommunity(null);
      setFormData({ nameEn: '', nameHe: '', cityId: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingCommunity ? `/api/communities/${editingCommunity.id}` : '/api/communities';
      const method = editingCommunity ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error();
      toast.success(editingCommunity ? t('updated') : t('created'));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(lang === 'en' ? 'Failed to save' : 'כשלון בשמירה');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCommunity) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/communities/${deletingCommunity.id}`, { method: 'DELETE' });
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

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city ? (lang === 'en' ? city.nameEn : city.nameHe) : '';
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container-teal">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">{t('communities')}</h1>
          </div>
          <p className="text-slate-600 mt-2">
            {lang === 'en' ? 'Manage Hasidic communities' : 'נהל קהילות חסידיות'}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-teal text-white hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Add Community' : 'הוסף קהילה'}
        </Button>
      </div>

      <Card className="gradient-card border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">{lang === 'en' ? 'All Communities' : 'כל הקהילות'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {lang === 'en' ? 'No communities yet.' : 'אין קהילות עדיין.'}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table className="data-table">
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'English Name' : 'שם באנגלית'}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'Hebrew Name' : 'שם בעברית'}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{lang === 'en' ? 'City' : 'עיר'}</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community) => (
                    <TableRow key={community.id} className="border-b border-slate-100 last:border-0">
                      <TableCell className="font-medium text-slate-900">{community.nameEn}</TableCell>
                      <TableCell className="font-hebrew text-slate-700">{community.nameHe}</TableCell>
                      <TableCell className="text-slate-600">{getCityName(community.cityId)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(community)} className="hover:bg-teal-100 hover:text-teal-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeletingCommunity(community); setDeleteDialogOpen(true); }} className="hover:bg-rose-100 hover:text-rose-600 transition-colors">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCommunity ? (lang === 'en' ? 'Edit Community' : 'ערוך קהילה') : (lang === 'en' ? 'Add Community' : 'הוסף קהילה')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'English Name' : 'שם באנגלית'}</Label>
                <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'Hebrew Name' : 'שם בעברית'}</Label>
                <Input value={formData.nameHe} onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })} className="font-hebrew" required />
              </div>
              <div className="grid gap-2">
                <Label>{lang === 'en' ? 'City' : 'עיר'}</Label>
                <Select value={formData.cityId} onValueChange={(value) => setFormData({ ...formData, cityId: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {lang === 'en' ? city.nameEn : city.nameHe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" disabled={submitting} className="gradient-teal text-white">
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
                ? `This will delete "${deletingCommunity?.nameEn}" and all schools and classes.`
                : `זה ימחק את "${deletingCommunity?.nameHe}" ואת כל בתי הספר והכיתות.`}
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
