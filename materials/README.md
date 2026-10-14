# 📁 Thư mục Tài liệu học (Materials)

## Mục đích
Đây là nơi bạn đặt tài liệu học để AI đọc, học, và tổng hợp kiến thức cho học sinh.

## Cách upload tài liệu lên web

### Bước 1: Tạo file Markdown
Tạo file `.md` theo cấu trúc sau:

```markdown
---
subject: toan-10          # ID môn học
chapter: toan-10-c1       # ID chương
title: Bài 1 - Mệnh đề   # Tiêu đề
grade: 10                 # Lớp
tags: [mệnh-đề, logic]   # Thẻ tìm kiếm
---

## 1. Khái niệm

Nội dung lý thuyết...

## 2. Ví dụ

Ví dụ minh họa...

## 3. Bài tập

Bài tập áp dụng...
```

### Bước 2: Upload lên hệ thống

**Cách A — Qua trang web (khi có Supabase):**
1. Đăng nhập với tài khoản Admin
2. Vào **Dashboard → Quản lý tài liệu**
3. Click "Upload tài liệu"
4. Chọn file `.md` hoặc paste nội dung
5. AI sẽ tự động index và học

**Cách B — Trực tiếp qua Supabase Dashboard:**
1. Vào Supabase → Table Editor → `materials`
2. Insert row với `subject_id`, `title`, `content` (nội dung MD)

**Cách C — Script upload hàng loạt:**
```bash
node scripts/upload-materials.js
```

---

## Cấu trúc thư mục gợi ý

```
materials/
├── toan-10/
│   ├── c1-menh-de-tap-hop.md
│   ├── c2-bat-phuong-trinh.md
│   └── c3-ham-so-bac-nhat.md
├── toan-11/
│   ├── c1-gioi-han.md
│   └── c2-dao-ham.md
├── vat-ly-10/
│   ├── c1-dong-hoc.md
│   └── c2-dong-luc-hoc.md
└── hoa-hoc-10/
    └── c1-nguyen-tu.md
```

---

## AI sẽ làm gì với tài liệu?

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 AI hỏi đáp | Trả lời dựa trên tài liệu bạn upload |
| 📝 Tóm tắt tự động | Tạo cheatsheet, flashcard từ nội dung |
| 📐 Định lý | Trích xuất và chứng minh định lý |
| 💡 Bôi xanh | Giải thích đoạn văn từ context tài liệu |
| 📊 Báo cáo | Đề xuất ôn tập dựa trên nội dung yếu |
