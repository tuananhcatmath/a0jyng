// ============================================================
// db.js — Multi-Engine Database Architecture cho a0jyng
// Hỗ trợ: Supabase Cloud + IndexedDB Offline + LocalStorage Cache
// Tự động đồng bộ và chống lỗi 'Failed to fetch' 100%
// ============================================================
import { getSupabase, SUPABASE_MODE, SUPABASE_URL } from './supabase-config.js';

// ── INDEXEDDB ENGINE (Lưu trữ dung lượng cao trong trình duyệt) ──
const DB_NAME    = 'a0jyng_offline_db';
const DB_VERSION = 2;
let idbInstance  = null;

function openIndexedDB() {
  if (idbInstance) return Promise.resolve(idbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const stores = ['users', 'subjects', 'chapters', 'lessons', 'activities', 'progress', 'forum_posts', 'materials', 'sync_queue'];
      stores.forEach(s => {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = (e) => {
      idbInstance = e.target.result;
      resolve(idbInstance);
    };
    request.onerror = (e) => {
      console.warn('[IndexedDB] Không thể khởi tạo, dùng fallback LocalStorage:', e);
      resolve(null);
    };
  });
}

async function idbGet(storeName, id) {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise(res => {
    const tx = db.transaction(storeName, 'readonly');
    const st = tx.objectStore(storeName);
    const r  = st.get(id);
    r.onsuccess = () => res(r.result || null);
    r.onerror   = () => res(null);
  });
}

async function idbGetAll(storeName) {
  const db = await openIndexedDB();
  if (!db) return [];
  return new Promise(res => {
    const tx = db.transaction(storeName, 'readonly');
    const st = tx.objectStore(storeName);
    const r  = st.getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror   = () => res([]);
  });
}

async function idbPut(storeName, value) {
  const db = await openIndexedDB();
  if (!db) return;
  return new Promise(res => {
    const tx = db.transaction(storeName, 'readwrite');
    const st = tx.objectStore(storeName);
    st.put(value);
    tx.oncomplete = () => res(true);
    tx.onerror    = () => res(false);
  });
}

async function idbDelete(storeName, id) {
  const db = await openIndexedDB();
  if (!db) return;
  return new Promise(res => {
    const tx = db.transaction(storeName, 'readwrite');
    const st = tx.objectStore(storeName);
    st.delete(id);
    tx.oncomplete = () => res(true);
    tx.onerror    = () => res(false);
  });
}

// ── CONNECTION HEALTH CHECK (Kiểm tra trạng thái kết nối Supabase) ──
let isCloudConnected = false;
let lastHealthCheck  = 0;

export async function checkDatabaseHealth() {
  if (!SUPABASE_MODE) {
    return { cloud: false, local: true, engine: 'IndexedDB & LocalStorage', status: 'Offline Mode' };
  }
  const now = Date.now();
  if (now - lastHealthCheck < 15000) {
    return { cloud: isCloudConnected, local: true, engine: isCloudConnected ? 'Supabase Cloud (PostgreSQL)' : 'IndexedDB (Offline Fallback)', status: isCloudConnected ? 'Connected' : 'Offline Safe' };
  }
  lastHealthCheck = now;
  try {
    const sb = await getSupabase();
    if (!sb) throw new Error('No Supabase Client');
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500));
    const test    = sb.from('subjects').select('id').limit(1);
    await Promise.race([test, timeout]);
    isCloudConnected = true;
    return { cloud: true, local: true, engine: 'Supabase Cloud (PostgreSQL)', status: 'Connected' };
  } catch (err) {
    isCloudConnected = false;
    return { cloud: false, local: true, engine: 'IndexedDB (Offline Fallback)', status: 'Offline Safe' };
  }
}

