'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { Building, Users, School, GraduationCap, TrendingUp, Star, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Professional CRM-style colors - sophisticated and clean
const COLORS = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
  },
  teal: {
    500: '#14b8a6',
    600: '#0d9488',
  },
  sky: {
    500: '#0ea5e9',
    600: '#0284c7',
  },
  violet: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  rose: {
    500: '#f43f5e',
    600: '#e11d48',
  },
  amber: {
    500: '#f59e0b',
    600: '#d97706',
  },
  emerald: {
    500: '#10b981',
    600: '#059669',
  },
};

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<{
    cities: number;
    communities: number;
    schools: number;
    classes: number;
    boysSchools: number;
    girlsSchools: number;
    baselineSchools: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/cities').then(r => r.json()),
      fetch('/api/communities').then(r => r.json()).catch(() => ({ communities: [] })),
      fetch('/api/schools').then(r => r.json()).catch(() => ({ schools: [] })),
      fetch('/api/classes').then(r => r.json()).catch(() => ({ classes: [] })),
    ])
      .then(([cities, communities, schools, classes]) => {
        const schoolsList = schools.schools || [];
        setStats({
          cities: cities.cities?.length || 0,
          communities: communities.communities?.length || 0,
          schools: schoolsList.length || 0,
          classes: classes.classes?.length || 0,
          boysSchools: schoolsList.filter((s: any) => s.schoolType === 'boys').length,
          girlsSchools: schoolsList.filter((s: any) => s.schoolType === 'girls').length,
          baselineSchools: schoolsList.filter((s: any) => s.isBaseline).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: t('cities'),
      value: stats?.cities || 0,
      icon: Building,
      color: COLORS.sky[500],
      bgColor: 'bg-sky-50',
      href: '/dashboard/cities',
    },
    {
      title: t('communities'),
      value: stats?.communities || 0,
      icon: Users,
      color: COLORS.teal[500],
      bgColor: 'bg-teal-50',
      href: '/dashboard/communities',
    },
    {
      title: t('schools'),
      value: stats?.schools || 0,
      icon: School,
      color: COLORS.violet[500],
      bgColor: 'bg-violet-50',
      href: '/dashboard/schools',
    },
    {
      title: t('classes'),
      value: stats?.classes || 0,
      icon: GraduationCap,
      color: COLORS.rose[500],
      bgColor: 'bg-rose-50',
      href: '/dashboard/classes',
    },
  ];

  // Chart data
  const schoolTypeData = [
    { name: lang === 'en' ? 'Boys' : 'בנים', value: stats?.boysSchools || 0, color: COLORS.sky[600] },
    { name: lang === 'en' ? 'Girls' : 'בנות', value: stats?.girlsSchools || 0, color: COLORS.rose[500] },
  ];

  const overviewData = [
    { name: lang === 'en' ? 'Cities' : 'ערים', value: stats?.cities || 0, fill: COLORS.sky[500] },
    { name: lang === 'en' ? 'Communities' : 'קהילות', value: stats?.communities || 0, fill: COLORS.teal[500] },
    { name: lang === 'en' ? 'Schools' : 'בתי ספר', value: stats?.schools || 0, fill: COLORS.violet[500] },
    { name: lang === 'en' ? 'Classes' : 'כיתות', value: stats?.classes || 0, fill: COLORS.rose[500] },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header - Clean and Professional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('dashboard')}</h1>
            <p className="text-slate-600">
              {lang === 'en' 
                ? 'Manage your school schedules efficiently' 
                : 'נהל את לוחות הזמנים ביעילות'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/cities">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                {lang === 'en' ? 'Get Started' : 'התחל'}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards - Clean 4-column layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-slate-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon style={{ color: stat.color }} className="w-6 h-6" />
                      </div>
                    </div>
                    {loading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="text-4xl font-bold text-slate-800 mb-2"
                      >
                        {stat.value}
                      </motion.div>
                    )}
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row - 2 columns side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - School Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-violet-500" />
                <CardTitle className="text-slate-800">
                  {lang === 'en' ? 'School Distribution' : 'התפלגות בתי ספר'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (stats?.schools || 0) === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400">
                  <PieChartIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>{lang === 'en' ? 'No data available' : 'אין נתונים זמינים'}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={schoolTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {schoolTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart - Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-500" />
                <CardTitle className="text-slate-800">
                  {lang === 'en' ? 'System Overview' : 'סקירת מערכת'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Belz Montreal Baseline - If exists */}
      {stats && stats.baselineSchools > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Belz Montreal</h3>
                    <p className="text-sm text-slate-600">
                      {lang === 'en' ? 'Baseline for Comparisons' : 'בסיס להשוואות'}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/schools">
                  <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-300">
                    {lang === 'en' ? 'View Details' : 'צפה בפרטים'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {lang === 'en' ? 'Quick Actions' : 'פעולות מהירות'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/cities">
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                  <Building className="w-5 h-5 mr-3 text-sky-500" />
                  <span className="text-slate-700">{lang === 'en' ? 'Manage Cities' : 'נהל ערים'}</span>
                </Button>
              </Link>
              <Link href="/dashboard/communities">
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                  <Users className="w-5 h-5 mr-3 text-teal-500" />
                  <span className="text-slate-700">{lang === 'en' ? 'Manage Communities' : 'נהל קהילות'}</span>
                </Button>
              </Link>
              <Link href="/dashboard/schools">
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                  <School className="w-5 h-5 mr-3 text-violet-500" />
                  <span className="text-slate-700">{lang === 'en' ? 'Manage Schools' : 'נהל בתי ספר'}</span>
                </Button>
              </Link>
              <Link href="/dashboard/classes">
                <Button variant="outline" className="w-full justify-start h-auto py-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                  <GraduationCap className="w-5 h-5 mr-3 text-rose-500" />
                  <span className="text-slate-700">{lang === 'en' ? 'Manage Classes' : 'נהל כיתות'}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
