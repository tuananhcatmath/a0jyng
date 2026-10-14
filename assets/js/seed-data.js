// ============================================================
// seed-data.js — Dữ liệu mẫu để nhập vào Firestore
// Chạy file này một lần từ browser console hoặc Node.js script
// ============================================================

export const seedSubjects = [
  { id: "toan-10", name: "Toán 10",      grade: 10, icon: "📐", color: "#3B82F6", chaptersCount: 3 },
  { id: "ly-10",   name: "Vật Lý 10",    grade: 10, icon: "⚛️",  color: "#F97316", chaptersCount: 2 },
  { id: "hoa-10",  name: "Hóa Học 10",   grade: 10, icon: "🧪",  color: "#10B981", chaptersCount: 2 },
  { id: "van-10",  name: "Ngữ Văn 10",   grade: 10, icon: "📖",  color: "#8B5CF6", chaptersCount: 2 },
  { id: "anh-10",  name: "Tiếng Anh 10", grade: 10, icon: "🌍",  color: "#EC4899", chaptersCount: 2 },
  { id: "su-10",   name: "Lịch Sử 10",   grade: 10, icon: "🏛️",  color: "#6366F1", chaptersCount: 2 },
];

export const seedChapters = [
  { id: "toan-10-c1", subjectId: "toan-10", name: "Chương 1: Mệnh đề và tập hợp",          order: 1 },
  { id: "toan-10-c2", subjectId: "toan-10", name: "Chương 2: Bất phương trình bậc nhất",   order: 2 },
  { id: "toan-10-c3", subjectId: "toan-10", name: "Chương 3: Hệ thức lượng trong tam giác", order: 3 },
  { id: "ly-10-c1",   subjectId: "ly-10",   name: "Chương 1: Động học chất điểm",           order: 1 },
  { id: "ly-10-c2",   subjectId: "ly-10",   name: "Chương 2: Động lực học chất điểm",       order: 2 },
];

export const seedLessons = [
  { id: "toan-10-c1-b1", chapterId: "toan-10-c1", name: "Bài 1: Mệnh đề",                     order: 1, theoryHTML: "<p><strong>Mệnh đề</strong> là câu khẳng định có tính đúng hoặc sai (không thể vừa đúng vừa sai).</p><p class='mt-2'>Ví dụ: <em>'2 + 2 = 4'</em> là mệnh đề <strong>đúng</strong>. <em>'1 > 5'</em> là mệnh đề <strong>sai</strong>.</p><p class='mt-2'>Câu hỏi, câu cảm thán, câu mệnh lệnh <strong>không phải</strong> là mệnh đề.</p>" },
  { id: "toan-10-c1-b2", chapterId: "toan-10-c1", name: "Bài 2: Tập hợp và các phép toán",    order: 2, theoryHTML: "<p>Tập hợp là một nhóm các phần tử có cùng tính chất xác định. Ký hiệu: ∅ (tập rỗng), ∈ (thuộc), ⊂ (con).</p>" },
  { id: "toan-10-c1-b3", chapterId: "toan-10-c1", name: "Bài 3: Các phép toán tập hợp",       order: 3, theoryHTML: "<p>Hợp: A ∪ B, Giao: A ∩ B, Hiệu: A \\ B, Phần bù: C<sub>U</sub>A.</p>" },
  { id: "ly-10-c1-b1",   chapterId: "ly-10-c1",   name: "Bài 1: Chuyển động thẳng đều",        order: 1, theoryHTML: "<p>Chuyển động thẳng đều: vận tốc không đổi, quỹ đạo thẳng. Công thức: x = x₀ + v·t</p>" },
];

export const seedActivities = [
  // Toán 10 - C1 - B1
  {
    id: "toan-10-c1-b1-hd1", lessonId: "toan-10-c1-b1", order: 1,
    name: "Hoạt động 1: Xác định mệnh đề",
    question: "Trong các câu sau, câu nào là mệnh đề?\na) 5 + 3 = 8\nb) Bạn có khỏe không?\nc) Hà Nội là thủ đô của Việt Nam\nd) Hãy học bài đi!",
    answer: "Câu <strong>a</strong> (5 + 3 = 8 — đúng) và <strong>c</strong> (Hà Nội là thủ đô — đúng) là mệnh đề.<br>Câu b là câu hỏi, câu d là câu mệnh lệnh → không phải mệnh đề.",
    hasProof: false
  },
  {
    id: "toan-10-c1-b1-hd2", lessonId: "toan-10-c1-b1", order: 2,
    name: "Hoạt động 2: Mệnh đề phủ định",
    question: "Viết mệnh đề phủ định của: 'Mọi số tự nhiên đều là số chẵn'.",
    answer: "<strong>P̄:</strong> 'Tồn tại số tự nhiên không phải là số chẵn' (tức là số lẻ). Mệnh đề P sai vì 1, 3, 5... là số lẻ. Vậy P̄ đúng.",
    hasProof: false
  },
  {
    id: "toan-10-c1-b1-hd3", lessonId: "toan-10-c1-b1", order: 3,
    name: "Hoạt động 3: Mệnh đề kéo theo",
    question: "Phát biểu mệnh đề kéo theo: 'Nếu n chia hết cho 4 thì n chia hết cho 2'. Xét tính đúng sai.",
    answer: "Mệnh đề <strong>đúng</strong>. Vì mọi số chia hết cho 4 đều chia hết cho 2 (vì 4 = 2×2).<br><em>Chú ý:</em> Chiều ngược lại (n chia hết cho 2 → chia hết cho 4) là sai (ví dụ n = 6).",
    hasProof: true,
    proof: "Chứng minh: Nếu 4 | n thì ∃ k ∈ ℤ: n = 4k = 2(2k). Đặt m = 2k ∈ ℤ, suy ra n = 2m → 2 | n. ∎"
  },
];
