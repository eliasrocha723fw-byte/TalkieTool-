# TalkieTool 🎮🎧

**Voice communication interface optimized for gaming**

> Interfaz de audio para juegos - A fast, lightweight voice chat app for gamers that doesn't interfere with gameplay.

## 📋 Features

### 🎯 Core Features
- ⚡ **Floating Bubble** - Draggable PTT (Push-to-Talk) button that stays on top during gameplay
- 🎧 **Competitive Audio** - Crystal clear voice without radio effects, low latency
- 👥 **Quick Rooms** - Create or join rooms with 4-digit codes (no registration needed)
- 🎮 **Gaming Optimized** - Runs in background, won't drop FPS, doesn't cut game audio

### 💰 Freemium Model
- **Free**: Basic voice, limited rooms
- **Premium**: Better audio, unlimited rooms, voice recording, no ads

## 🏗️ Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI server with all routes
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
└── frontend/
    ├── app.json               # Expo configuration
    ├── package.json           # React Native dependencies
    ├── .env                   # Frontend env variables
    ├── app/                   # Screens (Expo Router)
    │   ├── _layout.tsx
    │   ├── index.tsx          # Splash
    │   ├── login.tsx          # Login screen
    │   ├── home.tsx           # Lobby (create/join rooms)
    │   ├── room/[code].tsx    # Voice room
    │   ├── premium.tsx        # Premium upgrade
    │   ├── premium-success.tsx
    │   ├── settings.tsx
    │   └── auth-callback.tsx
    └── src/
        ├── api.ts             # API client
        ├── FloatingBubble.tsx # Draggable bubble component
        └── theme.ts           # Design tokens
```

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Update .env with your MongoDB and Stripe keys
python server.py
```

Backend runs on `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
# Update .env with backend URL
npx expo start
```

## 📱 Tech Stack

**Backend:**
- FastAPI (Python)
- MongoDB (Database)
- Stripe (Payments)
- Motor (Async MongoDB)

**Frontend:**
- React Native + Expo
- Expo Router (Navigation)
- Expo AV (Audio)
- Stripe JS (Payments)

## 🔐 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=talkietool
STRIPE_API_KEY=sk_test_...
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/nickname` - Login with nickname
- `POST /api/auth/google` - Google OAuth
- `GET /api/user/{user_id}` - Get user details

### Rooms
- `POST /api/room/create` - Create new room
- `POST /api/room/join` - Join room by code
- `GET /api/room/{code}` - Get room details
- `POST /api/room/leave` - Leave room

### Voice
- `POST /api/voice/send` - Send voice message
- `GET /api/voice/messages/{room_code}` - Get messages

### Payments
- `POST /api/checkout/create` - Create checkout session
- `POST /api/checkout/confirm` - Confirm payment

## 💡 Key Features Implementation

### PTT (Push-to-Talk) with Floating Bubble
- Uses `react-native-reanimated` for smooth animations
- `PanResponder` for drag handling
- Stays visible over all apps
- Record audio with `expo-av`

### Low-Latency Audio
- Direct WebRTC connection (planned)
- Currently using REST API for MVP
- Opus codec for compression

### Room System
- 4-digit room codes for easy sharing
- Auto-generated unique codes
- Real-time member tracking
- Automatic cleanup when room is empty

### Monetization
- Stripe integration for subscriptions
- In-app purchase flow
- Premium feature gating

## 🔄 User Flow

1. **Login** - Enter nickname or use Google OAuth
2. **Home** - Create new room or join existing
3. **Room** - Join voice chat with floating bubble PTT
4. **Premium** - Optional upgrade for more features

## 📊 Next Steps

- [ ] WebRTC integration for real P2P voice
- [ ] Voice recording with compression
- [ ] Advanced audio processing (noise cancellation)
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] iOS/Android native build
- [ ] Push notifications

## 📝 License

MIT License - See LICENSE file

## 👨‍💻 Author

Created with ❤️ for gamers

---

**Made with Expo + React Native + FastAPI**
