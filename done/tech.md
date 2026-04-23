# Tech Stack

## Backend
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.x | HTTP server |
| socket.io | ^4.x | Real-time |
| sql.js | ^1.10.x | SQLite (in-memory) |
| bcryptjs | ^2.4.x | Password hashing |
| jsonwebtoken | ^9.x | JWT auth |
| cors | ^2.8.x | CORS |
| helmet | ^7.x | Security |
| dotenv | ^16.x | Environment |

## Mobile (Flutter)
| Package | Purpose |
|---------|---------|
| flutter_webrtc | Video call |
| socket_io_client | Real-time |
| provider | State management |
| dio | HTTP client |
| agora_rtc_engine | Video SDK |

## Web (React)
| Package | Purpose |
|---------|---------|
| react | UI |
| react-dom | DOM rendering |
| react-router-dom | Routing |
| socket.io-client | Real-time |
| simple-peer | WebRTC |
| axios | HTTP |
| zustand | State |
| vite | Build tool |

## Security
- JWT tokens với expiry
- Bcrypt password hashing
- CORS whitelist
- Helmet security headers
- Input validation

## Architecture Patterns
- MVC for backend
- Provider pattern for Flutter
- Zustand for React state
- Repository pattern cho data access