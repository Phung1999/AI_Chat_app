# Done - Tính Năng Đã Hoàn Thành

## Backend
- [x] Project structure setup
- [x] Database setup (SQLite via sql.js)
- [x] Auth API (register, login, logout)
- [x] User API (search, profile, status)
- [x] Contact API (add, accept, remove, pending requests)
- [x] Message API (send, get, read)
- [x] Socket.io setup (real-time messaging)
- [x] Video call signaling (WebRTC relay via socket)
- [x] Conversation API với unread count & last message
- [x] Mark messages as read khi xem
- [x] Group chat API (create, add members, remove, leave)

## Mobile (Flutter)
- [x] Project setup
- [x] Auth screens (login, register)
- [x] Home screen
- [x] Conversation list
- [x] Chat screen
- [x] Video call screen

## Web (React) - Hybrid UI
- [x] Project setup (Vite + React)
- [x] 3-column layout: Sidebar (64px) + ChatList (280px) + ChatPanel
- [x] Auth screens (Login, Register) với error handling
- [x] Sidebar component với nav icons + avatar + logout
- [x] ChatList với search, tabs (All/Unread), conversation items
- [x] ChatPanel với header, messages, input box
- [x] Message bubble: sent (right, green) / received (left, white)
- [x] Online status indicator
- [x] Unread badge + bold text
- [x] Real-time message via Socket.io
- [x] Fix simple-peer global is not defined (vite.config.js)
- [x] Friend request system (add, accept, decline)
- [x] Group chat creation modal
- [x] Notification badge cho friend requests

## Dependencies đã cài

### Backend
```
express, socket.io, sql.js, bcryptjs, jsonwebtoken, cors, helmet, dotenv
```

### Mobile (Flutter)
```
flutter_webrtc, socket_io_client, provider, dio, agora_rtc_engine
```

### Web (React)
```
socket.io-client, simple-peer, axios, react-router-dom, zustand
```

## Test Scripts
- [x] test-e2e.js (Playwright for E2E testing)
- [x] test_bookmarklet.js
- [x] test_script.js
- [x] test_api_messaging.js
- [x] test-realchat.js

## Test Users (Password: 123)
- usera@test.com / 123
- userb@test.com / 123
- alice@test.com / 123
- bob@test.com / 123