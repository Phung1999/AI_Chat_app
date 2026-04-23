# History - Timeline Phát Triển

## 2026-04-23 (Session 2)
### UI Overhaul - Hybrid Design
- Thiết kế lại HomePage với **3-column layout**
- Tạo Sidebar component (64px, nav icons + avatar)
- Tạo ChatList component (280px, search + tabs + items)
- Tạo ChatPanel component (messages + input + actions)
- Thêm hover effects cho items
- Thêm tabs All/Unread cho conversation list

### Fixes
- Sửa Login error handling (không bị reload khi sai)
- Sửa 401 interceptor không redirect trong auth requests
- Thêm console.log để debug conversation creation
- Fix Socket emit format: `{message, conversationId}`

### Backend Updates
- Conversation API trả về `unreadCount`, `lastMessage`, `participants`
- Message có `read_by` field cho seen status
- Socket emit `conversationId` cùng message để frontend xử lý

## 2026-04-23 (Session 1)
- Thiết kế architecture tổng thể
- Chọn tech stack: Node.js + Flutter + React + Agora
- Setup cấu trúc thư mục
- **Code Backend hoàn chỉnh** (Node.js + Express + SQLite + Socket.io)
- **Code Flutter hoàn chỉnh** (Models, Services, Providers, Screens)
- **Code React Web hoàn chỉnh** (Zustand store, Components, Pages)
- Khởi động backend: npm start (port 3000)
- Khởi động web: npm run dev (port 5173/5174)
- **Fix lỗi**: `global is not defined` trong simple-peer
  - Thêm `define: { global: 'globalThis' }` vào vite.config.js

## TODO
- [x] Cài đặt dependencies và test
- [x] Fix login error handling
- [x] 3-column layout
- [ ] Fix WebRTC integration
- [ ] Testing end-to-end