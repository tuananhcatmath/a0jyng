// ============================================================
// db.js — Database Abstraction Layer cho a0jyng
// Priority: Supabase → localStorage (demo mode)
// ============================================================
import { getSupabase, SUPABASE_MODE } from './supabase-config.js';

// ── AUTH ─────────────────────────────────────────────────────
export async function signUp({ email, password, name, grade, phone, learningStyle }) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name, grade, phone, learning_style: learningStyle } } });
    if (error) throw error;
    // Upsert user profile
    await sb.from('users').upsert({
      id: data.user.id, email, name, grade, phone,
      learning_style: learningStyle, role: 'student', streak: 0, total_minutes: 0
    });
    return data.user;
  } else {
    // Demo mode — localStorage
    const users = JSON.parse(localStorage.getItem('a0jyng_users') || '[]');
    if (users.find(u => u.email === email)) throw { message: 'Email đã được đăng ký' };
    const user = { id: 'demo-' + Date.now(), email, name, grade, phone, learning_style: learningStyle, role: 'student' };
    users.push({ ...user, password });
    localStorage.setItem('a0jyng_users', JSON.stringify(users));
    localStorage.setItem('a0jyng_session', JSON.stringify(user));
    return user;
  }
}

export async function signIn({ email, password }) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } else {
    const users = JSON.parse(localStorage.getItem('a0jyng_users') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);
    if (!user) throw { message: 'Email hoặc mật khẩu không đúng' };
    const { password: _, ...safe } = user;
    localStorage.setItem('a0jyng_session', JSON.stringify(safe));
    return safe;
  }
}

export async function signOut() {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    await sb.auth.signOut();
  }
  localStorage.removeItem('a0jyng_session');
}

export async function getCurrentUser() {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  }
  return JSON.parse(localStorage.getItem('a0jyng_session') || 'null');
}

export async function resetPassword(email) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login.html' });
    if (error) throw error;
  } else {
    console.log('[DEMO] Password reset email sent to:', email);
  }
}

// ── SUBJECTS ─────────────────────────────────────────────────
export async function getSubjects(grade = null) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    let q = sb.from('subjects').select('*').order('name');
    if (grade) q = q.eq('grade', grade);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }
  return DEMO_SUBJECTS.filter(s => !grade || s.grade === grade);
}

// ── CHAPTERS ─────────────────────────────────────────────────
export async function getChapters(subjectId) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('chapters').select('*').eq('subject_id', subjectId).order('"order"');
    if (error) throw error;
    return data;
  }
  return DEMO_CHAPTERS.filter(c => c.subject_id === subjectId);
}

// ── LESSONS ──────────────────────────────────────────────────
export async function getLessons(chapterId) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('lessons').select('*').eq('chapter_id', chapterId).order('"order"');
    if (error) throw error;
    return data;
  }
  return DEMO_LESSONS.filter(l => l.chapter_id === chapterId);
}

export async function getLesson(lessonId) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('lessons').select('*').eq('id', lessonId).single();
    if (error) throw error;
    return data;
  }
  return DEMO_LESSONS.find(l => l.id === lessonId) || null;
}

// ── ACTIVITIES ───────────────────────────────────────────────
export async function getActivities(lessonId) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('activities').select('*').eq('lesson_id', lessonId).order('"order"');
    if (error) throw error;
    return data;
  }
  return DEMO_ACTIVITIES.filter(a => a.lesson_id === lessonId);
}

// ── PROGRESS ─────────────────────────────────────────────────
export async function saveProgress(userId, lessonId, completedActivities, score, minutesSpent = 0) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    await sb.from('progress').upsert({ user_id: userId, lesson_id: lessonId, completed_activities: completedActivities, score, minutes_spent: minutesSpent, last_updated: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });
  } else {
    const key = `a0jyng_progress_${userId}_${lessonId}`;
    localStorage.setItem(key, JSON.stringify({ completedActivities, score, minutesSpent, lastUpdated: new Date().toISOString() }));
  }
}

export async function getProgress(userId, lessonId) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data } = await sb.from('progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).single();
    return data;
  }
  const raw = localStorage.getItem(`a0jyng_progress_${userId}_${lessonId}`);
  return raw ? JSON.parse(raw) : null;
}

// ── MATERIALS (Tài liệu AI) ───────────────────────────────────
export async function getMaterials(subjectId = null) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    let q = sb.from('materials').select('*').order('created_at', { ascending: false });
    if (subjectId) q = q.eq('subject_id', subjectId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }
  return [];
}

