"# Coder Arena ⚔️💻

A competitive PvP coding battle game where you write code to control fighters in real-time combat!

## 🎮 What is Coder Arena?

**Coder Arena** is a unique multiplayer game where:
- You **write code** in the CASL programming language
- Your code **controls a fighter** autonomously
- Fighters **battle in real-time** while you watch
- The best strategy wins!

Think of it as competitive programming meets fighting games. Code your strategy, deploy your fighter, and watch it battle!

## ✨ Key Features

### 🥊 Core Gameplay
- ✅ **Real-time PvP battles** - Code vs Code combat
- ✅ **CASL Programming Language** - Simple but powerful
- ✅ **Live Battle Visualization** - Watch your code fight
- ✅ **Quick Match & Private Rooms** - Play with anyone or friends
- ✅ **Test Arena** - Practice against dummy AI

### 📊 Stats & Progression
- ✅ **Player Statistics** - Track W/L, win rate, streaks
- ✅ **Achievement System** - Unlock badges and rewards
- ✅ **Match History** - Review past battles
- ✅ **Profile Page** - View your career stats

### 🎨 Polish & UX
- ✅ **Rematch System** - Challenge opponents again
- ✅ **Share Results** - Brag about victories
- ✅ **Toast Notifications** - Stay informed
- ✅ **Spectator Mode** - Watch live battles
- ✅ **Sound Effects** - Immersive audio
- ✅ **Keyboard Shortcuts** - Efficient navigation

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ ← Players & Spectators
│   (Port 5173)   │
└────────┬────────┘
         │ WebSocket (Socket.io)
         │
┌────────▼────────┐
│  Backend Server │ ← Game Engine
│   (Port 3001)   │
│  - Auth System  │
│  - Matchmaking  │
│  - CASL Engine  │
│  - Battle Sim   │
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
# Build and run production
docker-compose -f docker-compose.prod.yml up -d

# Access at http://localhost:3000
```

## 📖 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - How to play and write CASL code
- **[CASL Language Reference](docs/CASL_LANGUAGE.md)** - Complete language spec
- **[CASL Examples](docs/CASL_EXAMPLES.md)** - Code examples and strategies
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and fixes
- **[Roadmap](docs/ROADMAP.md)** - Future features
- **[Changelog](docs/CHANGELOG.md)** - Version history

## 📁 Project Structure

```
coder-arena/
├── server/                  # Backend game server
│   └── src/
│       ├── engine/          # Battle simulation & CASL interpreter
│       ├── managers/        # Auth, Matchmaking, Lobby, Rematch
│       ├── network/         # WebSocket event handlers
│       └── core/            # Match logic
├── client/                  # React frontend
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # Login, Lobby, Editor, Battle, Results, Profile
│       ├── hooks/           # Custom React hooks
│       ├── stores/          # Zustand state management
│       └── contexts/        # Auth, Socket contexts
├── shared/                  # Shared TypeScript types
│   └── types/               # Player, Match, Events interfaces
├── docs/                    # Documentation
│   ├── USER_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── CASL_LANGUAGE.md
│   └── ...
└── docker-compose.yml       # Docker configuration
```

## 🎯 How It Works

1. **Login** - Enter a username to join
2. **Queue** - Join quick match or create private room
3. **Code** - Write CASL code to control your fighter (2 min)
4. **Ready** - Submit code and wait for opponent
5. **Battle** - Watch your code fight in real-time!
6. **Results** - View stats, achievements, and rematch

### Example CASL Code

```casl
// Simple aggressive strategy
IF distance < 50 THEN
  ATTACK
ELSE
  MOVE_TO enemy
END
```

See more examples in [CASL_EXAMPLES.md](docs/CASL_EXAMPLES.md)

## 🎯 Features

### Gameplay
- ✅ PvP competitive coding battles
- ✅ CASL programming language
- ✅ Real-time battle visualization
- ✅ Quick match matchmaking
- ✅ Private room system
- ✅ Test arena for practice
- ✅ Spectator mode

### Progression
- ✅ Win/Loss/Draw tracking
- ✅ Win rate calculation
- ✅ Win streak tracking
- ✅ Match history (50 matches)
- ✅ Achievement system (6 badges)
- ✅ Profile page

### Polish
- ✅ Rematch system (30s timeout)
- ✅ Share results
- ✅ Toast notifications
- ✅ Sound effects (toggle)
- ✅ Keyboard shortcuts
- ✅ Tooltips
- ✅ Smooth animations
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
- Express (HTTP server)
- JWT authentication
- In-memory storage (upgradable to DB)

**Frontend:**
- React 18 + TypeScript
- Vite (build tooling)
- Styled Components (CSS-in-JS)
- Zustand (state management)
- Monaco Editor (code editing)
- Framer Motion (animations)

## 🔧 Development Commands

```bash
npm run dev              # Run both server + client
npm run dev:server       # Server only (nodemon)
npm run dev:client       # Client only (Vite)
npm run build            # Build for production
npm start                # Run production build
npm run install:all      # Install all dependencies
npm test                 # Run tests
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

See [ROADMAP.md](docs/ROADMAP.md) for planned features.

## 📄 License

ISC License - feel free to use for personal or commercial projects!
" 
