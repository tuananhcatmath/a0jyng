// ============================================================
// supabase-config.js — Cấu hình Supabase cho a0jyng
// Thay YOUR_* bằng giá trị từ Supabase Dashboard
// Settings → API → Project URL & anon key
// ============================================================

export const SUPABASE_URL  = "https://qyylwkhqtmfcbulaoqun.supabase.co";
export const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eWx3a2hxdG1mYmNidWxhb3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NDk4MjcsImV4cCI6MjEwNzUyNTgyN30.0JzLpbWgtDRTvP2Rzb6YIH0GaB4QSA5wG3GO_YxzWhw";

// SUPABASE_MODE = true khi đã điền credentials thật
export const SUPABASE_MODE = SUPABASE_URL !== "YOUR_SUPABASE_URL";

// Gemini AI config
export const GEMINI_API_KEY = "AQ.Ab8RN6L7B-4bvUcQUIBW_s2E1QuGRsR73VN1hE5plBUrvRHzmw"; // từ aistudio.google.com
export const GEMINI_MODEL   = "gemini-2.0-flash-exp";
export const GEMINI_MODE    = GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY";

// Tạo Supabase client (lazy — chỉ gọi khi SUPABASE_MODE = true)
let _client = null;
export async function getSupabase() {
  if (!SUPABASE_MODE) return null;
  if (_client) return _client;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  _client = createClient(SUPABASE_URL, SUPABASE_ANON);
  return _client;
}
