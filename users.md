# Test Users - Chat App

## Credentials cho Test

| # | Email | Password | Display Name | Ghi chú |
|---|-------|----------|--------------|---------|
| 1 | usera@test.com | 123 | User A | Test user 1 |
| 2 | userb@test.com | 123 | User B | Test user 2 |
| 3 | testa@demo.com | 123 | Test User A | API test |
| 4 | testb@demo.com | 123 | Test User B | API test |
| 5 | alice@test.com | 123 | Alice | Test user |
| 6 | bob@test.com | 123 | Bob | Test user |

## Test Scenarios

### Test 1: Login
1. Mở http://localhost:5173
2. Đăng nhập với `usera@test.com` / `123`

### Test 2: Register
1. Mở http://localhost:5173/register
2. Điền thông tin và tạo account mới

### Test 3: Nhắn tin giữa 2 users
1. **User A**: Login → Search `userb` → Bắt đầu chat
2. **User B**: Login另一 tab → Nhận tin nhắn
3. **User B**: Reply → User A nhận được

### Test 4: Search Users
- Search bằng email: `userb`
- Search bằng name: `User`

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
```