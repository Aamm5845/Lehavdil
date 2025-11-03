// Run this script to populate sample data for Belz Montreal
// Usage: npx tsx scripts/seed.ts

async function seed() {
  const baseUrl = 'http://localhost:3000';

  console.log('🌱 Seeding database...\n');

  try {
    // 1. Create Cities
    console.log('Creating cities...');
    const cities = [
      { nameEn: 'Montreal', nameHe: 'מונטריאול', country: 'Canada' },
      { nameEn: 'Monsey', nameHe: 'מונסי', country: 'USA' },
      { nameEn: 'Boro Park', nameHe: 'בורו פארק', country: 'USA' },
      { nameEn: 'Williamsburg', nameHe: 'וויליאמסבורג', country: 'USA' },
      { nameEn: 'Lakewood', nameHe: 'לייקווד', country: 'USA' },
      { nameEn: 'Yerushalayim', nameHe: 'ירושלים', country: 'Israel' },
      { nameEn: 'Ashdod', nameHe: 'אשדוד', country: 'Israel' },
      { nameEn: 'London', nameHe: 'לונדון', country: 'UK' },
    ];

    const createdCities = [];
    for (const cityData of cities) {
      const cityRes = await fetch(`${baseUrl}/api/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityData),
      });
      const city = await cityRes.json();
      createdCities.push(city);
      console.log(`✅ ${cityData.nameEn} created`);
    }

    // Use Montreal for the sample data
    const city = createdCities[0];

    // 2. Create Belz Community
    console.log('Creating Belz community...');
    const communityRes = await fetch(`${baseUrl}/api/communities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameEn: 'Belz',
        nameHe: 'בעלז',
        cityId: city.id,
      }),
    });
    const community = await communityRes.json();
    console.log('✅ Belz community created');

    // 3. Create Boys School
    console.log('Creating Belz Boys School...');
    const boysSchoolRes = await fetch(`${baseUrl}/api/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameEn: 'Belz Boys School',
        nameHe: 'בעלז בנים',
        communityId: community.id,
        schoolType: 'boys',
        isBaseline: true,
      }),
    });
    const boysSchool = await boysSchoolRes.json();
    console.log('✅ Boys school created');

    // 4. Create Girls School
    console.log('Creating Belz Girls School...');
    const girlsSchoolRes = await fetch(`${baseUrl}/api/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameEn: 'Belz Girls School',
        nameHe: 'בעלז בנות',
        communityId: community.id,
        schoolType: 'girls',
        isBaseline: true,
      }),
    });
    const girlsSchool = await girlsSchoolRes.json();
    console.log('✅ Girls school created');

    // 5. Create Boys Classes (Grades 1-8)
    console.log('Creating boys classes...');
    const hebrewGrades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'];
    for (let i = 1; i <= 8; i++) {
      await fetch(`${baseUrl}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `כיתה ${hebrewGrades[i - 1]}`,
          schoolId: boysSchool.id,
          gradeLevel: i,
        }),
      });
      console.log(`✅ Boys grade ${i} created`);
    }

    // 6. Create Girls Classes (Grades 1-8)
    console.log('Creating girls classes...');
    for (let i = 1; i <= 8; i++) {
      await fetch(`${baseUrl}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Grade ${i}`,
          schoolId: girlsSchool.id,
          gradeLevel: i,
        }),
      });
      console.log(`✅ Girls grade ${i} created`);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log('\nCreated:');
    console.log('- 8 Cities (Montreal, Monsey, Boro Park, Williamsburg, Lakewood, Yerushalayim, Ashdod, London)');
    console.log('- 1 Community (Belz in Montreal)');
    console.log('- 2 Schools (Belz Boys & Girls)');
    console.log('- 16 Classes (8 boys + 8 girls)');
    console.log('\n🎉 You can now add communities to other cities and start adding schedules!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
