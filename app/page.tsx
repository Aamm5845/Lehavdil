'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { ArrowRight, BarChart3, Clock, BookOpen, TrendingUp, Star, ScrollText, Flag } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { lang, toggleLanguage } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: lang === 'en' ? 'Comprehensive Comparisons' : 'השוואות מקיפות',
      description: lang === 'en' 
        ? 'Compare school schedules and hours across different Mosdos with detailed analytics and insights.'
        : 'השווה לוחות זמנים ושעות לימוד בין מוסדות שונים עם ניתוחים מפורטים ותובנות.',
      color: 'from-sky-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-sky-100 to-teal-100',
      iconColor: 'text-sky-600',
    },
    {
      icon: Clock,
      title: lang === 'en' ? 'Precise Time Tracking' : 'מעקב זמן מדויק',
      description: lang === 'en'
        ? 'Track Hebrew, English, and break times with automatic calculations and weekly totals.'
        : 'עקוב אחר שעות קודש, חול והפסקות עם חישובים אוטומטיים וסיכומים שבועיים.',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100',
      iconColor: 'text-violet-600',
    },
    {
      icon: BookOpen,
      title: lang === 'en' ? 'Multi-School Management' : 'ניהול רב מוסדות',
      description: lang === 'en'
        ? 'Manage multiple communities, schools, and classes from a single, intuitive dashboard.'
        : 'נהל מספר קהילות, בתי ספר וכיתות ממערכת אחת ואינטואיטיבית.',
      color: 'from-rose-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100',
      iconColor: 'text-rose-600',
    },
    {
      icon: TrendingUp,
      title: lang === 'en' ? 'Beautiful Reports' : 'דוחות מרשימים',
      description: lang === 'en'
        ? 'Generate stunning visual reports with charts, graphs, and Excel exports for easy sharing.'
        : 'צור דוחות ויזואליים מרשימים עם גרפים, תרשימים וייצוא לאקסל לשיתוף קל.',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-sky-200/30 to-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 relative z-10">
        {/* Language Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-end mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              onClick={toggleLanguage}
              className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm"
            >
              {lang === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16 sm:mb-20 lg:mb-24"
        >
          {/* Logo/Icon - Matching Dashboard with ל */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-sky-500 via-violet-500 to-rose-500 mb-6 sm:mb-8 shadow-xl relative"
          >
            <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            <div className="absolute top-1 right-1 text-white font-bold text-xl sm:text-2xl opacity-90">ל</div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6"
          >
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              {lang === 'en' ? 'Lehavdil' : 'להבדיל'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl lg:text-3xl text-slate-600 mb-4 font-medium max-w-3xl mx-auto"
          >
            {lang === 'en' 
              ? 'Comparing Montreal hours vs other Mosdos' 
              : 'השוואת שעות מונטריאול מול מוסדות אחרים'}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base sm:text-lg text-slate-500 mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            {lang === 'en'
              ? 'A premium bilingual platform for managing and comparing Hasidic school schedules across communities.'
              : 'פלטפורמה דו-לשונית מתקדמת לניהול והשוואת לוחות זמנים של מוסדות חסידיים בין קהילות.'}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-700 hover:to-violet-700 text-white px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group"
                >
                  {lang === 'en' ? 'Enter Dashboard' : 'כניסה למערכת'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Balance Scale Visualization - Compact Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 shadow-xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              {/* Scale visualization */}
              <div className="relative">
                {/* Scale arm with tilt */}
                <div className="flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: -5, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8, type: "spring" }}
                    className="relative w-full max-w-2xl"
                  >
                    <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full" />
                  </motion.div>
                </div>

                {/* Two sides comparison */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {/* Montreal Side - WITH FLAG (Heavier - More Torah) */}
                  <motion.div
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 shadow-lg relative">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Flag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white text-center mb-3">
                        {lang === 'en' ? 'Montreal' : 'מונטריאול'}
                      </h3>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="text-2xl sm:text-3xl font-bold text-white text-center">
                          25+
                        </div>
                        <div className="text-white/70 text-center text-xs">
                          {lang === 'en' ? 'hrs/week' : 'שע/שבוע'}
                        </div>
                      </div>
                      {/* Indicator */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-md">
                        ↓
                      </div>
                    </div>
                  </motion.div>

                  {/* Other Mosdos - WITH TORAH SCROLL (Lighter - Less Torah) */}
                  <motion.div
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -8, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
                  >
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 sm:p-6 shadow-lg relative">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <ScrollText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white text-center mb-3">
                        {lang === 'en' ? 'Other Mosdos' : 'מוסדות אחרים'}
                      </h3>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <div className="text-2xl sm:text-3xl font-bold text-white text-center">
                          18-20
                        </div>
                        <div className="text-white/70 text-center text-xs">
                          {lang === 'en' ? 'hrs/week' : 'שע/שבוע'}
                        </div>
                      </div>
                      {/* Indicator */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-md">
                        ↑
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm sm:text-base text-slate-600">
                    {lang === 'en'
                      ? 'Comparing Torah learning hours: Montreal vs. Government-influenced institutions'
                      : 'השוואת שעות לימוד תורה: מונטריאול מול מוסדות שונים'}
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Belz Montreal Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4 }}
          className="max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="p-3 sm:p-4 bg-white rounded-xl shadow-md"
                  >
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 fill-amber-500" />
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                      Belz Montreal
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600">
                      {lang === 'en' ? 'The baseline standard for all comparisons' : 'תקן הבסיס לכל ההשוואות'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-amber-700">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">✓</div>
                    <div className="text-xs sm:text-sm">
                      {lang === 'en' ? 'Reference' : 'יחוס'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              {lang === 'en' ? 'Powerful Features' : 'תכונות מתקדמות'}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              {lang === 'en'
                ? 'Everything you need to manage and compare school schedules effectively'
                : 'כל מה שצריך לניהול והשוואת לוחות זמנים בצורה יעילה'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 h-full group">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} mb-4 group-hover:shadow-lg transition-shadow`}
                      >
                        <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                      </motion.div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-0 shadow-2xl max-w-3xl mx-auto">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                {lang === 'en' ? 'Ready to get started?' : 'מוכנים להתחיל?'}
              </h3>
              <p className="text-slate-300 mb-6 sm:mb-8 text-base sm:text-lg">
                {lang === 'en'
                  ? 'Access the dashboard and start managing your school schedules today'
                  : 'גשו למערכת והתחילו לנהל את לוחות הזמנים שלכם היום'}
              </p>
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-white text-slate-800 hover:bg-slate-100 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl group"
                  >
                    {lang === 'en' ? 'Launch Dashboard' : 'פתח מערכת'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
