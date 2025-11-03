# Lehavdil - School Schedule Management System

**A premium, bilingual web application for managing and comparing Hasidic school day structures across communities.**

---

## 🎯 Project Overview

Lehavdil is a high-end, intuitive software to collect, organize, and compare school day structures across Hasidic communities. The system calculates and visualizes Hebrew hours, English hours, and Break time per class — with **Belz Montreal as the baseline** for comparisons.

### Key Features
- ✅ **Bilingual System**: Full English/Hebrew support with RTL layout
- ✅ **Premium UI**: Deep blue & gold theme with Shadcn/ui components
- ✅ **Auto Calculations**: Daily and weekly totals with comparison engine
- ✅ **Smart Class Naming**: Boys (כיתה א-ח), Girls (Grade 1-8)
- 🔄 **Hierarchical Data**: City → Community → School → Class → Time Blocks
- 📊 **Charts & Visualizations**: Beautiful Recharts-powered dashboards
- 📥 **Excel Export**: Formatted reports with Hebrew support
- 🎨 **Responsive Design**: Desktop, tablet, and mobile-friendly

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn/ui
- **Database**: Vercel Postgres (PostgreSQL)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Export**: XLSX (Excel generation)
- **Deployment**: Vercel

---

## ✅ Completed Foundation (30% Complete)

### What's Built:

1. **Project Setup**
   - Next.js 14+ with TypeScript
   - Premium theme (Deep Blue + Gold)
   - 16 Shadcn/ui components installed
   - Complete folder structure

2. **Core Logic** (`lib/`)
   - ✅ TypeScript types for all entities
   - ✅ Calculation engine (duration, totals, comparisons)
   - ✅ Default class name generator
   - ✅ Zod validation schemas

3. **Internationalization** (`lib/i18n.tsx`)
   - ✅ English/Hebrew language system
   - ✅ RTL support with auto-switching
   - ✅ 50+ translation keys
   - ✅ LocalStorage persistence

4. **Database** (`lib/db/`)
   - ✅ Complete SQL schema
   - ✅ Environment variables configured
   - ✅ Migration-ready structure

---

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Set up database connection in .env.local
# Replace with your Vercel Postgres URL:
POSTGRES_URL="your_database_url_here"

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📋 Remaining Work (70%)

The foundation is solid! What remains:

### 🔴 Critical Path (MVP)

1. **API Routes** (8 hours)
   - CRUD endpoints for cities, communities, schools, classes
   - Time block management
   - Calculation endpoints

2. **Dashboard Layout** (4 hours)
   - Sidebar with navigation
   - Header with language switcher
   - Mobile responsive menu

3. **Data Management Pages** (10 hours)
   - Cities CRUD
   - Communities CRUD
   - Schools CRUD
   - Classes CRUD

4. **Schedule Management** (8 hours)
   - Time block entry
   - Day tabs (Sun/Weekday/Fri)
   - Calculations display

### 🟡 Important Features

5. **Dashboard Home** (5 hours)
   - Statistics cards
   - Quick actions
   - Charts preview

6. **Reports & Analytics** (8 hours)
   - Comparison tables
   - Community summaries
   - Filters

7. **Visualizations** (6 hours)
   - Recharts integration
   - Stacked bar charts
   - Pie charts

### 🟢 Polish

8. **Excel Export** (4 hours)
9. **Sample Data** (3 hours)
10. **Animations** (3 hours)
11. **Deployment** (5 hours)

**Total Remaining**: ~64 hours = **2-3 weeks** of focused development

---

## 📁 Project Structure

```
lehavdil/
├── app/
│   ├── (dashboard)/     # Dashboard routes (TO DO)
│   ├── api/             # API routes (TO DO)
│   ├── layout.tsx       # Root layout (TO DO: add provider)
│   └── globals.css      # ✅ Premium theme + RTL
├── components/
│   ├── ui/              # ✅ 16 Shadcn components
│   ├── layout/          # Sidebar, Header (TO DO)
│   └── ...              # Other components (TO DO)
├── lib/
│   ├── db/              # ✅ Schema + utilities
│   ├── types.ts         # ✅ Complete types
│   ├── calculations.ts  # ✅ Calculation engine
│   ├── validations.ts   # ✅ Zod schemas
│   ├── i18n.tsx         # ✅ Bilingual system
│   └── utils.ts         # ✅ Utilities
├── .env.local           # ✅ Environment vars
└── README.md            # This file
```

---

## 🧮 How It Works

### Data Hierarchy
```
City → Community → School (Boys/Girls) → Class (Grade 1-8) → Time Blocks
```

### Calculation Formula
```typescript
// Daily totals by subject
hebrew + english + break + other = daily_total

// Weekly formula
weekly_total = sunday + (weekday × 4) + friday

// Comparison
difference = class_total - belz_baseline_total
```

### Class Naming
- **Boys Schools**: כיתה א, כיתה ב, כיתה ג, ... (Hebrew)
- **Girls Schools**: Grade 1, Grade 2, Grade 3, ... (English)
- **User can override** with custom names

---

## 🌍 Bilingual Support

- **English** (LTR) ↔ **Hebrew** (RTL)
- Toggle in header: `🇺🇸 English` / `🇮🇱 עברית`
- Auto-detects Hebrew input
- 50+ translated strings

---

## 🎨 Design System

### Colors
- **Primary**: Deep Blue (#1E3A8A, #2563EB)
- **Secondary**: Gold (#F59E0B) - for Belz Montreal
- **Charts**:
  - Hebrew: Blue (#2563EB)
  - English: Green (#10B981)
  - Break: Orange (#F59E0B)
  - Other: Gray (#6B7280)

### Components
- Shadcn/ui (New York style)
- Lucide React icons
- Framer Motion animations (when added)

---

## 📊 Database Schema

```sql
cities (id, name_en, name_he)
  ↓
communities (id, city_id, name_en, name_he)
  ↓
schools (id, community_id, type, name_en, name_he)
  ↓
classes (id, school_id, name, grade_level)
  ↓
time_blocks (id, class_id, day_type, start_time, end_time, 
             subject_type, description, teacher, sort_order)
```

---

## 🔧 Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

---

## 🚢 Deployment

### Prerequisites
1. Vercel account
2. Vercel Postgres database

### Steps
```bash
# 1. Create Vercel Postgres database
# 2. Copy connection string to .env.local
# 3. Deploy
vercel --prod
```

---

## 📝 Next Immediate Tasks

1. **Update `app/layout.tsx`** - Wrap with LanguageProvider
2. **Create API route** - `/api/cities/route.ts` (GET, POST)
3. **Build Sidebar component** - Navigation with icons
4. **Create Cities page** - First CRUD implementation
5. **Test bilingual switching** - Verify RTL works

---

## 💡 Key Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `lib/types.ts` | All TypeScript interfaces | ✅ Done |
| `lib/calculations.ts` | Calculation engine | ✅ Done |
| `lib/validations.ts` | Zod form schemas | ✅ Done |
| `lib/i18n.tsx` | Bilingual system | ✅ Done |
| `lib/utils.ts` | Helper functions | ✅ Done |
| `lib/db/schema.sql` | Database schema | ✅ Done |
| `app/globals.css` | Styles + RTL | ✅ Done |

---

## 📞 Support

For questions or contributions:
1. Check the TODO list above
2. Review completed files in `lib/`
3. Follow the patterns established in existing code

---

**Project Status**: Foundation Complete - Ready for UI Development

**Estimated Completion**: 2-3 weeks of focused work

**Built for**: Hasidic Education Community
