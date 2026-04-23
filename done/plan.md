# Plan - Kế Hoạch Phát Triển

## Ý Tưởng
Chat app với video call hỗ trợ đa nền tảng (Flutter mobile + React web)

## Features theo giai đoạn

### Phase 1: MVP - Hoàn thành ✅
- [x] Architecture design
- [x] Backend setup (Node.js + SQLite via sql.js)
- [x] Auth API (Register/Login/JWT)
- [x] User management
- [x] Real-time messaging (Socket.io)
- [x] Video call signaling (WebRTC relay)

### Phase 2: Mobile (Flutter) - Hoàn thành ✅
- [x] Project structure
- [x] Models (User, Message, Conversation)
- [x] Services (API, Socket, Agora)
- [x] Providers (Auth, Chat, Call)
- [x] Auth screens (Login, Register)
- [x] Home screen with conversation list
- [x] Search screen
- [x] Chat screen
- [x] Video call screen (UI ready)

### Phase 3: Web (React) - Hoàn thành ✅
- [x] Project structure (Vite + React)
- [x] Services (API, Socket, WebRTC)
- [x] Store (Zustand: auth, chat)
- [x] 3-column layout (Sidebar + ChatList + ChatPanel)
- [x] Sidebar component (nav icons + avatar + logout)
- [x] ChatList component (search + tabs All/Unread + items)
- [x] ChatPanel component (header + messages + input)
- [x] Message bubble styling (sent/received)
- [x] Online status + unread badge
- [x] Real-time message handling
- [x] Fix simple-peer global not defined

### Phase 4: Polish
- [x] Cài đặt dependencies và test
- [x] Fix login error handling (không reload khi sai)
- [x] UI 3-column hybrid design
- [ ] Fix WebRTC integration
- [ ] Testing end-to-end

## Tech Stack
- Backend: Node.js + Express + SQLite (sql.js) + Socket.io
- Mobile: Flutter + flutter_webrtc
- Web: React + simple-peer + Zustand
- Video: WebRTC relay hoặc Agora SDK

## UI Design (Hybrid)
```
┌────────────────────────────────────────────────────┐
│  [Sidebar 64px]  │  [ChatList 280px]  │ [ChatPanel] │
│                  │                    │             │
│  [Avatar]        │  [Search Bar]      │ [Header]    │
│                  │  [All] [Unread]    │             │
│  [Chat]    ●     │                    │ [Messages]  │
│  [Contacts]      │  [User A]     12:30 │             │
│  [Cloud]         │  [User B]     Now   │             │
│  [Settings]      │  [User C]     2d    │ [Input]     │
│                  │                    │             │
│  [Logout]        │                    │             │
└────────────────────────────────────────────────────┘
```