# 📋 Changelog

All notable changes to Coder Arena will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Global leaderboard
- Tournament system
- Mobile app version

---

## [1.0.0] - 2026-02-18

### Added - Phase 5: Results, Polish & Production
- **Match Results Screen**
  - Victory/defeat animated banners
  - Side-by-side stats comparison
  - Final health bars display
  - Attack accuracy and damage breakdown
  - Match duration display
  - Share results feature

- **Rematch System**
  - Challenge same opponent to rematch
  - Accept/decline rematch requests
  - 30-second countdown timer
  - Rematch request modal

- **Player Stats & Profiles**
  - Persistent W/L record (localStorage)
  - Total matches played tracking
  - Win rate percentage calculation
  - Longest win streak tracking
  - Match history (last 50 matches)
  - Profile page to view all stats
  - Profile link in lobby

- **Achievements System**
  - 6 unlockable achievements
  - First Blood, Hat Trick, Unstoppable, etc.
  - Achievement progress tracking
  - Unlock timestamps

- **UI/UX Enhancements**
  - Toast notification system
  - Enhanced modal components
  - Tooltip components for help text
  - Keyboard shortcuts support
  - Sound effects system
  - Settings store (sound, animations toggle)
  - Improved button hover effects

- **Backend Features**
  - RematchManager for handling rematch logic
  - Rematch event handlers
  - Health check endpoint (/health)

- **Production Setup**
  - .env.example template
  - docker-compose.prod.yml
  - Health check monitoring

- **Documentation**
  - USER_GUIDE.md - Complete gameplay guide
  - DEPLOYMENT.md - Production deployment instructions
  - TROUBLESHOOTING.md - Common issues and fixes
  - ROADMAP.md - Future features roadmap
  - CHANGELOG.md - This file

### Changed
- ResultsPage now integrates with stats tracking
- LobbyPage includes profile button
- Router includes ProfilePage route
- Enhanced animations and transitions

### Fixed
- Various TypeScript type improvements
- Better error handling throughout

---

## [0.4.0] - 2026-02-15

### Added - Phase 4: Live Battles
- Real-time battle visualization
- Animated fighter sprites
- Health bar animations
- Attack and block visual effects
- Combat event timeline
- Battle arena with 800x600 canvas
- Spectator mode to watch live battles
- Match result calculation and display
- Post-battle statistics

### Changed
- Improved WebSocket performance
- Throttled state updates to 20/sec
- Optimized battle rendering

---

## [0.3.0] - 2026-02-12

### Added - Phase 3: Matchmaking & Code Editor
- Quick match system
- Matchmaking queue with timeout
- Private room creation
- Room join with codes
- Monaco code editor integration
- CASL syntax highlighting
- Code validation system
- Test arena for code testing
- Dummy AI opponent
- Ready-up system
- Match countdown timer

### Changed
- Improved lobby UI/UX
- Better error messages

---

## [0.2.0] - 2026-02-10

### Added - Phase 2: CASL Language
- CASL programming language specification
- CASL interpreter/parser
- CASL validator
- Support for IF/THEN/ELSE/END
- Support for variables (distance, health, etc.)
- Support for actions (ATTACK, BLOCK, MOVE, WAIT)
- Code execution engine
- Syntax error detection
- Runtime error handling

### Documentation
- CASL_LANGUAGE.md
- CASL_EXAMPLES.md

---

## [0.1.0] - 2026-02-08

### Added - Phase 1: Authentication & Lobby
- User authentication system
- JWT token-based auth
- Login page
- Lobby system
- Player list display
- Real-time player count
- WebSocket connection
- Socket.io integration
- Player presence tracking

### Infrastructure
- Project setup with TypeScript
- React frontend with Vite
- Node.js backend with Express
- Docker containerization
- Development environment setup

---

## [0.0.1] - 2026-02-06

### Added
- Initial project structure
- README with vision and architecture
- Basic folder structure
- Git repository initialization

---

## Version History

- **v1.0.0** - Full release with stats, achievements, and polish
- **v0.4.0** - Live battle visualization
- **v0.3.0** - Matchmaking and code editor
- **v0.2.0** - CASL language implementation
- **v0.1.0** - Authentication and lobby
- **v0.0.1** - Project inception

---

## Contributing

When adding changes to the changelog:

1. Add under [Unreleased] section
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Link to issues/PRs when relevant
4. Keep it concise but descriptive
5. Update version number when releasing

Example:
```markdown
### Added
- Feature X (#123) - Brief description
```

---

## Links

- [Repository](https://github.com/aadeshshukla/coder-arena)
- [Issues](https://github.com/aadeshshukla/coder-arena/issues)
- [Pull Requests](https://github.com/aadeshshukla/coder-arena/pulls)
- [Roadmap](ROADMAP.md)
