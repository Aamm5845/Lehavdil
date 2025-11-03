// Seed script to add cities and communities
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface Database {
  cities: any[];
  communities: any[];
  schools: any[];
  classes: any[];
  timeBlocks: any[];
  nextId: number;
}

async function seedCitiesAndCommunities() {
  console.log('🌱 Seeding cities and communities...\n');

  // Read current database
  const db: Database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  let nextId = db.nextId;

  // Check if cities already exist
  if (db.cities.length > 0) {
    console.log('✅ Cities already exist:');
    db.cities.forEach(city => console.log(`   - ${city.nameEn}`));
    console.log('\n✅ Communities already exist:');
    db.communities.forEach(comm => console.log(`   - ${comm.nameEn}`));
    return;
  }

  // Create Montreal
  const montreal = {
    id: String(nextId++),
    nameEn: 'Montreal',
    nameHe: 'מונטריאול',
    country: 'Canada',
    createdAt: new Date().toISOString(),
  };
  db.cities.push(montreal);
  console.log('✅ Created city: Montreal');

  // Create New York
  const newYork = {
    id: String(nextId++),
    nameEn: 'New York',
    nameHe: 'ניו יורק',
    country: 'USA',
    createdAt: new Date().toISOString(),
  };
  db.cities.push(newYork);
  console.log('✅ Created city: New York');

  // Create communities for Montreal
  const belzMontreal = {
    id: String(nextId++),
    cityId: montreal.id,
    nameEn: 'Belz',
    nameHe: 'בעלז',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(belzMontreal);
  console.log('✅ Created community: Belz (Montreal)');

  const satmarMontreal = {
    id: String(nextId++),
    cityId: montreal.id,
    nameEn: 'Satmar',
    nameHe: 'סאטמר',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(satmarMontreal);
  console.log('✅ Created community: Satmar (Montreal)');

  const bobovMontreal = {
    id: String(nextId++),
    cityId: montreal.id,
    nameEn: 'Bobov',
    nameHe: 'באבוב',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(bobovMontreal);
  console.log('✅ Created community: Bobov (Montreal)');

  // Create communities for New York
  const belzNY = {
    id: String(nextId++),
    cityId: newYork.id,
    nameEn: 'Belz',
    nameHe: 'בעלז',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(belzNY);
  console.log('✅ Created community: Belz (New York)');

  const satmarNY = {
    id: String(nextId++),
    cityId: newYork.id,
    nameEn: 'Satmar',
    nameHe: 'סאטמר',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(satmarNY);
  console.log('✅ Created community: Satmar (New York)');

  const squareNY = {
    id: String(nextId++),
    cityId: newYork.id,
    nameEn: 'Square',
    nameHe: 'סקווירא',
    createdAt: new Date().toISOString(),
  };
  db.communities.push(squareNY);
  console.log('✅ Created community: Square (New York)');

  // Update existing schools to link to Belz Montreal community
  console.log('\n🔗 Linking existing schools to communities...');
  const belzCommunityId = belzMontreal.id;
  
  db.schools.forEach((school, index) => {
    if (!school.communityId || school.communityId === '') {
      db.schools[index].communityId = belzCommunityId;
      console.log(`✅ Linked school "${school.nameEn}" to Belz Montreal`);
    }
  });

  // Update nextId
  db.nextId = nextId;

  // Write back to database
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Cities: ${db.cities.length}`);
  console.log(`   Communities: ${db.communities.length}`);
  console.log(`   Schools: ${db.schools.length}`);
  console.log(`   Classes: ${db.classes.length}`);
}

seedCitiesAndCommunities().catch(console.error);
