# CASL Strategy Examples

This document contains complete, working CASL strategies that you can use as inspiration for your own fighter AI. Each example demonstrates different tactics and concepts.

## Table of Contents
1. [Beginner Bot](#1-beginner-bot)
2. [Aggressive Rushdown](#2-aggressive-rushdown)
3. [Defensive Turtle](#3-defensive-turtle)
4. [Balanced Fighter](#4-balanced-fighter)
5. [Opportunistic Hunter](#5-opportunistic-hunter)
6. [Distance Controller](#6-distance-controller)
7. [Counter Puncher](#7-counter-puncher)

---

## 1. Beginner Bot

**Difficulty:** ⭐ Beginner  
**Style:** Simple and straightforward  
**Description:** A great first strategy that covers the basics - attack when close, block when low, approach when far.

```javascript
STRATEGY BeginnerBot {
  RULE "Finish low health enemy" {
    WHEN enemy.health < 20
     AND distance < 3
    DO ATTACK
  }
  
  RULE "Block when in danger" {
    WHEN self.health < 30
     AND enemy.attackCooldown == 0
    DO BLOCK
  }
  
  RULE "Approach enemy" {
    WHEN distance > 5
    DO APPROACH
  }
  
  DEFAULT IDLE
}
```

**How it works:**
1. **Rule 1:** If the enemy is weak (< 20 health) and close, go for the kill
2. **Rule 2:** If you're low on health (< 30) and enemy can attack, block defensively
3. **Rule 3:** If enemy is far away, get closer
4. **Default:** Stand still when in mid-range

**Strengths:** Simple, safe, easy to understand  
**Weaknesses:** Passive default action, doesn't utilize attack cooldown optimally

---

## 2. Aggressive Rushdown

**Difficulty:** ⭐⭐ Intermediate  
**Style:** Offensive and relentless  
**Description:** Constantly pressures the opponent with attacks and approaches. Only blocks when critically low on health.

```javascript
STRATEGY AggressiveRushdown {
  RULE "Perfect strike opportunity" {
    WHEN enemy.health < 40
     AND self.attackCooldown == 0
     AND distance < 3
    DO ATTACK
  }
  
  RULE "Attack when ready" {
    WHEN self.attackCooldown == 0
     AND distance < 4
    DO ATTACK
  }
  
  RULE "Emergency block" {
    WHEN self.health < 15
    DO BLOCK
  }
  
  RULE "Chase enemy" {
    WHEN distance > 3
    DO APPROACH
  }
  
  RULE "In face pressure" {
    WHEN distance < 2
    DO ATTACK
  }
  
  DEFAULT APPROACH
}
```

**How it works:**
1. **Rule 1:** Prioritize attacking weakened enemies when close and ready
2. **Rule 2:** Attack whenever cooldown is ready and in range
3. **Rule 3:** Only block as a last resort (< 15 health)
4. **Rule 4:** Always chase if enemy is far
5. **Rule 5:** Apply close-range pressure
6. **Default:** Keep approaching

**Strengths:** High pressure, forces opponent to defend  
**Weaknesses:** Low survivability, can be countered by defensive play

---

## 3. Defensive Turtle

**Difficulty:** ⭐⭐ Intermediate  
**Style:** Defensive and patient  
**Description:** Prioritizes survival with heavy blocking and retreating. Only attacks when safe.

```javascript
STRATEGY DefensiveTurtle {
  RULE "Block when threatened" {
    WHEN self.health < 50
     OR enemy.attackCooldown == 0
    DO BLOCK
  }
  
  RULE "Retreat when damaged" {
    WHEN self.health < 30
     AND distance < 5
    DO RETREAT
  }
  
  RULE "Safe counterattack" {
    WHEN enemy.health < 25
     AND self.attackCooldown == 0
     AND distance < 3
    DO ATTACK
  }
  
  RULE "Maintain distance" {
    WHEN distance < 3
     AND self.health < 70
    DO RETREAT
  }
  
  RULE "Careful approach" {
    WHEN distance > 7
     AND enemy.attackCooldown > 0
    DO APPROACH
  }
  
  DEFAULT BLOCK
}
```

**How it works:**
1. **Rule 1:** Block whenever hurt or enemy can attack (uses OR logic)
2. **Rule 2:** Retreat when damaged and enemy is close
3. **Rule 3:** Only attack when enemy is very weak and safe to do so
4. **Rule 4:** Keep distance when damaged
5. **Rule 5:** Approach only when enemy is on cooldown and far away
6. **Default:** Block by default

**Strengths:** High survivability, difficult to damage  
**Weaknesses:** Low damage output, may lose on time

---

## 4. Balanced Fighter

**Difficulty:** ⭐⭐⭐ Advanced  
**Style:** Adaptive mix of offense and defense  
**Description:** Balances attacking and defending based on the situation. The most well-rounded strategy.

```javascript
STRATEGY BalancedFighter {
  RULE "Aggressive finish" {
    WHEN enemy.health < 30
     AND self.attackCooldown == 0
     AND distance < 3
    DO ATTACK
  }
  
  RULE "Defensive block" {
    WHEN self.health < 40
     AND enemy.attackCooldown == 0
     AND distance < 4
    DO BLOCK
  }
  
  RULE "Kite when low" {
    WHEN self.health < 25
     AND distance < 4
    DO RETREAT
  }
  
  RULE "Optimal attack" {
    WHEN self.attackCooldown == 0
     AND distance < 3
     AND enemy.attackCooldown > 0
    DO ATTACK
  }
  
  RULE "Close distance" {
    WHEN distance > 5
    DO APPROACH
  }
  
  DEFAULT APPROACH
}
```

**How it works:**
1. **Rule 1:** Go for the kill when enemy is weak
2. **Rule 2:** Block when hurt and enemy threatens
3. **Rule 3:** Retreat when critically low
4. **Rule 4:** Attack when conditions are optimal (ready, close, enemy on cooldown)
5. **Rule 5:** Approach when far
6. **Default:** Stay aggressive with approach

**Strengths:** Well-rounded, adapts to situations  
**Weaknesses:** Can be outplayed by specialized strategies

---

## 5. Opportunistic Hunter

**Difficulty:** ⭐⭐⭐ Advanced  
**Style:** Punish mistakes and capitalize on openings  
**Description:** Waits for the perfect moment to strike, focusing on attacking when enemy is vulnerable.

```javascript
STRATEGY OpportunisticHunter {
  RULE "Punish enemy cooldown" {
    WHEN enemy.attackCooldown > 0
     AND self.attackCooldown == 0
     AND distance < 4
    DO ATTACK
  }
  
  RULE "Execute low health target" {
    WHEN enemy.health < 25
     AND distance < 5
    DO ATTACK
  }
  
  RULE "Counter enemy aggression" {
    WHEN enemy.attackCooldown == 0
     AND distance < 3
     AND self.health < 60
    DO BLOCK
  }
  
  RULE "Setup at mid range" {
    WHEN distance > 4
     AND distance < 7
    DO IDLE
  }
  
  RULE "Reposition close" {
    WHEN distance < 2
     AND self.attackCooldown > 0
    DO RETREAT
  }
  
  RULE "Reposition far" {
    WHEN distance > 6
    DO APPROACH
  }
  
  DEFAULT IDLE
}
```

**How it works:**
1. **Rule 1:** Attack when enemy can't fight back (on cooldown)
2. **Rule 2:** Finish off weak enemies aggressively
3. **Rule 3:** Block against enemy aggression when hurt
4. **Rule 4:** Wait at mid-range for opportunities (4-7 distance)
5. **Rule 5:** Back off when too close and on cooldown
6. **Rule 6:** Move in when too far
7. **Default:** Wait for openings

**Strengths:** Efficient damage, good at punishing  
**Weaknesses:** Passive, can be rushed down

---

## 6. Distance Controller

**Difficulty:** ⭐⭐⭐ Advanced  
**Style:** Control spacing and positioning  
**Description:** Maintains optimal distance for attacking while staying safe from enemy attacks.

```javascript
STRATEGY DistanceController {
  RULE "Attack at perfect range" {
    WHEN distance >= 2
     AND distance <= 3
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  RULE "Block when too close" {
    WHEN distance < 2
     AND enemy.attackCooldown == 0
    DO BLOCK
  }
  
  RULE "Retreat from close range" {
    WHEN distance < 2
     AND enemy.attackCooldown > 0
    DO RETREAT
  }
  
  RULE "Advance to optimal range" {
    WHEN distance > 3
     AND distance < 6
    DO APPROACH
  }
  
  RULE "Rush from far" {
    WHEN distance >= 6
    DO APPROACH
  }
  
  RULE "Emergency block" {
    WHEN self.health < 30
    DO BLOCK
  }
  
  DEFAULT APPROACH
}
```

**How it works:**
1. **Rule 1:** Attack only at the perfect range (2-3 distance)
2. **Rule 2:** Block if enemy gets too close and can attack
3. **Rule 3:** Create space when too close but safe
4. **Rule 4:** Move to optimal range when in mid-distance
5. **Rule 5:** Rush in from far away
6. **Rule 6:** Block when health is critical
7. **Default:** Keep moving forward

**Strengths:** Excellent positioning, hard to hit  
**Weaknesses:** Complex to execute, relies on precise distance

---

## 7. Counter Puncher

**Difficulty:** ⭐⭐⭐⭐ Expert  
**Style:** Defensive with explosive counterattacks  
**Description:** Focuses on defense and reading opponent, then striking hard when they're vulnerable.

```javascript
STRATEGY CounterPuncher {
  RULE "Exploit enemy cooldown" {
    WHEN enemy.attackCooldown >= 2
     AND self.attackCooldown == 0
     AND distance < 4
    DO ATTACK
  }
  
  RULE "Block enemy ready state" {
    WHEN enemy.attackCooldown == 0
     AND distance < 5
    DO BLOCK
  }
  
  RULE "Critical health defense" {
    WHEN self.health < 20
    DO BLOCK
  }
  
  RULE "Defensive block when hurt" {
    WHEN self.health < 40
     AND enemy.attackCooldown == 0
    DO BLOCK
  }
  
  RULE "Finish combo" {
    WHEN enemy.health < 20
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  RULE "Reset neutral" {
    WHEN distance < 2
     AND self.attackCooldown > 0
    DO RETREAT
  }
  
  RULE "Patient approach" {
    WHEN distance > 6
     AND enemy.attackCooldown > 0
    DO APPROACH
  }
  
  RULE "Hold position" {
    WHEN distance >= 4
     AND distance <= 6
    DO IDLE
  }
  
  DEFAULT BLOCK
}
```

**How it works:**
1. **Rule 1:** Strike when enemy is deep into cooldown (2+ turns)
2. **Rule 2:** Block whenever enemy is ready to attack
3. **Rule 3:** Multiple defensive conditions (uses OR for flexibility)
4. **Rule 4:** Finish off wounded enemies
5. **Rule 5:** Retreat to reset when stuck close on cooldown
6. **Rule 6:** Approach only when enemy can't punish
7. **Rule 7:** Hold ground at optimal range
8. **Default:** Block defensively

**Strengths:** Excellent defense, high IQ plays  
**Weaknesses:** Low aggression, can be too passive

---

## Tips for Creating Your Own Strategy

1. **Start with an example** - Copy one of these and modify it
2. **Test against different styles** - A good strategy works against multiple approaches
3. **Balance risk and reward** - Aggressive rules should have safety conditions
4. **Use clear rule names** - Future you will thank present you
5. **Consider rule order** - Most specific conditions should come first
6. **Don't overcomplicate** - 3-5 rules is often enough
7. **Iterate** - Watch your bot fight and adjust based on what you see

## Next Steps

Now that you've seen these examples:
1. Choose a style that matches your preference
2. Copy an example and modify it
3. Test it in the arena
4. Adjust based on performance
5. Share your strategy with others!

For more details on the language syntax, see [CASL_LANGUAGE.md](./CASL_LANGUAGE.md).

Good luck in the arena! 🥊
