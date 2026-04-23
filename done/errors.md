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