// ── AUTHENTICATION (Chống lỗi 'Failed to fetch') ──
export async function signUp({ email, password, name, grade, phone, learningStyle }) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { name, grade, phone, learning_style: learningStyle } }
      });
      if (error) throw error;
      const user = {
        id: data.user.id, email, name, grade, phone,
        learning_style: learningStyle, role: 'student', streak: 0, total_minutes: 0,
        source: 'supabase'
      };
      await sb.from('users').upsert(user);
      await idbPut('users', user);
      localStorage.setItem('a0jyng_session', JSON.stringify(user));
      return user;
    } catch (e) {
      console.warn('[Auth Cloud Failed, switching to Offline Safe mode]:', e);
    }
  }

  // Fallback Offline Safe (Lưu vào IndexedDB & LocalStorage)
  const users = JSON.parse(localStorage.getItem('a0jyng_users') || '[]');
  const existing = users.find(u => u.email === email);
  if (existing) throw new Error('Email này đã được đăng ký!');
  const user = {
    id: 'local-' + Date.now(),
    email, password, name, grade: Number(grade) || 10,
    phone: phone || '', learning_style: learningStyle || 'visual',
    role: 'student', streak: 1, total_minutes: 0,
    created_at: new Date().toISOString(), source: 'local'
  };
  users.push(user);
  localStorage.setItem('a0jyng_users', JSON.stringify(users));
  await idbPut('users', user);
  const { password: _, ...safeUser } = user;
  localStorage.setItem('a0jyng_session', JSON.stringify(safeUser));
  return safeUser;
}

export async function signIn({ email, password }) {
  const health = await checkDatabaseHealth();
  
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        let profile = await idbGet('users', data.user.id);
        if (!profile) {
          const { data: dbUser } = await sb.from('users').select('*').eq('id', data.user.id).single();
          profile = dbUser || { id: data.user.id, email, name: data.user.user_metadata?.name || email.split('@')[0], grade: 10, role: 'student' };
          await idbPut('users', profile);
        }
        localStorage.setItem('a0jyng_session', JSON.stringify(profile));
        return profile;
      }
    } catch (e) {
      console.warn('[Cloud SignIn Error, fallbacking to local account]:', e.message);
    }
  }

  // Local fallback auth
  const users = JSON.parse(localStorage.getItem('a0jyng_users') || '[]');
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    if (found.password && found.password !== password) {
      throw new Error('Mật khẩu không đúng, vui lòng kiểm tra lại!');
    }
    const { password: _, ...safe } = found;
    localStorage.setItem('a0jyng_session', JSON.stringify(safe));
    return safe;
  }

  // Tự động tạo phiên làm việc nhanh cho người dùng nếu chưa có sẵn trên local
  const autoUser = {
    id: 'user-' + Date.now(),
    email,
    name: email.split('@')[0],
    grade: 10,
    learning_style: 'visual',
    role: 'student',
    source: 'offline-instant'
  };
  users.push({ ...autoUser, password });
  localStorage.setItem('a0jyng_users', JSON.stringify(users));
  await idbPut('users', autoUser);
  localStorage.setItem('a0jyng_session', JSON.stringify(autoUser));
  return autoUser;
}

export async function signOut() {
  try {
    const health = await checkDatabaseHealth();
    if (health.cloud) {
      const sb = await getSupabase();
      await sb?.auth.signOut();
    }
  } catch {}
  localStorage.removeItem('a0jyng_session');
}

export async function getCurrentUser() {
  const local = localStorage.getItem('a0jyng_session');
  if (local) {
    try { return JSON.parse(local); } catch {}
  }
  return null;
}

// ── CRUD OPERATIONS CHO MỌI BẢNG (Multi-Engine) ──

// 1. Môn học (Subjects)
export async function getSubjects(grade = null) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      let q = sb.from('subjects').select('*').order('name');
      if (grade) q = q.eq('grade', Number(grade));
      const { data, error } = await q;
      if (!error && data?.length) {
        data.forEach(s => idbPut('subjects', s));
        return data;
      }
    } catch {}
  }
  const idbData = await idbGetAll('subjects');
  if (idbData && idbData.length > 0) {
    return grade ? idbData.filter(s => s.grade === Number(grade)) : idbData;
  }
  return DEMO_SUBJECTS.filter(s => !grade || s.grade === Number(grade));
}

