"# Coder Arena

A continuously running digital fighting arena where AI fighters battle 24/7. Open your browser and watch live matches anytime, like a livestream.

## 🎮 Vision

**Coder Arena** is not a game you play—it's a game you **watch**.

- Fights happen automatically, simulated by the server
- Multiple viewers can watch the same live match
- Join mid-fight and immediately see the action
- Matches restart automatically forever
- No human players, just AI vs AI combat

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ ← Spectator View
│   (Port 3000)   │
└────────┬────────┘
         │ WebSocket (Socket.io)
         │
┌────────▼────────┐
│  Backend Engine │ ← Game Master
│   (Port 3001)   │
│  - Match Loop   │
│  - Rule Engine  │
│  - Simulator    │
└─────────────────┘
```

## 🚀 Quick Start

### Development

```bash
# Install all dependencies
npm run install:all

# Run both server and client
npm run dev
```

- Frontend: http://localhost:5173
- WebSocket: ws://localhost:3001
- Server logs in terminal

### Production (Docker)

```bash
# Build and run
docker-compose up --build

# Access at http://localhost:3000
```

## 📁 Project Structure

```
coder-arena/
├── server/              # Backend simulation engine
│   └── src/
│       ├── engine/      # Fight simulation logic
│       ├── network/     # WebSocket broadcasting
│       └── index.ts     # Entry point (HTTP + WebSocket)
├── client/              # React frontend viewer
│   └── src/
│       ├── components/  # Arena, Fighter, HealthBar
│       ├── hooks/       # WebSocket connection
│       └── styles/      # CSS styling
├── shared/              # Shared TypeScript types
│   └── types/
└── docs/
```

## 🎯 Features

- ✅ Continuous 24/7 simulation
- ✅ Real-time WebSocket updates (20/sec)
- ✅ Mid-fight synchronization for late joiners
- ✅ Rule-based AI fighters
- ✅ Visual attack/block animations
- ✅ Health bar with smooth transitions
- ✅ Winner announcements
- ✅ Auto-restart after matches

## 🛠️ Tech Stack

**Backend:**
- Node.js + TypeScript
- Socket.io (WebSocket)
- Express (static file serving)

**Frontend:**
- React 18
- TypeScript
- Socket.io-client
- Vite (build tooling)
- CSS3 animations

## 🔧 Development Commands

```bash
npm run dev              # Run both server + client
npm run dev:server       # Server only (nodemon)
npm run dev:client       # Client only (Vite)
npm run build            # Build for production
npm start                # Run production build
npm run install:all      # Install all dependencies
```

## 📦 Deployment

### Docker
```bash
docker build -t coder-arena .
docker run -p 3000:3000 -p 3001:3001 coder-arena
```

### Manual
```bash
npm run build
npm start
```

## 🎨 Customization

**Modify Fighter AI:**
Edit `server/src/engine/matchLoop.ts` lines 97-126 to change fighter strategies.

**Visual Theme:**
Edit `client/src/styles/Arena.css` for colors and animations.

**Game Balance:**
Edit `server/src/engine/simulator.ts` constants (damage, cooldowns, range).

## 📖 How It Works

1. **Server starts** and begins infinite match loop
2. **Every 100ms**, server:
   - Evaluates fighter AI rules
   - Simulates actions (movement, attacks, blocks)
   - Updates health and positions
   - Broadcasts state via WebSocket
3. **Clients connect** and receive immediate state sync
4. **React renders** fighters, health bars, and animations
5. **Match ends** when health ≤ 0
6. **2-second pause**, then new match starts

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

ISC
" 
