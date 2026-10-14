// ============================================================
// firebase-config.js — Cấu hình Firebase cho a0jyng
// Thay YOUR_* bằng giá trị từ Firebase Console của bạn
// ============================================================

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "a0jyng.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// DEMO_MODE = true khi chưa điền Firebase credentials thật
// Khi DEMO_MODE = true, toàn bộ site dùng localStorage thay Firebase
export const DEMO_MODE = firebaseConfig.apiKey === "YOUR_API_KEY";

// Firestore collection names
export const COLLECTIONS = {
  USERS:      "users",
  SUBJECTS:   "subjects",
  CHAPTERS:   "chapters",
  LESSONS:    "lessons",
  ACTIVITIES: "activities",
  PROGRESS:   "progress",
  FORUM:      "forumPosts",
  REPORTS:    "monthlyReports",
};
