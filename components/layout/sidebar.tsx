'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import {
  LayoutDashboard,
  School,
  Calendar,
  FileBarChart,
  Settings,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navigationItems = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'schools', href: '/dashboard/schools', icon: School, labelKey: 'schools' },
  { id: 'schedules', href: '/dashboard/schedules', icon: Calendar, labelKey: 'schedules' },
  { id: 'reports', href: '/dashboard/reports', icon: FileBarChart, labelKey: 'reports' },
  { id: 'settings', href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 shadow-sm">
            ל
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-sidebar-foreground tracking-tight">{t('appName')}</span>
            <span className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Schedule Manager' : 'מנהל לוחות זמנים'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-sidebar-accent-foreground' : 'text-muted-foreground')} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center">
          {lang === 'en' ? '© 2026 Lehavdil' : '© 2026 להבדיל'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