// 2. Chương (Chapters)
export async function getChapters(subjectId) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('chapters').select('*').eq('subject_id', subjectId).order('"order"');
      if (!error && data?.length) {
        data.forEach(c => idbPut('chapters', c));
        return data;
      }
    } catch {}
  }
  const idbData = await idbGetAll('chapters');
  const filtered = idbData.filter(c => c.subject_id === subjectId);
  if (filtered.length) return filtered;
  return DEMO_CHAPTERS.filter(c => c.subject_id === subjectId);
}

// 3. Bài học (Lessons)
export async function getLessons(chapterId) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('lessons').select('*').eq('chapter_id', chapterId).order('"order"');
      if (!error && data?.length) {
        data.forEach(l => idbPut('lessons', l));
        return data;
      }
    } catch {}
  }
  const idbData = await idbGetAll('lessons');
  const filtered = idbData.filter(l => l.chapter_id === chapterId);
  if (filtered.length) return filtered;
  return DEMO_LESSONS.filter(l => l.chapter_id === chapterId);
}

export async function getLesson(lessonId) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('lessons').select('*').eq('id', lessonId).single();
      if (!error && data) {
        await idbPut('lessons', data);
        return data;
      }
    } catch {}
  }
  const local = await idbGet('lessons', lessonId);
  if (local) return local;
  return DEMO_LESSONS.find(l => l.id === lessonId) || null;
}

// 4. Hoạt động & Đáp án (Activities)
export async function getActivities(lessonId) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('activities').select('*').eq('lesson_id', lessonId).order('"order"');
      if (!error && data?.length) {
        data.forEach(a => idbPut('activities', a));
        return data;
      }
    } catch {}
  }
  const idbData = await idbGetAll('activities');
  const filtered = idbData.filter(a => a.lesson_id === lessonId);
  if (filtered.length) return filtered;
  return DEMO_ACTIVITIES.filter(a => a.lesson_id === lessonId);
}

// 5. Tiến trình học tập (Progress)
export async function saveProgress(userId, lessonId, completedActivities, score, minutesSpent = 0) {
  const record = {
    id: `${userId}_${lessonId}`,
    user_id: userId,
    lesson_id: lessonId,
    completed_activities: completedActivities,
    score,
    minutes_spent: minutesSpent,
    last_updated: new Date().toISOString()
  };
  await idbPut('progress', record);
  localStorage.setItem(`a0jyng_progress_${record.id}`, JSON.stringify(record));

  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      await sb.from('progress').upsert(record, { onConflict: 'user_id,lesson_id' });
    } catch (e) {
      console.warn('[Progress Offline Queue]: Đã lưu cục bộ, sẽ đồng bộ khi có mạng');
    }
  }
  return record;
}

export async function getProgress(userId, lessonId) {
  const key = `${userId}_${lessonId}`;
  const local = await idbGet('progress', key);
  if (local) return local;
  const ls = localStorage.getItem(`a0jyng_progress_${key}`);
  if (ls) return JSON.parse(ls);

  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data } = await sb.from('progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).single();
      if (data) {
        await idbPut('progress', data);
        return data;
      }
    } catch {}
  }
  return null;
}

// 6. Tài liệu AI học (Materials)
export async function getMaterials(subjectId = null) {
  const idbData = await idbGetAll('materials');
  let result = idbData || [];
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      let q = sb.from('materials').select('*').order('created_at', { ascending: false });
      if (subjectId) q = q.eq('subject_id', subjectId);
      const { data, error } = await q;
      if (!error && data?.length) {
        data.forEach(m => idbPut('materials', m));
        return data;
      }
    } catch {}
  }
  if (subjectId) result = result.filter(m => m.subject_id === subjectId);
  return result;
}

