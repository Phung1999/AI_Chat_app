# Test Users - Chat App

## Credentials cho Test (Password: 123)

| # | Email | Password | Display Name | Ghi chú |
|---|-------|----------|--------------|---------|
| 1 | usera@test.com | 123 | User A | Test user 1 |
| 2 | userb@test.com | 123 | User B | Test user 2 |
| 3 | alice@test.com | 123 | Alice | Test user |
| 4 | bob@test.com | 123 | Bob | Test user |

## Test Scenarios

### Test 1: Login
1. Mở http://localhost:5173
2. Đăng nhập với `usera@test.com` / `123`

### Test 2: Register
1. Mở http://localhost:5173/register
2. Điền thông tin và tạo account mới

### Test 3: Kết bạn và nhắn tin
1. **User A**: Login → Click 👤+ → Search `userb` → Send request
2. **User B**: Login → Thấy 🔔 notification → Accept
3. **Cả 2**: Giờ có thể nhắn tin cho nhau

### Test 4: Tạo nhóm chat
1. Login với User A
2. Click 👥+ (tạo nhóm)
3. Nhập tên nhóm
4. Chọn ít nhất 2 bạn bè
5. Click "Create Group"

### Test 5: Group chat
1. Sau khi tạo nhóm, nhắn tin bình thường
2. Tất cả thành viên đều nhận được tin nhắn

## API Test
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@demo.com","password":"123","displayName":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usera@test.com","password":"123"}'

# Add friend
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"contactId":2}'

# Create group
curl -X POST http://localhost:3000/api/conversations/group \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Group","participantIds":[1,2,3]}'
```

## Reset Database
```bash
cd backend
node reset-db.js
```