/**
 * Comprehensive Seed Script for Lehavdil
 * 
 * This script populates the entire database with:
 * - 8 Cities (Montreal, Monsey, Boro Park, Williamsburg, Lakewood, Yirushlayim, Ashdod, London)
 * - 5 Communities per city (Belz, Viznitz, Skver, Satmar, Lubavitz) = 40 communities
 * - 3 Schools per community (Boys, Yeshivah, Girls) = 120 schools
 * - All classes per school (Boys: 9, Yeshivah: 3, Girls: 13) = 1,000 classes
 * 
 * Usage: npx tsx scripts/seed-comprehensive.ts
 */

import { createCity, getCities, createCommunity, createSchool, createClass } from '../lib/db/index';
import { BOYS_GRADES, YESHIVAH_SHIURIM, GIRLS_GRADES } from '../lib/grade-levels';
import fs from 'fs';
import path from 'path';

// Cities to create
const CITIES = [
  { nameEn: 'Montreal', nameHe: 'מונטריאול', country: 'Canada' },
  { nameEn: 'Monsey', nameHe: 'מונסי', country: 'USA' },
  { nameEn: 'Boro Park', nameHe: 'בורו פארק', country: 'USA' },
  { nameEn: 'Williamsburg', nameHe: 'וויליאמסבורג', country: 'USA' },
  { nameEn: 'Lakewood', nameHe: 'לייקווד', country: 'USA' },
  { nameEn: 'Yirushlayim', nameHe: 'ירושלים', country: 'Israel' },
  { nameEn: 'Ashdod', nameHe: 'אשדוד', country: 'Israel' },
  { nameEn: 'London', nameHe: 'לונדון', country: 'UK' },
];

// Communities to create in each city
const COMMUNITIES = [
  { nameEn: 'Belz', nameHe: 'בעלז' },
  { nameEn: 'Viznitz', nameHe: 'ויזניץ' },
  { nameEn: 'Skver', nameHe: 'סקווירא' },
  { nameEn: 'Satmar', nameHe: 'סאטמר' },
  { nameEn: 'Lubavitz', nameHe: 'ליובאוויטש' },
];

async function clearDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const emptyDb = {
    cities: [],
    communities: [],
    schools: [],
    classes: [],
    timeBlocks: [],
    nextId: 1,
  };
  
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(emptyDb, null, 2));
  console.log('✅ Database cleared\n');
}

