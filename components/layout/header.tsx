'use client';

import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { t, lang, toggleLanguage } = useLanguage();

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Translate segment
    let label = segment;
    if (segment === 'dashboard') label = t('dashboard');
    else if (segment === 'cities') label = t('cities');
    else if (segment === 'communities') label = t('communities');
    else if (segment === 'schools') label = t('schools');
    else if (segment === 'classes') label = t('classes');
    else if (segment === 'schedules') label = t('schedules');
    else if (segment === 'reports') label = t('reports');
    else if (segment === 'settings') label = t('settings');

    return { href, label, isLast };
  });

  return (
    <header className="border-b bg-card sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t('home')}</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Language Switcher */}
        <Button variant="outline" onClick={toggleLanguage} size="sm">
          {lang === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
        </Button>
      </div>
    </header>
  );
}
