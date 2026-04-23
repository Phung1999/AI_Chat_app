# Structure - Cấu Trúc Project

```
D:\project\AI_chat_app\
├── backend/
│   ├── src/
│   │   ├── config/         # Database, constants
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.io handlers
│   │   └── index.js        # Entry point
│   └── package.json
│
├── mobile_app/             # Flutter
│   └── lib/
│       ├── config/
│       ├── models/
│       ├── providers/
│       ├── screens/
│       ├── services/
│       └── widgets/
│
├── web_app/                # React
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
├── done/                   # Documentation
└── assets/                 # Design specs
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

### UI Layout (3-column)
```
[Sidebar 64px] | [ChatList 280px] | [ChatPanel 1fr]
```

### Message Flow
```
User A → type message → press Enter/Send
      → socket.emit('send_message', {conversationId, content})
      → Server creates message in DB
      → Server emits 'new_message' to all in conversation
      → User B receives and displays message
      → User B marks as read
```