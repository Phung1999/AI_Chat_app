# Errors - Lỗi Thường Gặp

## Backend

### Database
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| Database locked | SQLite concurrent access | Use WAL mode |
| Table not found | Migration chưa chạy | Run initDb.js |

### Auth
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| Invalid token | Token hết hạn/sai | Refresh token |
| Password incorrect | Hash mismatch | Check bcrypt |
| Email exists | Duplicate email | Return 409 |

### Socket.io
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| Connection refused | Server down | Check if server running |
| Room not found | User not in room | Join room first |

## Flutter
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| WebRTC failed | ICE failed | Check STUN/TURN config |
| Socket disconnect | Network issue | Auto reconnect |

## React
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| CORS blocked | Wrong origin | Update CORS whitelist |
| WebRTC not supported | Old browser | Show warning |

### Friend Request Errors
| Lỗi | Nguyên nhân | Cách xử lý |
|------|-------------|------------|
| 400 "Contact already exists" | Đã là bạn hoặc đã gửi request | Kiểm tra DB, xóa contacts cũ |
| 400 "Cannot add yourself" | Target = current user | Validate trước khi gửi |
| Socket notification not received | User B chưa online | Đảm bảo cả 2 đã đăng nhập |
| contactsAPI is not defined | Import thiếu trong chatStore | Thêm vào import |

---

## Troubleshooting Guide

### Backend không start
```bash
# Check port
netstat -ano | findstr 3000
# Kill if needed
taskkill /PID <pid> /F
```

### Database corruption
```bash
# Delete and recreate
rm database.sqlite
node src/models/initDb.js
```

### Socket connection failed
- Check server URL correct
- Check CORS settings
- Check network/firewall