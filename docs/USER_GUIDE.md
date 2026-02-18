# 📖 Coder Arena User Guide

Welcome to **Coder Arena** - the competitive PvP coding battle game where your code fights for you!

## 🎮 How to Play

### 1. **Login**
- Enter a username (no password required for demo)
- Click "Login" to enter the arena

### 2. **Choose Your Battle Mode**

#### Quick Match (Recommended for beginners)
1. Click **"Quick Match"** in the lobby
2. You'll be matched with another player automatically
3. Wait in queue (usually less than 30 seconds)

#### Private Room
1. Click **"Create Private Room"**
2. Share the room code with a friend
3. They can join using **"Join Private Room"**

### 3. **Write Your Fighter Code**

You have **2 minutes** to write your CASL code that controls your fighter.

#### CASL Language Basics

```casl
// Move towards opponent
MOVE_TO enemy

// Attack when in range
IF distance < 50 THEN
  ATTACK
END

// Block incoming attacks
IF enemy_attacking THEN
  BLOCK
END
```

#### Key Variables You Can Use:
- `distance` - Distance to opponent
- `my_health` - Your current health (0-100)
- `enemy_health` - Opponent's health (0-100)
- `enemy_attacking` - True if enemy is attacking
- `my_position` - Your X,Y coordinates
- `enemy_position` - Enemy's X,Y coordinates

#### Actions You Can Take:
- `MOVE_TO enemy` - Move towards opponent
- `MOVE_AWAY` - Move away from opponent
- `ATTACK` - Deal damage (15-25)
- `BLOCK` - Reduce incoming damage by 50%
- `WAIT` - Do nothing this tick

### 4. **Test Your Code**
- Click **"Test Arena"** to fight against a dummy AI
- See if your code works before the real battle
- Refine your strategy

### 5. **Ready Up**
- Click **"Ready"** when your code is perfect
- Wait for opponent to ready up
- Battle starts in 3...2...1...

### 6. **Watch the Battle!**
- Your code executes automatically every tick
- Watch fighters move, attack, and block
- First to 0 health loses!

### 7. **View Results**
After the match:
- See detailed stats (damage dealt, attacks landed, etc.)
- Challenge opponent to a **rematch**
- Share your victory on social media
- Check your **profile** for overall stats

## 🏆 Tips & Strategies

### Beginner Strategy
```casl
// Simple aggressive approach
IF distance < 50 THEN
  ATTACK
ELSE
  MOVE_TO enemy
END
```

### Defensive Strategy
```casl
// Block when enemy attacks, counter after
IF enemy_attacking THEN
  BLOCK
ELSE IF distance < 50 THEN
  ATTACK
ELSE
  MOVE_TO enemy
END
```

### Advanced Strategy
```casl
// Health-based decision making
IF my_health < 30 THEN
  // Low health: play defensive
  IF distance > 100 THEN
    MOVE_TO enemy
  ELSE IF enemy_attacking THEN
    BLOCK
  ELSE
    MOVE_AWAY
  END
ELSE
  // High health: aggressive
  IF distance < 50 THEN
    ATTACK
  ELSE
    MOVE_TO enemy
  END
END
```

## 📊 Stats & Achievements

### Your Profile
Access your profile from the lobby to see:
- **Win/Loss Record** - Overall W/L/D
- **Win Rate** - Percentage of matches won
- **Win Streak** - Longest winning streak
- **Combat Stats** - Total damage dealt/taken
- **Match History** - Last 50 matches

### Achievements
Unlock badges by:
- 🥇 **First Blood** - Win your first match
- 🎯 **Hat Trick** - Win 3 in a row
- 🔥 **Unstoppable** - Win 5 in a row
- 🎖️ **Veteran** - Play 50 matches
- ⚔️ **Damage Dealer** - Deal 1000 total damage
- 🛡️ **Tank** - Survive 1000 damage taken

## ⚙️ Settings

Access settings from the lobby:
- **Sound Effects** - Toggle battle sounds
- **Animations** - Enable/disable animations
- **Notifications** - Match found alerts

## 🔥 Advanced Features

### Spectator Mode
- Watch live battles between other players
- Learn strategies from top players
- Available from the lobby

### Rematch System
- Challenge the same opponent again
- 30 seconds to accept/decline
- Instant re-queue if accepted

### Keyboard Shortcuts
- `ESC` - Go back
- `ENTER` - Confirm action
- `CTRL+S` - Save code (in editor)

## ❓ FAQ

**Q: How long does a match last?**
A: Usually 30-90 seconds, maximum 5 minutes.

**Q: Can I edit my code during battle?**
A: No, code is locked once battle starts.

**Q: What if my opponent disconnects?**
A: You win by default if they disconnect during prep or battle.

**Q: Is there a leaderboard?**
A: Not yet! Coming in future updates.

**Q: Can I save my code strategies?**
A: Currently stored in browser localStorage. Cloud save coming soon!

## 🆘 Need Help?

If you encounter issues:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Report bugs on GitHub Issues
3. Join our Discord community (coming soon!)

---

**Ready to battle?** Head to the lobby and queue up! ⚔️💻
