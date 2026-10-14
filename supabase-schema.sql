-- ============================================================
-- supabase-schema.sql — PostgreSQL schema cho a0jyng
-- Chạy trong Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  grade         INTEGER CHECK (grade IN (10, 11, 12)),
  phone         TEXT,
  learning_style TEXT CHECK (learning_style IN ('visual','auditory','kinesthetic','reading')),
  role          TEXT DEFAULT 'student' CHECK (role IN ('student','teacher','admin')),
  avatar_url    TEXT,
  streak        INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id      TEXT PRIMARY KEY,   -- vd: toan-10
  name    TEXT NOT NULL,
  grade   INTEGER NOT NULL,
  icon    TEXT DEFAULT '📚',
  color   TEXT DEFAULT '#1E40AF',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHAPTERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id         TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  "order"    INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LESSONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id         TEXT PRIMARY KEY,
  chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  content    TEXT,             -- Markdown/HTML nội dung lý thuyết
  video_url  TEXT,
  "order"    INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITIES (Hoạt động trong bài) ─────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id         TEXT PRIMARY KEY,
  lesson_id  TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,    -- Đáp án chi tiết
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  "order"    INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROGRESS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id           TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  completed_activities TEXT[] DEFAULT '{}',
  score               INTEGER DEFAULT 0,
  minutes_spent       INTEGER DEFAULT 0,
  last_updated        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ── MATERIALS (Tài liệu AI học) ───────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  TEXT REFERENCES subjects(id),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,   -- Nội dung Markdown đầy đủ
  file_type   TEXT DEFAULT 'markdown',
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI CONVERSATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT,
  messages   JSONB DEFAULT '[]',  -- [{role, content, timestamp}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FORUM POSTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  tags       TEXT[] DEFAULT '{}',
  views      INTEGER DEFAULT 0,
  is_solved  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FORUM REPLIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  is_answer  BOOLEAN DEFAULT FALSE,  -- Câu trả lời được chấp nhận
  likes      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chapters_subject  ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter   ON lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_activities_lesson ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_user     ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_subj  ON forum_posts(subject_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies   ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Progress is private per user
CREATE POLICY "Progress own" ON progress FOR ALL USING (auth.uid()::text = user_id::text);

-- AI conversations are private
CREATE POLICY "AI conv own" ON ai_conversations FOR ALL USING (auth.uid()::text = user_id::text);

-- Forum is public read, auth write
CREATE POLICY "Forum read all" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Forum write auth" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Forum replies read" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Forum replies write" ON forum_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── SEED DATA (Môn học mẫu) ───────────────────────────────────
INSERT INTO subjects (id, name, grade, icon, color, description) VALUES
  ('toan-10', 'Toán 10', 10, '📐', '#1E40AF', 'Đại số, Hình học, Thống kê lớp 10'),
  ('vat-ly-10', 'Vật lý 10', 10, '⚡', '#7C3AED', 'Cơ học, Nhiệt học, Điện học'),
  ('hoa-hoc-10', 'Hóa học 10', 10, '🧪', '#059669', 'Nguyên tử, Bảng tuần hoàn, Liên kết hóa học'),
  ('ngu-van-10', 'Ngữ văn 10', 10, '📖', '#DC2626', 'Văn học dân gian, Thơ, Văn xuôi'),
  ('toan-11', 'Toán 11', 11, '📐', '#1E40AF', 'Giới hạn, Đạo hàm, Tích phân'),
  ('vat-ly-11', 'Vật lý 11', 11, '⚡', '#7C3AED', 'Điện từ học, Quang học'),
  ('toan-12', 'Toán 12', 12, '📐', '#1E40AF', 'Giải tích, Hình học không gian'),
  ('vat-ly-12', 'Vật lý 12', 12, '⚡', '#7C3AED', 'Dao động, Sóng, Lượng tử')
ON CONFLICT (id) DO NOTHING;
