# 🚀 Git Rules for AI Vibe Code (Safe Commit + Easy Revert)

## 🎯 Mục tiêu

* Không bao giờ mất code
* Mỗi commit đều có thể rollback (revert) an toàn
* AI hoặc dev đều nhìn vào là hiểu và làm đúng
* Tránh conflict + tránh phá production

---

## 1. 🌿 Branch Strategy (CỰC KỲ QUAN TRỌNG)

### Luôn dùng mô hình này:

* `main` → code chạy production (KHÔNG commit trực tiếp)
* `dev` → code đang phát triển
* `feature/*` → mỗi tính năng 1 branch riêng
* `fix/*` → sửa bug

### Quy tắc:

* ❌ KHÔNG commit trực tiếp vào `main`
* ❌ KHÔNG commit trực tiếp vào `dev`
* ✅ Luôn tạo branch mới trước khi code

```bash
git checkout dev
git pull origin dev
git checkout -b feature/ten-tinh-nang
```

---

## 2. 💾 Commit Rules (Chuẩn AI đọc hiểu)

### Format commit:

```
<type>: <short description>
```

### Types:

* `feat`: thêm tính năng
* `fix`: sửa lỗi
* `refactor`: tối ưu code
* `style`: UI/format
* `docs`: tài liệu
* `test`: test
* `chore`: việc vặt

### Ví dụ:

```bash
git commit -m "feat: add login with google"
git commit -m "fix: handle null user crash"
```

### Quy tắc:

* ✅ Commit nhỏ, rõ ràng
* ❌ Không commit 1000 dòng 1 lần
* ❌ Không commit code đang lỗi

---

## 3. 🔐 Safe Commit (KHÔNG BAO GIỜ MẤT CODE)

### Trước khi commit LUÔN:

```bash
git add .
git status
```

### Nếu chưa chắc chắn:

```bash
git stash
```

👉 giúp lưu tạm code tránh mất

---

## 4. 🔁 Merge Rules (AN TOÀN)

### Flow chuẩn:

```bash
git checkout dev
git pull origin dev
git merge feature/ten-tinh-nang
```

### Sau đó push:

```bash
git push origin dev
```

### ❗ KHÔNG merge thẳng vào main

---

## 5. 🧯 Revert / Rollback (CỨU MẠNG)

### Xem lịch sử:

```bash
git log --oneline
```

### Quay lại commit cũ:

```bash
git checkout <commit_id>
```

### Revert an toàn (khuyên dùng):

```bash
git revert <commit_id>
```

👉 tạo commit mới để undo → KHÔNG mất lịch sử

### Reset (NGUY HIỂM):

```bash
git reset --hard <commit_id>
```

❌ chỉ dùng khi chắc chắn

---

## 6. 🛡️ Backup Strategy

### Luôn push sau khi commit:

```bash
git push origin feature/ten-tinh-nang
```

### Không để code local quá lâu

---

## 7. 🔄 Sync Code (TRÁNH CONFLICT)

```bash
git checkout dev
git pull origin dev
```

Sau đó:

```bash
git checkout feature/ten-tinh-nang
git merge dev
```

---

## 8. ⚠️ Rules cho AI Code

* AI KHÔNG được:

  * xóa file quan trọng
  * sửa config nếu không rõ
  * force push

* AI PHẢI:

  * commit theo từng bước nhỏ
  * test trước khi commit
  * giữ code cũ nếu chưa chắc

---

## 9. 🔥 Golden Rules

* 1 commit = 1 mục đích
* luôn có branch
* luôn có backup
* không bao giờ panic reset

---

## 10. 🧠 Pro Tips

### Alias nhanh:

```bash
git config --global alias.lg "log --oneline --graph --decorate"
```

### Xem trạng thái nhanh:

```bash
git status
```

### Kiểm tra thay đổi:

```bash
git diff
```

---

## ✅ Checklist trước khi push

* [ ] Code chạy OK
* [ ] Không lỗi console
* [ ] Commit đúng format
* [ ] Đang ở đúng branch
* [ ] Đã pull latest code

---

## 🚀 Kết luận

Follow đúng rule này:
👉 Không bao giờ mất code
👉 Luôn revert được
👉 Team + AI làm việc mượt

---

---

# 🧩 11. TEAM WORKFLOW (5–10 Dev + AI KHÔNG CONFLICT)

## 🎯 Mục tiêu

* Nhiều dev + AI cùng code vẫn ổn định
* Không conflict hoặc conflict tối thiểu
* Luôn rollback được
* Code review rõ ràng

---

## 11.1 🧱 Kiến trúc làm việc

### Mỗi người / AI:

* 1 task = 1 branch riêng
* Không làm chung 1 file nếu không cần thiết

### Naming branch:

```
feature/user-login
feature/payment-qr
fix/api-timeout
ai/chibi-generator
```

---

## 11.2 🔄 Workflow chuẩn (BẮT BUỘC)

### Bước 1: Sync code mới nhất

```bash
git checkout dev
git pull origin dev
```

### Bước 2: Tạo branch

```bash
git checkout -b feature/ten-task
```

### Bước 3: Code + commit nhỏ

```bash
git commit -m "feat: ..."
```

### Bước 4: Push branch

```bash
git push origin feature/ten-task
```

### Bước 5: Tạo Pull Request (PR)

* Base: `dev`
* Reviewer: 1–2 người hoặc AI reviewer

---

## 11.3 🔍 Code Review Rules

### BẮT BUỘC trước khi merge:

* ✅ Code chạy được
* ✅ Không conflict
* ✅ Không phá logic cũ
* ✅ Pass test (nếu có)

### AI review check:

* logic sai
* security cơ bản
* duplicate code

---

## 11.4 ⚔️ Conflict Prevention (CỰC QUAN TRỌNG)

### 1. Chia file rõ ràng

* mỗi module 1 folder
* tránh nhiều người sửa cùng file

### 2. Pull thường xuyên

```bash
git checkout dev
git pull origin dev
```

### 3. Update branch trước khi merge

```bash
git checkout feature/ten-task
git merge dev
```

---

## 11.5 🤖 AI Collaboration Rules

### AI làm gì:

* generate code theo module
* commit nhỏ
* không sửa file global nếu không cần

### AI KHÔNG được:

* force push
* sửa config CI/CD
* merge trực tiếp

---

## 11.6 🚦 Merge Strategy

### Dùng:

* ✅ Merge commit hoặc Squash

### Không dùng:

* ❌ Rebase khi team chưa hiểu rõ

---

## 11.7 🛑 Protection Rules (GitHub)

### Protect branch `main` + `dev`:

* required PR
* required review
* không push trực tiếp

---

## 11.8 🧯 Khi có lỗi production

### Cách xử lý nhanh:

```bash
git checkout dev
git revert <commit lỗi>
git push origin dev
```

Sau đó:

* fix ở branch mới

---

## 11.9 📦 Release Flow

```bash
dev -> main
```

### Steps:

1. test toàn bộ
2. merge dev → main
3. tag version

---

## 11.10 ⚡ Tối ưu cho team 5–10 người

* 1 ngày: pull 2–3 lần
* mỗi người 1 feature
* không commit file lớn cùng lúc
* ưu tiên backend/frontend tách riêng

---

## 🧠 FINAL RULE

> "Mỗi người 1 nhánh - Mỗi nhánh 1 mục tiêu - Không ai đụng main"

---

**END FILE**
