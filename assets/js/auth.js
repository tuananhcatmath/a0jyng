// ============================================================
// auth.js — Quản lý xác thực (đăng nhập / đăng ký / đăng xuất)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

/**
 * Kiểm tra người dùng đã đăng nhập chưa.
 * - Nếu chưa đăng nhập và requireAuth=true → redirect về login.html
 * - Nếu đã đăng nhập và requireAuth=false → redirect về dashboard.html
 * @param {boolean} requireAuth
 * @returns {Promise<import("firebase/auth").User|null>}
 */
export function requireAuthState(requireAuth = true) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (requireAuth && !user) {
        window.location.href = "login.html";
      } else if (!requireAuth && user) {
        window.location.href = "dashboard.html";
      } else {
        resolve(user);
      }
    });
  });
}

/**
 * Lấy thông tin profile từ Firestore
 * @param {string} uid
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Đăng xuất và redirect về trang chủ
 */
export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}
