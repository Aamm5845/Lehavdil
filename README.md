# Lehavdil - School Schedule Management System

**A premium, enterprise-grade school management platform** for Jewish schools with hierarchical navigation and intelligent schedule building.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Hierarchical Navigation
- **Cities** → **Communities** → **Schools** → **Classes** → **Schedules**
- Beautiful card-based UI with responsive design
- Smooth animations with Framer Motion
- Bilingual support (English/Hebrew with RTL)

### Intelligent Schedule Builder
- **7 Subject Types**: 
  - 🚌 Bus Arrival
  - 🔔 Class Starts
  - 📖 Hebrew Learning
  - 📖 English Learning
  - ☕ Break
  - 🚪 End of Day
  - 🕐 Other
  
- **3 Day Types**: Sunday, Weekdays (Mon-Thu), Friday
- **Smart Features**:
  - Auto-increment times (new blocks start where last one ended)
  - Quick start templates for rapid schedule creation
  - Time validation (ensures end time is after start time)
  - Color-coded subjects with icons
  - Drag handles for visual reordering

### Data Management
- Full CRUD operations for all entities
- JSON-based database (easily upgradable to PostgreSQL/MySQL)
- Sample data included (8 cities with 5 communities each)
- Cascading deletes for data integrity
- Real-time validation with Zod

### Premium UI/UX
- Compact, elegant card designs matching dashboard style
- Color-coded subject types with professional icons
- Loading states and skeleton screens
- Toast notifications for all actions
- Empty states with helpful guidance
- Fully mobile-responsive

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aamm5845/Lehavdil.git
   cd Lehavdil
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

The app comes pre-loaded with sample data (8 cities with communities and schools).

## 📁 Project Structure

```
lehavdil/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── schools/           # Hierarchical school navigation
│   │       │   ├── [id]/          # City detail
│   │       │   │   ├── [communityId]/  # Community detail
│   │       │   │   │   └── [schoolId]/ # School classes
│   │       │   │   └── page.tsx
│   │       │   └── page.tsx       # Cities list
│   │       ├── schedules/         # Schedule management
│   │       ├── reports/           # Reporting interface
│   │       └── settings/          # App settings
│   ├── api/                       # API routes
│   │   ├── cities/
│   │   ├── communities/
│   │   ├── schools/
│   │   ├── classes/
│   │   └── time-blocks/
│   └── layout.tsx
├── components/
│   ├── layout/                    # Header, Sidebar
│   ├── schedule/                  # Schedule builder
│   │   └── schedule-builder.tsx
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── db/                        # Database functions
│   │   └── index.ts
│   ├── types.ts                   # TypeScript definitions
│   ├── validations.ts             # Zod schemas
│   ├── calculations.ts            # Time calculations
│   └── i18n.tsx                   # Internationalization
├── data/
│   └── db.json                    # JSON database
└── scripts/
    └── seed-cities.ts             # Seed scripts
```

## 🎯 Usage

### Navigation Flow
1. **Dashboard** - Overview of all data
2. **Schools Tab** - View all cities as cards
3. **City Detail** - Click on a city to see its communities
4. **Community Detail** - Select school type (Boys/Girls/Yeshivah)
5. **School Detail** - View all classes in a compact grid
6. **Schedules Tab** - Build schedules for any class

### Creating a Schedule
1. Go to **Schedules** tab in the sidebar
2. Select filters in order:
   - **City** (e.g., Montreal)
   - **Community** (e.g., Belz)
   - **School** (e.g., Boys School)
   - **Class** (e.g., Grade 3)
3. Choose **Day Type** tab (Sunday/Weekday/Friday)
4. Click **"Full Day Template"** for instant setup, or
5. Click **"Add Time Block"** to build manually
6. Set times, subject types, and descriptions
7. Click **"Save Schedule"**

