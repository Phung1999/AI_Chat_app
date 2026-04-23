# Chrome MCP Setup Guide

## Cách 1: Chrome DevTools MCP (Google Official) - Khuyên dùng

### Bước 1: Khởi động Chrome với Remote Debugging
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

# Hoặc mở Chrome thủ công:
# 1. Close all Chrome windows
# 2. Run: chrome.exe --remote-debugging-port=9222
```

### Bước 2: Cài đặt MCP Server
```bash
npm install -g chrome-devtools-mcp
```

### Bước 3: Cấu hình MCP Client (tùy client)

#### VS Code (cần extension MCP)
Thêm vào `.vscode/mcp.json`:
```json
{
  "servers": {
    "chrome": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "env": {
        "CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS": "1"
      }
    }
  }
}
```

#### Cursor/Roo Code
Thêm vào MCP settings:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### Bước 4: Verify
Sau khi cấu hình, MCP client sẽ có tools như:
- `chrome_navigate` - Điều hướng trang
- `chrome_click` - Click element
- `chrome_type` - Nhập text
- `chrome_screenshot` - Chụp ảnh màn hình
- `chrome_evaluate` - Chạy JavaScript

---

## Cách 2: Playwright (Đã có sẵn trong project)

Dùng Playwright đã cài trong project:
```bash
node test-e2e.js
```

---

## Cách 3: Manual Test (Đơn giản nhất)

1. Mở 2 tab Chrome: http://localhost:5173
2. Tab 1: login `usera@test.com`
3. Tab 2: login `userb@test.com`
4. Test nhắn tin real-time

---

## Quick Start Script

Chạy script để khởi động Chrome với debugging:
```bash
# Windows PowerShell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\ChromeDebugProfile"
```