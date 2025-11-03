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
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard', color: 'text-slate-600', bgColor: 'bg-slate-100', activeColor: 'bg-slate-600' },
  { id: 'schools', href: '/dashboard/schools', icon: School, labelKey: 'schools', color: 'text-violet-600', bgColor: 'bg-violet-100', activeColor: 'bg-violet-600' },
  { id: 'schedules', href: '/dashboard/schedules', icon: Calendar, labelKey: 'schedules', color: 'text-amber-600', bgColor: 'bg-amber-100', activeColor: 'bg-amber-600' },
  { id: 'reports', href: '/dashboard/reports', icon: FileBarChart, labelKey: 'reports', color: 'text-emerald-600', bgColor: 'bg-emerald-100', activeColor: 'bg-emerald-600' },
  { id: 'settings', href: '/dashboard/settings', icon: Settings, labelKey: 'settings', color: 'text-gray-600', bgColor: 'bg-gray-100', activeColor: 'bg-gray-600' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            ל
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800">{t('appName')}</span>
            <span className="text-xs text-slate-500">
              {lang === 'en' ? 'Schedule Manager' : 'מנהל לוחות זמנים'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? `${item.activeColor} text-white shadow-md`
                  : 'hover:bg-slate-50 text-slate-700'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isActive ? 'bg-white/20' : `${item.bgColor} group-hover:bg-opacity-80`
              )}>
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-white' : item.color
                )} />
              </div>
              <span className="font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <div className="absolute right-0 w-1 h-8 bg-white/30 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 text-center font-medium">
          {lang === 'en' ? '© 2024 Lehavdil' : '© 2024 להבדיל'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white h-screen sticky top-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
