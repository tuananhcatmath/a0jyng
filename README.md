# a0jyng — Nền tảng học tập trực tuyến

Nền tảng học tập trực tuyến cá nhân hóa, hiện đại, tích hợp AI.

---

## 🗂️ Cấu trúc thư mục

```
a0jyng/
├── index.html            # Trang chủ giới thiệu
├── news.html             # Tin tức
├── contact.html          # Liên hệ
├── login.html            # Đăng nhập
├── forgot-password.html  # Quên mật khẩu
├── register.html         # Đăng ký (3 bước + chọn kiểu học)
├── dashboard.html        # Trang chính (auth required)
├── subjects.html         # Danh sách môn học
├── chapters.html         # Danh sách chương (?subject=toan-10)
├── lessons.html          # Danh sách bài học (?chapter=toan-10-c1)
├── lesson-detail.html    # Bài học + Hoạt động + Đáp án (?id=...)
│
│   ── 9 Tiện ích ──
├── schedule.html         # 📅 Lịch học thông minh
├── roadmap.html          # 🧭 Lộ trình cá nhân hóa
├── pomodoro.html         # ⏱️ Đồng hồ Pomodoro
├── ai-chat.html          # 🤖 AI hỏi đáp (Gemini)
├── forum.html            # 💬 Diễn đàn học sinh
├── textbook.html         # 📖 Giải bài tập SGK
├── theorems.html         # 📐 Chứng minh định lý
├── summaries.html        # 📝 Tóm tắt kiến thức
├── progress.html         # 📊 Tiến trình & biểu đồ
├── reports.html          # 📋 Báo cáo tháng + gửi email phụ huynh
│
├── firebase.json         # Firebase Hosting config
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json# Firestore composite indexes
└── assets/
    ├── css/style.css     # Custom CSS (animations, print...)
    └── img/
    │   └── logo.svg      # Logo SVG (a0jyng)
    └── js/
        ├── firebase-config.js  # Firebase credentials (điền vào đây)
        ├── auth.js             # Auth utilities
        ├── app.js              # Shared utilities
        └── seed-data.js        # Dữ liệu mẫu cho Firestore
```

---

## 🚀 Cách chạy nhanh (không cần Firebase)

Mọi trang đều có **fallback demo data** — bạn có thể xem ngay mà không cần cấu hình Firebase:

```bash
# Option 1: Python (có sẵn trên hầu hết máy)
python -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
# Click chuột phải vào index.html → "Open with Live Server"
```

> ⚠️ **Không mở file:// trực tiếp** — các trang dùng ES Modules cần HTTP server.

Sau đó truy cập: `http://localhost:8080`

---

## 🔧 Cài đặt Firebase (để dữ liệu thật)

### 1. Cài Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Tạo Firebase project

Vào [console.firebase.google.com](https://console.firebase.google.com/):
1. Tạo project mới tên `a0jyng`
2. Bật **Authentication** → Email/Password + Google
3. Bật **Firestore Database** (mode Production)
4. Vào **Project Settings** → Web App → lấy SDK config

### 3. Điền credentials

Mở `assets/js/firebase-config.js` và điền thông tin Firebase:

```js
export const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "a0jyng.firebaseapp.com",
  projectId:         "a0jyng",
  storageBucket:     "a0jyng.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};
```

### 4. Nhập dữ liệu mẫu

Mở browser console trên trang `dashboard.html` sau khi đăng nhập và chạy:

```js
const { seedSubjects, seedChapters, seedLessons, seedActivities } = await import('./assets/js/seed-data.js');
const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
const { getFirestore, setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
const { firebaseConfig } = await import('./assets/js/firebase-config.js');
const db = getFirestore(initializeApp(firebaseConfig));
for (const s of seedSubjects)   await setDoc(doc(db, 'subjects',   s.id), s);
for (const c of seedChapters)   await setDoc(doc(db, 'chapters',   c.id), c);
for (const l of seedLessons)    await setDoc(doc(db, 'lessons',    l.id), l);
for (const a of seedActivities) await setDoc(doc(db, 'activities', a.id), a);
console.log('✅ Seed data uploaded!');
```

### 5. Kích hoạt AI hỏi đáp

1. Lấy API key miễn phí tại [aistudio.google.com](https://aistudio.google.com/)
2. Mở `ai-chat.html`, tìm dòng `YOUR_GEMINI_API_KEY` và thay bằng key thật

### 6. Deploy lên Firebase Hosting

```bash
firebase deploy
```

Website sẽ có URL: `https://a0jyng.web.app`

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | HTML + TailwindCSS (CDN) + Vanilla JS (ES Modules) |
| Backend/DB | Firebase (Firestore + Auth + Hosting) |
| AI Q&A | Gemini 2.0 Flash API |
| Charts | Chart.js 4 |
| Math render | MathJax 3 |
| Icons | Emoji (không cần thư viện) |
| Font logo | Playfair Display (Google Fonts) |

---

## ✅ Tính năng đã hoàn thành

### Trang công ty
- [x] Trang chủ giới thiệu (hero, features, learning flow, stats)
- [x] Tin tức (featured article + card grid)
- [x] Liên hệ (form + FAQ)

### Auth
- [x] Đăng nhập (Firebase email/password, Google placeholder)
- [x] Đăng ký 3 bước (thông tin → chọn kiểu học → thành công)
- [x] Quên mật khẩu (Firebase reset email)

### Nền tảng học tập
- [x] Dashboard với sidebar responsive
- [x] Chọn môn học → Chương → Bài học → Hoạt động → Đáp án
- [x] Render công thức toán (MathJax)
- [x] Lưu tiến trình vào Firestore
- [x] Reading progress bar

### 9 Tiện ích
- [x] **Lịch học** — tháng/tuần, tạo sự kiện, lặp lại, localStorage
- [x] **Lộ trình** — phát hiện kiểu học, timeline cá nhân hóa, gợi ý theo style
- [x] **Pomodoro** — SVG ring, 3 chế độ, notification, keyboard shortcuts
- [x] **AI hỏi đáp** — Gemini API + demo fallback, context môn học
- [x] **Diễn đàn** — Firestore realtime + demo fallback, filter, search
- [x] **Giải bài tập SGK** — step-by-step, MathJax, copy solution
- [x] **Chứng minh định lý** — 7 định lý (Toán/Lý/Hóa), collapsible proofs
- [x] **Tóm tắt kiến thức** — 3 chế độ: Cheatsheet / Flashcard / Mind map
- [x] **Tiến trình** — Chart.js bar + donut + heatmap (progress.html)
- [x] **Báo cáo tháng** — line/donut chart, streak calendar, so sánh, xuất PDF, gửi email phụ huynh

### Kỹ thuật
- [x] Responsive mobile (Tailwind)
- [x] Firestore security rules
- [x] Firestore composite indexes
- [x] Logo SVG
- [x] Tất cả trang có fallback demo (hoạt động không cần Firebase)
- [x] `@media print` CSS cho báo cáo

---

## 🔜 Hướng phát triển tiếp

- [ ] Firebase Cloud Functions để gửi email báo cáo tự động hàng tháng
- [ ] Hệ thống gamification (điểm thưởng, leaderboard)
- [ ] Upload video bài giảng (Firebase Storage)
- [ ] App mobile (React Native / Flutter)
- [ ] PWA (Service Worker, offline mode)
- [ ] Thanh toán (Stripe / VNPay) cho gói Premium

---

## 👥 Liên hệ

Website: [a0jyng.edu.vn](https://a0jyng.edu.vn)  
Email: contact@a0jyng.edu.vn