async function seedComprehensive() {
  console.log('🌱 Starting Comprehensive Seed for Lehavdil\n');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Clear existing data
    console.log('\n📦 Step 1: Clearing Database...');
    await clearDatabase();
    
    // Step 2: Create Cities
    console.log('\n🏙️  Step 2: Creating Cities...');
    const cities = [];
    for (const cityData of CITIES) {
      const city = await createCity(cityData);
      cities.push(city);
      console.log(`  ✅ ${cityData.nameEn} (${cityData.nameHe})`);
    }
    console.log(`\n✨ Created ${cities.length} cities`);
    
    // Step 3: Create Communities in each city
    console.log('\n🏘️  Step 3: Creating Communities...');
    const communities = [];
    for (const city of cities) {
      console.log(`\n  📍 ${city.nameEn}:`);
      for (const communityData of COMMUNITIES) {
        const community = await createCommunity({
          cityId: city.id,
          nameEn: communityData.nameEn,
          nameHe: communityData.nameHe,
        });
        communities.push(community);
        console.log(`    ✅ ${communityData.nameEn} (${communityData.nameHe})`);
      }
    }
    console.log(`\n✨ Created ${communities.length} communities (${COMMUNITIES.length} per city)`);
    
    // Step 4: Create Schools (Boys, Yeshivah, Girls) in each community
    console.log('\n🏫 Step 4: Creating Schools...');
    const schools = [];
    let cityIndex = 0;
    
    for (let i = 0; i < communities.length; i++) {
      const community = communities[i];
      
      // Track which city we're in (every 5 communities = new city)
      if (i > 0 && i % COMMUNITIES.length === 0) {
        cityIndex++;
      }
      const city = cities[cityIndex];
      
      // Determine if this is Belz Montreal (for baseline)
      const isBaseline = city.nameEn === 'Montreal' && community.nameEn === 'Belz';
      
      // Only show header for first community of each city
      if (i % COMMUNITIES.length === 0) {
        console.log(`\n  📍 ${city.nameEn}:`);
      }
      
      // Create Boys School
      const boysSchool = await createSchool({
        communityId: community.id,
        schoolType: 'boys',
        nameEn: `${community.nameEn} Boys School`,
        nameHe: `ת"ת ${community.nameHe} בנים`,
        isBaseline: isBaseline,
      });
      schools.push(boysSchool);
      
      // Create Yeshivah School
      const yeshivahSchool = await createSchool({
        communityId: community.id,
        schoolType: 'yeshivah',
        nameEn: `${community.nameEn} Yeshivah`,
        nameHe: `ישיבה ${community.nameHe}`,
        isBaseline: isBaseline,
      });
      schools.push(yeshivahSchool);
      
      // Create Girls School
      const girlsSchool = await createSchool({
        communityId: community.id,
        schoolType: 'girls',
        nameEn: `${community.nameEn} Girls School`,
        nameHe: `ב"ס ${community.nameHe} בנות`,
        isBaseline: isBaseline,
      });
      schools.push(girlsSchool);
      
      const baselineLabel = isBaseline ? ' ⭐ BASELINE' : '';
      console.log(`    ✅ ${community.nameEn} (Boys, Yeshivah, Girls)${baselineLabel}`);
    }
    console.log(`\n✨ Created ${schools.length} schools (3 per community)`);
    
    // Step 5: Create Classes for each school
    console.log('\n📚 Step 5: Creating Classes...');
    let totalClasses = 0;
    
    for (const school of schools) {
      let classCount = 0;
      
      if (school.schoolType === 'boys') {
        // Create 9 classes for Boys School (כיתה א through כיתה ט)
        for (const grade of BOYS_GRADES) {
          await createClass({
            schoolId: school.id,
            name: grade.label,
            gradeLevel: grade.value,
          });
          classCount++;
        }
      } else if (school.schoolType === 'yeshivah') {
        // Create 3 classes for Yeshivah (שיעור א through שיעור ג)
        for (const shiur of YESHIVAH_SHIURIM) {
          await createClass({
            schoolId: school.id,
            name: shiur.label,
            gradeLevel: shiur.value,
          });
          classCount++;
        }
      } else if (school.schoolType === 'girls') {
        // Create 13 classes for Girls School (Pre1A, Grade 1-12)
        for (const grade of GIRLS_GRADES) {
          await createClass({
            schoolId: school.id,
            name: grade.label,
            gradeLevel: grade.value,
          });
          classCount++;
        }
      }
      
      totalClasses += classCount;
    }
    
    console.log(`\n✨ Created ${totalClasses} classes`);
    
    // Final Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 SEED COMPLETE!\n');
    console.log('📊 Final Summary:');
    console.log(`  • Cities: ${cities.length}`);
    console.log(`  • Communities: ${communities.length} (${COMMUNITIES.length} per city)`);
    console.log(`  • Schools: ${schools.length} (3 per community)`);
    console.log(`  • Classes: ${totalClasses} (Boys: 9, Yeshivah: 3, Girls: 13 per community)`);
    console.log(`  • Baseline: Belz Montreal ⭐\n`);
    
    console.log('✅ Database is fully seeded and ready to use!');
    console.log('\n💡 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Visit: http://localhost:3000');
    console.log('  3. Navigate to Classes page');
    console.log('  4. Click calendar icon to add schedules\n');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedComprehensive();
