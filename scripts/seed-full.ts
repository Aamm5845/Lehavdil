// Run this script to populate ALL cities with communities
// Usage: npx tsx scripts/seed-full.ts

async function seedFull() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  console.log('🌱 Seeding FULL database with all communities...\n');

  try {
    // 1. Get existing cities
    console.log('Fetching existing cities...');
    const citiesRes = await fetch(`${baseUrl}/api/cities`);
    const { cities } = await citiesRes.json();
    console.log(`✅ Found ${cities.length} cities\n`);

    // 2. Common Hasidic communities
    const communities = [
      { nameEn: 'Belz', nameHe: 'בעלז' },
      { nameEn: 'Satmar', nameHe: 'סאטמר' },
      { nameEn: 'Viznitz', nameHe: 'ויזניץ' },
      { nameEn: 'Ger', nameHe: 'גור' },
      { nameEn: 'Bobov', nameHe: 'באבוב' },
      { nameEn: 'Skver', nameHe: 'סקווירא' },
      { nameEn: 'Klausenburg', nameHe: 'קלויזנבורג' },
      { nameEn: 'Breslov', nameHe: 'ברסלב' },
      { nameEn: 'Chabad', nameHe: 'חב"ד' },
      { nameEn: 'Tosh', nameHe: 'טאש' },
    ];

    // 3. Create communities in each city
    let totalCreated = 0;
    for (const city of cities) {
      console.log(`\n📍 Creating communities in ${city.nameEn}...`);
      
      for (const community of communities) {
        try {
          const communityRes = await fetch(`${baseUrl}/api/communities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nameEn: community.nameEn,
              nameHe: community.nameHe,
              cityId: city.id,
            }),
          });
          
          if (communityRes.ok) {
            console.log(`  ✅ ${community.nameEn}`);
            totalCreated++;
          }
        } catch (error) {
          console.log(`  ⚠️ ${community.nameEn} - already exists or error`);
        }
      }
    }

    console.log('\n\n✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${cities.length} Cities`);
    console.log(`- ${communities.length} Community types`);
    console.log(`- ${totalCreated} Total community instances created`);
    console.log(`\n🎉 All cities now have communities! You can now add schools.`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedFull();
