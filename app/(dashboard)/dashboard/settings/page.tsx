'use client';

import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground mt-2">
          {lang === 'en' ? 'Application settings' : 'הגדרות אפליקציה'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {lang === 'en' ? 'Settings' : 'הגדרות'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Settings page coming soon.' : 'דף הגדרות יגיע בקרוב.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
