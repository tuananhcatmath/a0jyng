# 🚀 Deployment Guide — GitHub + Vercel + Supabase

## Tổng quan kiến trúc

```
GitHub (source code)
    ↓ push
Vercel (auto-deploy, CDN toàn cầu)
    ↓ kết nối
Supabase (PostgreSQL database + Auth + Storage)
```

---

## Bước 1: Đưa code lên GitHub

### 1.1 Tạo repo GitHub
1. Vào [github.com](https://github.com) → **New repository**
2. Tên repo: `a0jyng`
3. Chọn **Public** (hoặc Private)
4. **Không** check "Add README" (đã có rồi)
5. Click **Create repository**

### 1.2 Push code lên
```bash
cd C:\Users\Admin\.gemini\antigravity\scratch\a0jyng

# Khởi tạo git (lần đầu)
git init
git add .
git commit -m "Initial commit: a0jyng v1.0"

# Kết nối với GitHub
git remote add origin https://github.com/YOUR_USERNAME/a0jyng.git
git branch -M main
git push -u origin main
```

### 1.3 Cập nhật sau khi sửa code
```bash
git add .
git commit -m "Update: mô tả thay đổi"
git push
# → Vercel tự động deploy trong ~30 giây
```

---

## Bước 2: Deploy lên Vercel

### 2.1 Tạo tài khoản Vercel
1. Vào [vercel.com](https://vercel.com) → **Sign Up with GitHub**

### 2.2 Import project
1. Click **Add New → Project**
2. Tìm repo `a0jyng` → **Import**
3. Framework Preset: chọn **Other** (không phải Next.js)
4. Build Command: *(để trống)*
5. Output Directory: *(để trống — deploy thư mục gốc)*
6. Click **Deploy**

### 2.3 Cài đặt domain
- URL tự động: `https://a0jyng.vercel.app`
- Custom domain: Project Settings → Domains → Add `a0jyng.edu.vn`

### 2.4 Environment Variables (cho API keys)
Project Settings → Environment Variables → Add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` |
| `GEMINI_API_KEY` | `AIza...` |

> ⚠️ **Lưu ý:** Vì project dùng HTML tĩnh + JS client-side, các env var này cần được hardcode vào `assets/js/supabase-config.js` trước khi push.

---

## Bước 3: Cài đặt Supabase

### 3.1 Tạo project Supabase
1. Vào [supabase.com](https://supabase.com) → **New Project**
2. Tên: `a0jyng`, Password: (ghi lại), Region: `Southeast Asia (Singapore)`
3. Click **Create new project** (chờ ~2 phút)

### 3.2 Chạy SQL schema
1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **New Query**
3. Copy toàn bộ nội dung file `supabase-schema.sql`
4. Paste vào editor → **Run** (▶️)

### 3.3 Lấy API credentials
1. Vào **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`
3. Điền vào `assets/js/supabase-config.js`:
```js
export const SUPABASE_URL  = "https://xxxxx.supabase.co";
export const SUPABASE_ANON = "eyJhbGci...";
```

### 3.4 Bật Authentication
1. **Authentication → Providers → Email** → Enable
2. **Authentication → URL Configuration**:
   - Site URL: `https://a0jyng.vercel.app`
   - Redirect URLs: `https://a0jyng.vercel.app/login.html`

---

## Bước 4: Lấy Gemini API Key

1. Vào [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key → Create API key**
3. Điền vào `assets/js/supabase-config.js`:
```js
export const GEMINI_API_KEY = "AIzaSy...";
```

---

## Tóm tắt nhanh

```bash
# 1. Điền config
nano assets/js/supabase-config.js  # điền Supabase + Gemini keys

# 2. Push lên GitHub
git add . && git commit -m "Add credentials" && git push

# 3. Vercel tự deploy → https://a0jyng.vercel.app ✅
```

---

## Checklist triển khai

- [ ] GitHub repo tạo xong
- [ ] Code đã push lên GitHub
- [ ] Vercel import project thành công
- [ ] Supabase project tạo xong
- [ ] SQL schema đã chạy
- [ ] `supabase-config.js` đã điền URL + anon key
- [ ] Gemini API key đã điền
- [ ] Test đăng ký / đăng nhập
- [ ] Test AI hỏi đáp
- [ ] Custom domain (tùy chọn)
