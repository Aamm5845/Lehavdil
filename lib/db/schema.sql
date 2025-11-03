-- Lehavdil Database Schema

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name_en VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('boys', 'yeshivah', 'girls')) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
-- Grade levels: Boys (1-9), Yeshivah (1-3), Girls (0-12 where 0=Pre1A)
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time blocks table
CREATE TABLE IF NOT EXISTS time_blocks (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_type VARCHAR(20) CHECK (day_type IN ('sunday', 'weekday', 'friday')) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_type VARCHAR(20) CHECK (subject_type IN ('hebrew', 'english', 'break', 'other')) NOT NULL,
  description TEXT,
  teacher VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city_id);
CREATE INDEX IF NOT EXISTS idx_schools_community ON schools(community_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_class ON time_blocks(class_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_day ON time_blocks(day_type);
