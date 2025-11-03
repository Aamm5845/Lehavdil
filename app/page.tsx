'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { Building, Users, School, GraduationCap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { t, lang, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-end mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={toggleLanguage}>
                {lang === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
              </Button>
            </motion.div>
          </div>
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-bold text-slate-800 mb-4"
          >
            {t('appName')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {lang === 'en' 
              ? 'Premium School Schedule Management & Comparison System' 
              : 'מערכת ניהול והשוואת לוחות זמנים מתקדמת'}
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-sky-500">
              <CardHeader>
                <Building className="w-8 h-8 text-sky-500 mb-2" />
                <CardTitle>{t('cities')}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Manage cities and locations' : 'נהל ערים ומיקומים'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/cities">
                  <Button className="w-full bg-sky-500 hover:bg-sky-600">
                    {lang === 'en' ? 'Manage Cities' : 'נהל ערים'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-teal-500">
              <CardHeader>
                <Users className="w-8 h-8 text-teal-500 mb-2" />
                <CardTitle>{t('communities')}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Organize communities' : 'ארגן קהילות'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/communities">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600">
                    {lang === 'en' ? 'Manage Communities' : 'נהל קהילות'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-violet-500">
              <CardHeader>
                <School className="w-8 h-8 text-violet-500 mb-2" />
                <CardTitle>{t('schools')}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Boys and Girls schools' : 'בתי ספר לבנים ובנות'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/schools">
                  <Button className="w-full bg-violet-500 hover:bg-violet-600">
                    {lang === 'en' ? 'Manage Schools' : 'נהל בתי ספר'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-rose-500">
              <CardHeader>
                <GraduationCap className="w-8 h-8 text-rose-500 mb-2" />
                <CardTitle>{t('classes')}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Manage class schedules' : 'נהל לוחות זמנים'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/classes">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">
                    {lang === 'en' ? 'Manage Classes' : 'נהל כיתות'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-amber-500">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle>{t('reports')}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'View comparisons & reports' : 'צפה בדוחות והשוואות'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/reports">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600">
                    {lang === 'en' ? 'View Reports' : 'צפה בדוחות'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="hover:shadow-xl transition-all h-full border-t-4 border-t-orange-500">
              <CardHeader>
                <div className="text-2xl mb-2">⭐</div>
                <CardTitle className="text-orange-600">Belz Montreal</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Baseline for comparisons' : 'בסיס להשוואות'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/schools">
                  <Button className="w-full" variant="outline">
                    {lang === 'en' ? 'View Baseline' : 'צפה בבסיס'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {lang === 'en' ? 'Key Features' : 'תכונות מרכזיות'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Bilingual English/Hebrew' : 'דו לשוני אנגלית/עברית'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Automatic calculations' : 'חישובים אוטומטיים'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Compare with Belz Montreal' : 'השווה לבעלז מונטריאול'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Excel export' : 'ייצוא לאקסל'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Beautiful charts' : 'גרפים יפים'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>{lang === 'en' ? 'Mobile responsive' : 'מותאם לנייד'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
