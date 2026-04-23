# Luật Của Tôi - Chat & Video Call App

## Tech Stack
- Backend: Node.js + Express + SQLite + Socket.io
- Mobile: Flutter + flutter_webrtc + Agora
- Web: React + simple-peer

## Quy Tắc Code

### Backend (Node.js)
1. Config trong .env, không hardcode
2. Error handling với try-catch + logging
3. API response format: `{ success: bool, data?, error? }`
4. JWT auth cho protected routes
5. SQLite với better-sqlite3 (sync, nhanh)

### Flutter
1. Provider cho state management
2. Tách service riêng (api, socket, agora)
3. Error handling ở mọi API call
4. Loading states cho UI

### React
1. Zustand cho state
2. Custom hooks cho logic tái sử dụng
3. Error boundaries
4. Loading states

## Git Rules
- Branch: main → dev → feature/*
- Commit: feat:, fix:, refactor:, style:, docs:
- KHÔNG commit trực tiếp vào main/dev
- Push sau mỗi commit

## API Format
- RESTful: GET/POST/PUT/DELETE
- Header: Authorization: Bearer <token>
- Response: JSON `{ success, data, error }`

## Database Schema
- users: id, email, password_hash, display_name, avatar_url, online_status
- contacts: id, user_id, contact_id, status
- conversations: id, type, name
- messages: id, conversation_id, sender_id, content, type, file_url
- call_logs: id, caller_id, receiver_id, call_type, status

## Socket Events
- Messaging: send_message, new_message, typing, read_message
- Call: call_user, incoming_call, accept/decline, offer/answer/ice_candidate
- Status: user_online, user_offline

## Đã Đọc
- done/luat_cua_toi.md
- rules/rule_git.md
- rules/rules_skill_code.md