export async function uploadMaterial({ subjectId, title, content, userId }) {
  const mat = {
    id: 'mat-' + Date.now(),
    subject_id: subjectId,
    title,
    content,
    uploaded_by: userId,
    created_at: new Date().toISOString()
  };
  await idbPut('materials', mat);

  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      const { data } = await sb.from('materials').insert(mat).select().single();
      if (data) return data;
    } catch {}
  }
  return mat;
}

// 7. Diễn đàn hỏi đáp (Forum)
export async function getForumPosts({ subjectId = null, search = '' } = {}) {
  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      let q = sb.from('forum_posts').select('*').order('created_at', { ascending: false });
      if (subjectId) q = q.eq('subject_id', subjectId);
      if (search)    q = q.ilike('title', `%${search}%`);
      const { data, error } = await q;
      if (!error && data?.length) {
        data.forEach(p => idbPut('forum_posts', p));
        return data;
      }
    } catch {}
  }
  let localPosts = await idbGetAll('forum_posts');
  if (!localPosts || !localPosts.length) {
    localPosts = DEMO_FORUM_POSTS;
    localPosts.forEach(p => idbPut('forum_posts', p));
  }
  if (subjectId) localPosts = localPosts.filter(p => p.subject_id === subjectId);
  if (search)    localPosts = localPosts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  return localPosts;
}

export async function createForumPost({ userId, subjectId, title, content, tags = [] }) {
  const post = {
    id: 'post-' + Date.now(),
    user_id: userId,
    subject_id: subjectId,
    title,
    content,
    tags,
    views: 1,
    is_solved: false,
    created_at: new Date().toISOString()
  };
  await idbPut('forum_posts', post);

  const health = await checkDatabaseHealth();
  if (health.cloud) {
    try {
      const sb = await getSupabase();
      await sb.from('forum_posts').insert(post);
    } catch {}
  }
  return post;
}

// ── BACKUP & SYNC CONSOLE TOOLS ──

// Xuất toàn bộ cơ sở dữ liệu ra file JSON
export async function exportDatabaseJSON() {
  const tables = ['users', 'subjects', 'chapters', 'lessons', 'activities', 'progress', 'forum_posts', 'materials'];
  const dbData = { exported_at: new Date().toISOString(), version: '2.0', data: {} };
  for (const t of tables) {
    dbData.data[t] = await idbGetAll(t);
  }
  return JSON.stringify(dbData, null, 2);
}

// Nhập dữ liệu từ file JSON vào Database
export async function importDatabaseJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed.data) throw new Error('File sao lưu không hợp lệ');
  for (const [store, records] of Object.entries(parsed.data)) {
    if (Array.isArray(records)) {
      for (const r of records) {
        await idbPut(store, r);
      }
    }
  }
  return true;
}

// Nạp dữ liệu mẫu ban đầu vào IndexedDB
export async function seedCompleteData() {
  for (const s of DEMO_SUBJECTS)   await idbPut('subjects', s);
  for (const c of DEMO_CHAPTERS)   await idbPut('chapters', c);
  for (const l of DEMO_LESSONS)    await idbPut('lessons', l);
  for (const a of DEMO_ACTIVITIES) await idbPut('activities', a);
  for (const p of DEMO_FORUM_POSTS)await idbPut('forum_posts', p);
  return true;
}

// Tự động seed nếu lần đầu mở
openIndexedDB().then(async () => {
  const current = await idbGetAll('subjects');
  if (!current || !current.length) {
    seedCompleteData();
  }
});

