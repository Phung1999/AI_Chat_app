# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
JWT token gửi qua header: `Authorization: Bearer <token>`

---

## Auth Endpoints

### POST /api/auth/register
Register new user
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
// Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "displayName": "..." },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
Login user
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}
// Response
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "displayName": "..." },
    "token": "jwt_token_here"
  }
}
```

### GET /api/auth/me
Get current user (requires auth)

---

## User Endpoints

### GET /api/users/search?q=keyword
Search users by email or name

### GET /api/users/:id
Get user by ID

### PUT /api/users/status
Update online status

---

## Contact Endpoints

### GET /api/contacts
Get contact list

### POST /api/contacts
Add new contact
```json
{
  "contactId": 2
}
```

### PUT /api/contacts/:id
Accept/Decline contact
```json
{
  "status": "accepted"
}
```

### DELETE /api/contacts/:id
Remove contact

---

## Conversation Endpoints

### GET /api/conversations
Get all conversations

### POST /api/conversations
Create/get direct conversation
```json
{
  "participantId": 2
}
```

### GET /api/conversations/:id/messages
Get messages (paginated)

---

## Socket.io Events

### Client → Server
- `join` - Join with userId
- `send_message` - Send message
- `typing` - User typing
- `call_user` - Initiate call
- `offer/answer/ice_candidate` - WebRTC signaling

### Server → Client
- `new_message` - New message
- `user_typing` - Someone typing
- `incoming_call` - Incoming call
- `call_accepted/declined` - Call response
- `user_online/offline` - Status change

---

## Error Codes
| Code | Message |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (email exists) |
| 500 | Internal Server Error |