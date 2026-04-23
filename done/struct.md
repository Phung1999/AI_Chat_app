# Structure - Cấu Trúc Project

```
D:\project\AI_chat_app\
├── backend/
│   ├── src/
│   │   ├── config/         # Database, constants
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/    # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/        # Socket.io handlers
│   │   └── index.js       # Entry point
│   ├── data/              # SQLite database
│   ├── reset-db.js        # Reset database script
│   └── package.json
│
├── mobile_app/            # Flutter
│   └── lib/
│       ├── config/
│       ├── models/
│       ├── providers/
│       ├── screens/
│       ├── services/
│       └── widgets/
│
├── web_app/               # React
│   └── src/
│       ├── components/
│       │   ├── auth/       # LoginForm, RegisterForm
│       │   ├── chat/       # ChatList, ChatPanel, MessageBubble
│       │   ├── common/     # Navbar
│       │   └── layout/    # Sidebar
│       ├── pages/          # Login, Register, Home, VideoCall
│       ├── services/       # api, socket, constants
│       ├── store/          # authStore, chatStore
│       └── hooks/          # useAuth, useSocket, useWebRTC
│
├── done/                  # Documentation
└── assets/               # Design specs
```

## Luồng Dữ Liệu

### Authentication Flow
```
Client → POST /api/auth/login → Server → Validate → JWT Token → Client
```

### Real-time Messaging
```
Client A → socket.emit('send_message') → Server → Store DB → Broadcast
Server → socket.emit('new_message', {message, conversationId}) → Client B
```

### Friend Request Flow
```
User A → search user → click add friend
     → socket.emit('add_friend', {targetUserId})
     → Server → socket.emit('friend_request') → User B
User B → accept/decline
     → socket.emit('accept_friend', {contactId, fromUserId})
     → Server → Both users can now chat
```

### Group Chat Flow
```
User A → click 👥+ → enter name, select members
     → POST /api/conversations/group or socket.emit('create_group')
     → Server creates group → notifies all members
     → All members can see group in chat list
```

### UI Layout (3-column)
```
[Sidebar 64px] | [ChatList 280px] | [ChatPanel 1fr]
```

## Database Schema

### users
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| email | TEXT | Unique email |
| password_hash | TEXT | Bcrypt hash |
| display_name | TEXT | Display name |
| avatar_url | TEXT | Profile picture |
| online_status | INTEGER | 0 = offline, 1 = online |

### contacts
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Requester |
| contact_id | INTEGER | Target user |
| status | TEXT | pending/accepted |

### conversations
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| type | TEXT | direct/group |
| name | TEXT | Group name (if group) |
| created_at | TEXT | Timestamp |

### conversation_participants
| Field | Type | Description |
|-------|------|-------------|
| conversation_id | INTEGER | FK to conversations |
| user_id | INTEGER | FK to users |

### messages
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| conversation_id | INTEGER | FK to conversations |
| sender_id | INTEGER | FK to users |
| content | TEXT | Message text |
| message_type | TEXT | text/image/file |
| file_url | TEXT | File URL |
| read_by | TEXT | JSON array of user IDs |
| created_at | TEXT | Timestamp |