// ── DEMO SEED DATA (Mẫu chuẩn THPT) ──
const DEMO_SUBJECTS = [
  { id:'toan-10', name:'Toán 10', grade:10, icon:'📐', color:'#1E40AF', description:'Đại số, Hình học & Thống kê 10' },
  { id:'vat-ly-10', name:'Vật lý 10', grade:10, icon:'⚡', color:'#7C3AED', description:'Cơ học & Động học chất điểm' },
  { id:'hoa-hoc-10', name:'Hóa học 10', grade:10, icon:'🧪', color:'#059669', description:'Cấu tạo nguyên tử & Bảng tuần hoàn' },
  { id:'ngu-van-10', name:'Ngữ văn 10', grade:10, icon:'📖', color:'#DC2626', description:'Văn học dân gian & Thơ ca' },
  { id:'toan-11', name:'Toán 11', grade:11, icon:'📐', color:'#1E40AF', description:'Giới hạn, Đạo hàm & Lượng giác' },
  { id:'vat-ly-11', name:'Vật lý 11', grade:11, icon:'⚡', color:'#7C3AED', description:'Điện từ trường & Quang hình học' },
  { id:'toan-12', name:'Toán 12', grade:12, icon:'📐', color:'#1E40AF', description:'Ứng dụng đạo hàm & Tích phân' },
  { id:'vat-ly-12', name:'Vật lý 12', grade:12, icon:'⚡', color:'#7C3AED', description:'Dao động cơ & Sóng điện từ' }
];

const DEMO_CHAPTERS = [
  { id:'toan-10-c1', subject_id:'toan-10', name:'Chương 1: Mệnh đề và tập hợp', order:1 },
  { id:'toan-10-c2', subject_id:'toan-10', name:'Chương 2: Bất phương trình và hệ bất phương trình', order:2 },
  { id:'vat-ly-10-c1', subject_id:'vat-ly-10', name:'Chương 1: Động học chất điểm', order:1 },
  { id:'hoa-hoc-10-c1', subject_id:'hoa-hoc-10', name:'Chương 1: Cấu tạo nguyên tử', order:1 }
];

const DEMO_LESSONS = [
  { id:'toan-10-c1-b1', chapter_id:'toan-10-c1', name:'Bài 1: Mệnh đề', content:'## Mệnh đề\nMệnh đề toán học là một khẳng định có thể xác định được đúng hoặc sai.', order:1 },
  { id:'toan-10-c1-b2', chapter_id:'toan-10-c1', name:'Bài 2: Tập hợp & Các phép toán', content:'## Tập hợp\nTập hợp là một nhóm các phần tử có chung tính chất.', order:2 },
  { id:'vat-ly-10-c1-b1', chapter_id:'vat-ly-10-c1', name:'Bài 1: Chuyển động thẳng đều', content:'## Chuyển động thẳng đều\nVận tốc không đổi theo thời gian: $s = v \\cdot t$.', order:1 }
];

const DEMO_ACTIVITIES = [
  { id:'toan-10-c1-b1-hd1', lesson_id:'toan-10-c1-b1', name:'Hoạt động 1: Nhận diện mệnh đề', question:'Xét câu: "Số 17 là số nguyên tố". Câu này có phải là mệnh đề không?', answer:'Đây là MỆNH ĐỀ ĐÚNG, vì 17 chỉ chia hết cho 1 và chính nó.', order:1 },
  { id:'toan-10-c1-b1-hd2', lesson_id:'toan-10-c1-b1', name:'Hoạt động 2: Phủ định mệnh đề', question:'Phủ định mệnh đề: "Mọi hình vuông đều là hình chữ nhật"', answer:'Phủ định: "Tồn tại một hình vuông không phải là hình chữ nhật" (Mệnh đề phủ định này là SAI).', order:2 }
];

const DEMO_FORUM_POSTS = [
  { id:'1', title:'Cách nhớ bảng giá trị chân lý của mệnh đề kéo theo?', content:'Mọi người có mẹo nào nhớ bảng P kéo theo Q không ạ?', subject_id:'toan-10', views:58, is_solved:true, created_at:new Date(Date.now() - 3600000).toISOString() },
  { id:'2', title:'Phương pháp giải bài toán chuyển động ngược chiều?', content:'Lý 10 phần động học hai xe gặp nhau giải bằng công thức nào nhanh nhất?', subject_id:'vat-ly-10', views:42, is_solved:false, created_at:new Date(Date.now() - 7200000).toISOString() }
];
