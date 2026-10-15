// ============================================================
// auth.js — Quản lý xác thực chuẩn hóa đa nền tảng (Supabase & Offline)
// ============================================================
import { getCurrentUser, signOut as dbSignOut } from './db.js';

/**
 * Kiểm tra trạng thái đăng nhập thống nhất toàn website
 * @param {boolean} requireAuth
 */
export async function requireAuthState(requireAuth = true) {
  const user = await getCurrentUser();
  if (requireAuth && !user) {
    window.location.href = "login.html";
    return null;
  } else if (!requireAuth && user) {
    window.location.href = "dashboard.html";
    return user;
  }
  return user;
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getUserProfile() {
  return await getCurrentUser();
}

/**
 * Đăng xuất an toàn
 */
export async function logout() {
  await dbSignOut();
  window.location.href = "index.html";
}
