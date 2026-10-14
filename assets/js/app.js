// ============================================================
// app.js — Tiện ích dùng chung cho toàn bộ website
// ============================================================

/** Lấy tham số từ URL query string */
export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/** Format ngày theo kiểu Việt Nam */
export function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Hiển thị toast thông báo */
export function showToast(msg, type = "success") {
  const colors = { success: "bg-green-500", error: "bg-red-500", info: "bg-blue-500" };
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white font-medium shadow-lg ${colors[type]} transition-all`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/** Render thanh breadcrumb */
export function renderBreadcrumb(items) {
  const el = document.getElementById("breadcrumb");
  if (!el) return;
  el.innerHTML = items
    .map((it, i) =>
      i < items.length - 1
        ? `<a href="${it.href}" class="hover:text-accent text-blue-200 transition">${it.label}</a> <span class="text-blue-300 mx-1">/</span>`
        : `<span class="text-white font-semibold">${it.label}</span>`
    )
    .join("");
}

/** Skeleton loader helper */
export function skeletonCard(count = 3) {
  return Array.from({ length: count }, () =>
    `<div class="animate-pulse bg-slate-200 rounded-2xl h-32"></div>`
  ).join("");
}

/** Tính % tiến trình */
export function calcProgress(completed, total) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

/** Lưu / lấy từ localStorage */
export const storage = {
  set: (k, v) => localStorage.setItem(`a0jyng_${k}`, JSON.stringify(v)),
  get: (k)    => { try { return JSON.parse(localStorage.getItem(`a0jyng_${k}`)); } catch { return null; } },
  del: (k)    => localStorage.removeItem(`a0jyng_${k}`),
};
