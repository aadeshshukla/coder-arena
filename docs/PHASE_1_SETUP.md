# Phase 1: Authentication & Lobby System Setup

## Overview
Phase 1 implements the foundation for Coder Arena's competitive PvP system with user authentication and real-time lobby functionality. Players can login, see other online players, and interact in real-time.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Setup Instructions

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:3000`
   - WebSocket server on `ws://localhost:3001`
   - Frontend development server on `http://localhost:5173`

3. **Access the application:**
   Open your browser to `http://localhost:5173`

## Features Implemented

### Authentication System
- ✅ JWT-based authentication with 7-day token expiry
- ✅ Username validation (3-20 alphanumeric characters)
- ✅ Token stored in localStorage for auto-login
- ✅ Auto-validation on page refresh
- ✅ Secure logout functionality

### Lobby System
- ✅ Real-time player list updates
- ✅ Online player count display
- ✅ Player cards showing username, status, and stats
- ✅ Current user's card is highlighted
- ✅ Socket.io room management for lobby

### UI Components
- ✅ Login page with username input
- ✅ Lobby page with player list
- ✅ Reusable styled components (Button, Input, StatusBadge)
- ✅ Cyberpunk theme with dark blues and neon accents
- ✅ Responsive design for desktop

## Testing Checklist

### Authentication Flow
- [ ] Login with valid username (3-20 alphanumeric chars)
- [ ] Login fails with username < 3 chars
- [ ] Login fails with username > 20 chars
- [ ] Login fails with special characters in username
- [ ] Token is stored in localStorage after successful login
- [ ] User auto-logs in when refreshing page
- [ ] Logout removes token and returns to login page

### Lobby Functionality
- [ ] User enters lobby after successful login
- [ ] Lobby displays user's username in header
- [ ] Lobby shows correct online player count
- [ ] Current user's card is highlighted
- [ ] Opening multiple browsers shows multiple players
- [ ] Players see each other in real-time
- [ ] Player list updates when someone joins
- [ ] Player list updates when someone leaves/logs out
- [ ] Player cards display username, status badge, and stats (W/L)

### UI/UX
- [ ] No console errors
- [ ] All buttons have hover effects
- [ ] Input fields have focus states
- [ ] Status badges show appropriate colors
- [ ] Layout is responsive on desktop
- [ ] Theme colors match cyberpunk aesthetic

## Architecture

### Backend Structure
```
server/src/
├── core/
│   └── Player.ts              # Player class with status and stats
├── managers/
│   ├── AuthManager.ts         # JWT authentication manager
│   └── LobbyManager.ts        # Lobby state manager
└── network/
    ├── socketServer.ts        # WebSocket server initialization
    └── eventHandlers/
        ├── authHandler.ts     # Auth event handlers
        └── lobbyHandler.ts    # Lobby event handlers
```

### Frontend Structure
```
client/src/
├── contexts/
│   ├── AuthContext.tsx        # Authentication context & provider
│   └── SocketContext.tsx      # Socket.io connection context
├── stores/
│   └── lobbyStore.ts          # Zustand store for lobby state
├── pages/
│   ├── LoginPage/             # Login page component
│   └── LobbyPage/             # Lobby page with player list
│       ├── PlayerCard.tsx     # Individual player card
│       └── PlayerList.tsx     # Grid of player cards
├── components/common/
│   ├── Button.tsx             # Reusable button component
│   ├── Input.tsx              # Reusable input component
│   └── StatusBadge.tsx        # Player status badge
├── Router.tsx                 # React Router configuration
└── theme.ts                   # Theme colors
```

### Shared Types
```
shared/types/
├── player.ts                  # Player data interfaces
└── events.ts                  # Socket event interfaces
```

## Socket Events

### Authentication Events
- `auth:login` - Login with username, receive JWT token
- `auth:validate` - Validate existing token for auto-login
- `auth:logout` - Logout and cleanup

### Lobby Events
- `lobby:join` - Join the lobby room
- `lobby:leave` - Leave the lobby room
- `lobby:update` - Receive lobby state updates (broadcast)
- `lobby:request_state` - Request current lobby state

## What's Coming in Phase 2

Phase 2 will implement the matchmaking and game queue system:
- Matchmaking queue with skill-based pairing
- Match creation and management
- In-game UI for watching/playing matches
- Real-time match state updates
- Post-match stats and results

## Environment Variables

For production deployment, set the following environment variable:
```bash
JWT_SECRET=your-secure-secret-key-here
```

In development, a default secret is used.

## Troubleshooting

### Socket Connection Issues
- Ensure WebSocket server is running on port 3001
- Check CORS settings in `server/src/network/socketServer.ts`
- Verify no firewall blocking port 3001

### Authentication Issues
- Clear localStorage and try logging in again
- Check browser console for token validation errors
- Verify JWT_SECRET is consistent across server restarts

### Lobby Not Updating
- Check Socket.io connection status
- Verify `lobby:join` event is being emitted
- Check server logs for event handler registration

## Known Limitations

- Player data is stored in-memory (will be lost on server restart)
- Stats (wins/losses) are not persisted (Phase 2+)
- No database integration yet (Phase 2+)
- Match functionality not implemented yet (Phase 3)
