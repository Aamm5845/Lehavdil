# ⚡ Lehavdil Quick Start

## 🚀 Get Running in 60 Seconds

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Open Your Browser
http://localhost:3000

### 3. Explore!
- Click around the welcome page
- Switch languages (🇺🇸/🇮🇱)
- Navigate to `/dashboard`
- Try adding a city

---

## 🌱 Populate Sample Data (Optional)

With the dev server running:

```bash
npx tsx scripts/seed.ts
```

**This creates:**
- Montreal (city)
- Belz community
- Boys & Girls schools
- 16 classes (grades 1-8 for each)

Refresh the dashboard to see the data!

---

## 📋 What's Available Now

| Feature | Status | URL |
|---------|--------|-----|
| Welcome Page | ✅ Working | `/` |
| Dashboard | ✅ Working | `/dashboard` |
| Cities | ✅ Full CRUD | `/dashboard/cities` |
| Communities | ✅ Full CRUD | `/dashboard/communities` |
| Schools | ✅ Full CRUD | `/dashboard/schools` |
| Classes | ✅ Full CRUD | `/dashboard/classes` |
| Schedules | 🚧 Placeholder | `/dashboard/schedules` |
| Reports | 🚧 Placeholder | `/dashboard/reports` |
| Settings | 🚧 Placeholder | `/dashboard/settings` |

---

## ✨ Cool Things to Try

1. **Add a city** with Hebrew name (e.g., ירושלים)
2. **Switch to Hebrew** and see RTL layout
3. **Create a boys class** - watch it auto-name to כיתה א
4. **Mark a school as baseline** - see the ⭐ appear
5. **Try mobile view** - hamburger menu works!
6. **Delete something** - see the cascade warning

---

## 🐛 If Something Breaks

1. **Restart the dev server:**
   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Clear the database:**
   - Just restart the server (data is in-memory)

3. **Re-seed data:**
   ```bash
   npx tsx scripts/seed.ts
   ```

---

## 📚 More Information

- **Full Testing Guide:** `TESTING.md`
- **Build Summary:** `BUILD_SUMMARY.md`
- **Technical Docs:** `README.md`

---

## 🎯 Main Goal

**Test the data entry workflow:**
1. Create a city
2. Add a community to that city
3. Create a school in that community
4. Add classes to that school
5. Switch languages and verify everything looks good

---

## 🎉 That's It!

You're ready to test Lehavdil. Have fun! 🚀