### Smart Features in Action
- **Auto-increment**: Add a block at 8:00-9:00, next block automatically starts at 9:00
- **Templates**: One-click creates: Bus (8:00), Class Start (8:15), Hebrew (8:30-10:30), Break (10:30), English (10:45-12:45), End (12:45)
- **Validation**: System prevents overlapping times or invalid ranges
- **Visual feedback**: Each subject type has a distinct color and icon

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui (New York style)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner
- **Database**: JSON (easily upgradable)

## 📊 Database Schema

```
City
├── Communities
    ├── Schools
        ├── Classes
            └── TimeBlocks
```

### Entities
- **Cities**: `id`, `nameEn`, `nameHe`, `country`, `createdAt`
- **Communities**: `id`, `cityId`, `nameEn`, `nameHe`, `createdAt`
- **Schools**: `id`, `communityId`, `schoolType`, `nameEn`, `nameHe`, `isBaseline`, `createdAt`
- **Classes**: `id`, `schoolId`, `name`, `gradeLevel`, `createdAt`
- **TimeBlocks**: `id`, `classId`, `dayType`, `startTime`, `endTime`, `subjectType`, `description`, `sortOrder`, `createdAt`

## 🌐 API Routes

All entities support full REST operations:

### Cities
- `GET /api/cities` - List all cities
- `GET /api/cities/[id]` - Get single city
- `POST /api/cities` - Create city
- `PUT /api/cities/[id]` - Update city
- `DELETE /api/cities/[id]` - Delete city (cascading)

### Communities
- `GET /api/communities?cityId=[id]` - List communities (filterable)
- `GET /api/communities/[id]` - Get single community
- `POST /api/communities` - Create community
- `PUT /api/communities/[id]` - Update community
- `DELETE /api/communities/[id]` - Delete community (cascading)

### Schools
- `GET /api/schools` - List all schools
- `GET /api/schools/[id]` - Get single school
- `POST /api/schools` - Create school
- `PUT /api/schools/[id]` - Update school
- `DELETE /api/schools/[id]` - Delete school (cascading)

### Classes
- `GET /api/classes` - List all classes
- `GET /api/classes/[id]` - Get single class
- `POST /api/classes` - Create class
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class (cascading)

### Time Blocks
- `GET /api/time-blocks?classId=[id]&dayType=[type]` - List time blocks (filterable)
- `POST /api/time-blocks` - Create time block
- `PUT /api/time-blocks/[id]` - Update time block
- `DELETE /api/time-blocks/[id]` - Delete time block

## 🎨 Customization

### Adding New Subject Types
1. Update `SubjectType` in `lib/types.ts`:
   ```typescript
   export type SubjectType = 'bus-start' | 'class-start' | 'hebrew' | 'english' | 'break' | 'end-day' | 'your-new-type' | 'other';
   ```

2. Update validation in `lib/validations.ts`:
   ```typescript
   subjectType: z.enum(['bus-start', 'class-start', 'hebrew', 'english', 'break', 'end-day', 'your-new-type', 'other'])
   ```

3. Add to `SUBJECT_TYPES` array in `components/schedule/schedule-builder.tsx`:
   ```typescript
   { value: 'your-new-type', labelEn: 'Your Label', labelHe: 'התווית שלך', icon: YourIcon, color: 'bg-color-500' }
   ```

### Changing Colors
Edit Tailwind classes directly in components or update `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Database Migration
Replace JSON functions in `lib/db/index.ts` with your preferred database:

**For Prisma:**
```typescript
export async function getCities() {
  return await prisma.city.findMany();
}
```

**For Drizzle:**
```typescript
export async function getCities() {
  return await db.select().from(cities);
}
```

## 📝 Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm run seed         # Seed sample data
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub (already done!)
2. Import repository in Vercel
3. Deploy (automatic)

### Other Platforms
Build and deploy the `.next` folder:
```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - free to use for any purpose.

## 👨‍💻 Author

Built with ❤️ for Jewish schools worldwide.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Lucide](https://lucide.dev/) for the icon system
- [Vercel](https://vercel.com/) for Next.js framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Lehavdil** - Making school schedule management simple, elegant, and powerful.

**GitHub**: https://github.com/Aamm5845/Lehavdil
