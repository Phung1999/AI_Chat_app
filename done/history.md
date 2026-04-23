# History - Timeline Phát Triển

## 2026-04-23 (Session 4)
### Friend Request & Group Chat
- Thêm tính năng kết bạn với chấp nhận/từ chối
- Socket events: `add_friend`, `accept_friend`, `decline_friend`
- Nút thêm bạn (👤+) và tạo nhóm (👥+) trong ChatList
- Modal thêm bạn với search + send request
- Modal tạo nhóm với chọn thành viên
- Group chat API: create, add members, remove, leave
- Socket event: `create_group`, `group_invite`

### Backend Updates
- Route: GET `/api/contacts/pending`
- Route: POST `/api/conversations/group`
- Service: `createGroupConversation`, `addMemberToGroup`, `removeMemberFromGroup`

## 2026-04-23 (Session 3)
### UI Polish & Fixes
- Reset database với password 123 cho tất cả users
- Tạo reset-db.js để reset database nhanh

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
- Fix Socket emit format: `{message, conversationId}`

### Backend Updates
- Conversation API trả về `unreadCount`, `lastMessage`, `participants`
- Message có `read_by` field cho seen status

## 2026-04-23 (Session 1)
- Thiết kế architecture tổng thể
- Chọn tech stack: Node.js + Flutter + React + Agora
- Setup cấu trúc thư mục
- Code Backend hoàn chỉnh
- Code Flutter hoàn chỉnh
- Code React Web hoàn chỉnh
- Khởi động backend: npm start (port 3000)
- Khởi động web: npm run dev (port 5173/5174)
- Fix lỗi: `global is not defined` trong simple-peer

## TODO
- [x] Cài đặt dependencies và test
- [x] Fix login error handling
- [x] 3-column layout
- [x] Friend request system
- [x] Group chat
- [ ] Fix WebRTC integration
- [ ] Testing end-to-end