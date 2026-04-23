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
- [x] Friend request system (add, accept, decline)
- [x] Group chat creation modal

### Phase 4: Polish
- [x] Cài đặt dependencies và test
- [x] Fix login error handling (không reload khi sai)
- [x] UI 3-column hybrid design
- [x] Friend request & group chat
- [ ] Fix WebRTC integration
- [ ] Testing end-to-end

## Tech Stack
- Backend: Node.js + Express + SQLite (sql.js) + Socket.io
- Mobile: Flutter + flutter_webrtc
- Web: React + simple-peer + Zustand
- Video: WebRTC relay hoặc Agora SDK

## API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Users
- GET `/api/users/search?q=`
- GET `/api/users/online`
- PUT `/api/users/status`

### Contacts
- GET `/api/contacts`
- GET `/api/contacts/pending`
- POST `/api/contacts` (add friend)
- PUT `/api/contacts/:id` (accept/decline)
- DELETE `/api/contacts/:id`

### Conversations
- GET `/api/conversations`
- POST `/api/conversations` (direct chat)
- POST `/api/conversations/group` (create group)
- GET `/api/conversations/:id/messages`
- POST `/api/conversations/:id/messages`
- POST `/api/conversations/:id/read`

## UI Design (Hybrid)
```
┌────────────────────────────────────────────────────┐
│  [Sidebar 64px]  │  [ChatList 280px]  │ [ChatPanel] │
│                  │                    │             │
│  [Avatar]        │  [👥+] [👤+] [🔔] │ [Header]    │
│                  │  [Search...]      │             │
│  [Chat]    ●     │  [All] [Unread]    │ [Messages]  │
│  [Contacts]      │                    │             │
│  [Cloud]         │  [User A]    12:30 │             │
│  [Settings]      │  [User B]    Now   │ [Input]     │
│                  │                    │             │
│  [Logout]        │                    │             │
└────────────────────────────────────────────────────┘
```

## Socket Events

### Messaging
- `send_message`, `new_message`
- `typing`, `user_typing`
- `stop_typing`, `user_stop_typing`

### Friend System
- `add_friend`, `friend_request`
- `accept_friend`, `friend_accepted`
- `decline_friend`, `friend_declined`

### Group Chat
- `create_group`, `group_created`
- `group_invite`

### Video Call
- `call_user`, `incoming_call`
- `accept_call`, `call_accepted`
- `decline_call`, `call_declined`
- `offer`, `answer`, `ice_candidate`