'use client';

import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart } from 'lucide-react';

export default function ReportsPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('reports')}</h1>
        <p className="text-muted-foreground mt-2">
          {lang === 'en' ? 'View comparisons and reports' : 'צפה בהשוואות ודוחות'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            {lang === 'en' ? 'Reports & Comparisons' : 'דוחות והשוואות'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Add schools and classes with schedules to see comparison reports and charts.'
              : 'הוסף בתי ספר וכיתות עם לוחות זמנים כדי לראות דוחות השוואה וגרפים.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
