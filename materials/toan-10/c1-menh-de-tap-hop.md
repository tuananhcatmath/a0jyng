---
subject: toan-10
chapter: toan-10-c1
title: Chương 1 - Mệnh đề và Tập hợp
grade: 10
tags: [mệnh-đề, logic, tập-hợp, giao-hợp]
---

# Chương 1: Mệnh đề và Tập hợp

## 1. Mệnh đề

### 1.1 Định nghĩa
**Mệnh đề** là một câu khẳng định **đúng** hoặc **sai**, không thể vừa đúng vừa sai.

**Ví dụ mệnh đề:**
- "2 + 2 = 4" → Mệnh đề ĐÚNG ✅
- "Hà Nội là thủ đô của Việt Nam" → Mệnh đề ĐÚNG ✅
- "3 là số chẵn" → Mệnh đề SAI ❌

**Không phải mệnh đề:**
- "Bạn có học bài không?" (câu hỏi)
- "Hãy học chăm chỉ!" (câu cầu khiến)
- "x + 1 = 5" (x chưa xác định → chưa xác định đúng/sai)

### 1.2 Phủ định của mệnh đề
Phủ định của mệnh đề P, ký hiệu **$\overline{P}$** (hay ¬P):
- Nếu P đúng → $\overline{P}$ sai
- Nếu P sai → $\overline{P}$ đúng

**Ví dụ:**
- P: "5 là số lẻ" (Đúng)
- $\overline{P}$: "5 không phải số lẻ" (Sai)

### 1.3 Mệnh đề kéo theo (P ⇒ Q)
"Nếu P thì Q" — **P kéo theo Q**

| P | Q | P ⇒ Q |
|---|---|--------|
| Đ | Đ | **Đúng** |
| Đ | S | **Sai** |
| S | Đ | **Đúng** |
| S | S | **Đúng** |

> 💡 **Ghi nhớ:** Mệnh đề kéo theo chỉ SAI khi P đúng mà Q sai!

### 1.4 Mệnh đề tương đương (P ⟺ Q)
"P khi và chỉ khi Q" — P và Q có cùng giá trị chân lý.

---

## 2. Tập hợp

### 2.1 Khái niệm
**Tập hợp** là một nhóm các đối tượng có cùng tính chất nào đó.

**Ký hiệu:**
- $a \in A$ : a thuộc tập hợp A
- $b \notin A$ : b không thuộc tập hợp A
- $\emptyset$ : tập hợp rỗng

### 2.2 Cách xác định tập hợp
**Liệt kê:** $A = \{1, 2, 3, 4, 5\}$

**Nêu tính chất:** $B = \{x \in \mathbb{N} \mid x < 6\}$

### 2.3 Quan hệ bao hàm
- $A \subset B$ : A là tập con của B (mọi phần tử của A đều thuộc B)
- $A = B$ khi và chỉ khi $A \subset B$ và $B \subset A$

### 2.4 Các phép toán tập hợp

**Giao:** $A \cap B = \{x \mid x \in A \text{ và } x \in B\}$

**Hợp:** $A \cup B = \{x \mid x \in A \text{ hoặc } x \in B\}$

**Hiệu:** $A \setminus B = \{x \mid x \in A \text{ và } x \notin B\}$

**Phần bù:** $C_U A = U \setminus A$ (với U là tập hợp toàn thể)

---

## 3. Hoạt động luyện tập

### Hoạt động 1
Trong các câu sau, câu nào là mệnh đề? Nếu là mệnh đề, hãy xác định tính đúng/sai:
1. $\sqrt{4} = 2$
2. $x^2 + 1 = 0$ (x ∈ ℝ)
3. "Học đi đôi với hành"
4. 7 là số nguyên tố

**Đáp án:**
1. Mệnh đề ĐÚNG ($\sqrt{4} = 2$)
2. Không phải mệnh đề (phụ thuộc x)
3. Không phải mệnh đề (câu tục ngữ, không có giá trị chân lý xác định)
4. Mệnh đề ĐÚNG (7 chỉ chia hết cho 1 và 7)

### Hoạt động 2
Cho $A = \{1,2,3,4,5\}$ và $B = \{2,4,6,8\}$. Tìm:
- $A \cap B$
- $A \cup B$
- $A \setminus B$

**Đáp án:**
- $A \cap B = \{2, 4\}$
- $A \cup B = \{1, 2, 3, 4, 5, 6, 8\}$
- $A \setminus B = \{1, 3, 5\}$
