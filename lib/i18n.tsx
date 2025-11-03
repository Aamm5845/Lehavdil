'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'he';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [dir, setDir] = useState<Direction>('ltr');

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'he')) {
      setLang(savedLang);
      setDir(savedLang === 'he' ? 'rtl' : 'ltr');
    }
  }, []);

  useEffect(() => {
    // Update HTML attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    
    // Update font class
    if (lang === 'he') {
      document.documentElement.classList.add('font-hebrew');
    } else {
      document.documentElement.classList.remove('font-hebrew');
    }
  }, [lang, dir]);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'he' : 'en';
    const newDir = newLang === 'he' ? 'rtl' : 'ltr';
    setLang(newLang);
    setDir(newDir);
    localStorage.setItem('language', newLang);
  };

  const t = (key: string): string => {
    const translations = lang === 'en' ? enTranslations : heTranslations;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Translation objects
const enTranslations: Record<string, string> = {
  // App
  appName: 'Lehavdil',
  
  // Navigation
  dashboard: 'Dashboard',
  cities: 'Cities',
  communities: 'Communities',
  schools: 'Schools',
  classes: 'Classes',
  schedules: 'Schedules',
  reports: 'Reports & Comparisons',
  settings: 'Settings',
  
  // Actions
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  search: 'Search',
  filter: 'Filter',
  export: 'Export',
  exportExcel: 'Export to Excel',
  duplicate: 'Duplicate',
  confirm: 'Confirm',
  
  // Form labels
  englishName: 'English Name',
  hebrewName: 'Hebrew Name',
  schoolType: 'School Type',
  boys: 'Boys',
  girls: 'Girls',
  gradeLevel: 'Grade Level',
  className: 'Class Name',
  startTime: 'Start Time',
  endTime: 'End Time',
  subject: 'Subject',
  description: 'Description',
  teacher: 'Teacher',
  duration: 'Duration',
  
  // Subject types
  hebrew: 'Hebrew',
  english: 'English',
  break: 'Break',
  other: 'Other',
  
  // Day types
  sunday: 'Sunday',
  weekday: 'Monday-Thursday',
  friday: 'Friday',
  
  // Dashboard
  totalCities: 'Total Cities',
  totalCommunities: 'Total Communities',
  totalSchools: 'Total Schools',
  totalClasses: 'Total Classes',
  recentActivity: 'Recent Activity',
  quickActions: 'Quick Actions',
  
  // Comparisons
  baseline: 'Baseline',
  comparison: 'Comparison',
  compareWithBelz: 'Compare with Belz Montreal',
  hebrewHours: 'Hebrew Hours',
  englishHours: 'English Hours',
  breakTime: 'Break Time',
  totalHours: 'Total Hours',
  weeklyTotal: 'Weekly Total',
  difference: 'Difference',
  
  // Messages
  noData: 'No data available',
  loading: 'Loading...',
  success: 'Success',
  error: 'Error',
  deleteConfirm: 'Are you sure you want to delete this item?',
  cascadeWarning: 'This will also delete all related items.',
};

const heTranslations: Record<string, string> = {
  // App
  appName: 'להבדיל',
  
  // Navigation
  dashboard: 'לוח בקרה',
  cities: 'ערים',
  communities: 'קהילות',
  schools: 'בתי ספר',
  classes: 'כיתות',
  schedules: 'לוחות זמנים',
  reports: 'דוחות והשוואות',
  settings: 'הגדרות',
  
  // Actions
  add: 'הוסף',
  edit: 'ערוך',
  delete: 'מחק',
  save: 'שמור',
  cancel: 'בטל',
  search: 'חפש',
  filter: 'סנן',
  export: 'ייצא',
  exportExcel: 'ייצא לאקסל',
  duplicate: 'שכפל',
  confirm: 'אשר',
  
  // Form labels
  englishName: 'שם באנגלית',
  hebrewName: 'שם בעברית',
  schoolType: 'סוג בית ספר',
  boys: 'בנים',
  girls: 'בנות',
  gradeLevel: 'כיתה',
  className: 'שם כיתה',
  startTime: 'שעת התחלה',
  endTime: 'שעת סיום',
  subject: 'מקצוע',
  description: 'תיאור',
  teacher: 'מורה',
  duration: 'משך',
  
  // Subject types
  hebrew: 'קודש',
  english: 'חול',
  break: 'הפסקה',
  other: 'אחר',
  
  // Day types
  sunday: 'יום ראשון',
  weekday: 'שני-חמישי',
  friday: 'יום שישי',
  
  // Dashboard
  totalCities: 'סה"כ ערים',
  totalCommunities: 'סה"כ קהילות',
  totalSchools: 'סה"כ בתי ספר',
  totalClasses: 'סה"כ כיתות',
  recentActivity: 'פעילות אחרונה',
  quickActions: 'פעולות מהירות',
  
  // Comparisons
  baseline: 'בסיס',
  comparison: 'השוואה',
  compareWithBelz: 'השווה לבעלז מונטריאול',
  hebrewHours: 'שעות קודש',
  englishHours: 'שעות חול',
  breakTime: 'שעות הפסקה',
  totalHours: 'סה"כ שעות',
  weeklyTotal: 'סה"כ שבועי',
  difference: 'הפרש',
  
  // Messages
  noData: 'אין נתונים זמינים',
  loading: 'טוען...',
  success: 'הצלחה',
  error: 'שגיאה',
  deleteConfirm: 'האם אתה בטוח שברצונך למחוק פריט זה?',
  cascadeWarning: 'פעולה זו תמחק גם את כל הפריטים הקשורים.',
};