export async function uploadMaterial({ subjectId, title, content, userId }) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('materials').insert({ subject_id: subjectId, title, content, uploaded_by: userId });
    if (error) throw error;
    return data;
  }
  const mats = JSON.parse(localStorage.getItem('a0jyng_materials') || '[]');
  const mat  = { id: Date.now().toString(), subject_id: subjectId, title, content, created_at: new Date().toISOString() };
  mats.push(mat);
  localStorage.setItem('a0jyng_materials', JSON.stringify(mats));
  return mat;
}

// ── FORUM ─────────────────────────────────────────────────────
export async function getForumPosts({ subjectId = null, search = '' } = {}) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    let q = sb.from('forum_posts').select('*, users(name, avatar_url)').order('created_at', { ascending: false });
    if (subjectId) q = q.eq('subject_id', subjectId);
    if (search)    q = q.ilike('title', `%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }
  return DEMO_FORUM_POSTS;
}

export async function createForumPost({ userId, subjectId, title, content, tags = [] }) {
  if (SUPABASE_MODE) {
    const sb = await getSupabase();
    const { data, error } = await sb.from('forum_posts').insert({ user_id: userId, subject_id: subjectId, title, content, tags });
    if (error) throw error;
    return data;
  }
  const posts = JSON.parse(localStorage.getItem('a0jyng_forum') || '[]');
  const post  = { id: Date.now().toString(), user_id: userId, subject_id: subjectId, title, content, tags, views: 0, is_solved: false, created_at: new Date().toISOString() };
  posts.unshift(post);
  localStorage.setItem('a0jyng_forum', JSON.stringify(posts));
  return post;
}

// ── DEMO DATA ────────────────────────────────────────────────
const DEMO_SUBJECTS = [
  { id:'toan-10', name:'Toán 10', grade:10, icon:'📐', color:'#1E40AF' },
  { id:'vat-ly-10', name:'Vật lý 10', grade:10, icon:'⚡', color:'#7C3AED' },
  { id:'hoa-hoc-10', name:'Hóa học 10', grade:10, icon:'🧪', color:'#059669' },
  { id:'ngu-van-10', name:'Ngữ văn 10', grade:10, icon:'📖', color:'#DC2626' },
  { id:'toan-11', name:'Toán 11', grade:11, icon:'📐', color:'#1E40AF' },
  { id:'toan-12', name:'Toán 12', grade:12, icon:'📐', color:'#1E40AF' },
];
const DEMO_CHAPTERS = [
  { id:'toan-10-c1', subject_id:'toan-10', name:'Chương 1: Mệnh đề và tập hợp', order:1 },
  { id:'toan-10-c2', subject_id:'toan-10', name:'Chương 2: Bất phương trình và hệ bất phương trình', order:2 },
  { id:'vat-ly-10-c1', subject_id:'vat-ly-10', name:'Chương 1: Động học chất điểm', order:1 },
];
const DEMO_LESSONS = [
  { id:'toan-10-c1-b1', chapter_id:'toan-10-c1', name:'Bài 1: Mệnh đề', content:'## Mệnh đề\nMệnh đề là một câu khẳng định...', order:1 },
  { id:'toan-10-c1-b2', chapter_id:'toan-10-c1', name:'Bài 2: Tập hợp', content:'## Tập hợp\nTập hợp là khái niệm cơ bản...', order:2 },
];
const DEMO_ACTIVITIES = [
  { id:'toan-10-c1-b1-hd1', lesson_id:'toan-10-c1-b1', name:'Hoạt động 1', question:'Xác định mệnh đề: "2 + 2 = 4"', answer:'Đây là mệnh đề ĐÚNG. Vì 2+2=4 là khẳng định có thể xác định đúng/sai.', order:1 },
  { id:'toan-10-c1-b1-hd2', lesson_id:'toan-10-c1-b1', name:'Hoạt động 2', question:'Phủ định mệnh đề: "Mọi số tự nhiên đều là số chẵn"', answer:'Phủ định: "Tồn tại số tự nhiên không phải số chẵn" (ĐÚNG — ví dụ số 1, 3, 5...)', order:2 },
];
const DEMO_FORUM_POSTS = [
  { id:'1', title:'Cách chứng minh bất đẳng thức?', content:'Mình đang học chương BĐT, ai có thể giải thích cách tiếp cận không?', subject_id:'toan-10', views:45, is_solved:false, created_at:new Date(Date.now()-3600000).toISOString(), users:{name:'Nguyễn Văn A'} },
  { id:'2', title:'Định luật Newton áp dụng thế nào?', content:'Bài tập chương động học khó quá...', subject_id:'vat-ly-10', views:32, is_solved:true, created_at:new Date(Date.now()-7200000).toISOString(), users:{name:'Trần Thị B'} },
];
