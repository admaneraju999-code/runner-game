# RUNNER: ENDLESS DASH

## Game Design Document

---

# 1. GAME OVERVIEW

## Game Title
**Runner: Endless Dash**

## Genre
2D Side-Scrolling Infinite Runner

## Core Gameplay Loop
Run → Jump over obstacles → Collect coins → Dodge villain → Survive longer → Beat high score → Unlock levels → Repeat

## Target Audience
- Casual mobile/PC players
- Fans of Chrome Dino, Canabalt, Temple Run
- All ages
- Quick session players (2-10 minute runs)

## Art Style
- 600x400 canvas resolution
- Flat vector-style with gradients
- Bright sky-blue background
- Simple pixel-approximate aesthetic
- Color-coded obstacles (green cactus, orange spikes)
- Weather overlays (rain, snow, fog)
- Tunnel mode with dark underground palette

## Camera System
- Static camera, world scrolls left
- Player anchored at x=80
- Scrolling speed increases with score
- Parallax mountains (0.2x scroll speed)
- Clouds (0.3x scroll speed)

## Controls
| Action | Input |
|--------|-------|
| Jump | Space, Click/Tap, W, Up Arrow |
| Start/Restart | Space, Click, PLAY button |

## Difficulty Progression
| Score Range | Difficulty | Speed Bonus |
|------------|-----------|-------------|
| 0-100 | Easy | +0.0 |
| 100-200 | Medium | +0.3 |
| 200-300 | Hard | +0.6 |
| 300-500 | Harder | +0.9 |
| 500+ | Expert | +1.2+ |

---

# 2. LEVELS (3 Levels)

## Level 1: "The Meadow" (0-1200 score)
- **Theme:** Green fields, blue sky, scattered clouds
- **Environment:** Grass ground, cacti obstacles, spike traps
- **Weather:** Random (rain, snow, fog, clear)
- **Obstacles:** Small cacti, short spikes
- **Villain:** Appears at score 300+
- **Coins:** Gold coins with glow effect
- **Speed:** Base speed 4, increases by 0.3 per 100 score

## Level 2: "The Outback" (1200-2400 score)
- **Theme:** Drier landscape, harsher terrain
- **Environment:** Brown-tinted ground, more frequent obstacles
- **Obstacles:** Taller cacti, wider spike clusters
- **Villain:** Faster, appears more frequently
- **Coins:** Gold coins with higher spawn rate
- **Speed:** Higher base, faster scaling

## Level 3: "The Wasteland" (2400-3600 score)
- **Theme:** Barren wasteland
- **Environment:** Darker palette, intense pressure
- **Obstacles:** Maximum density and speed
- **Villain:** Aggressive pursuit
- **Coins:** Rare but high value
- **Tunnel Mode:** Activates periodically

## Win Condition
- Reach score 3600 (Level 3 max)
- "You Win! All Levels Complete!" message

---

# 3. PLAYER

## Appearance
- Rendered from sprite images in `/images of char/`
- 11 animation frames loaded from `17-removebg-preview.png` through `25-removebg-preview.png`
- Cropped from source at (83, 157, 198, 330)
- Displayed at 104x144 pixels in-game
- Fallback: Red rectangle if sprites fail to load

## Abilities
| Ability | Description |
|---------|-------------|
| Run | Auto-run, speed increases with score |
| Jump | Single jump, triggered by Space/Click |
| Invincibility | 60 frames after taking damage (blinking) |

## Health System: Lives
- **Starting Lives:** 5
- **Cheat Mode:** 99 lives
- **Damage:** -1 life per obstacle/villain collision
- **Invincibility Frames:** 60 (1 second) after hit
- **Death:** All lives lost → Game Over screen
- **No healing:** Lives are permanent per run

---

# 4. OBSTACLES

## Types
| Type | Appearance | Width | Height | Behavior |
|------|-----------|-------|--------|----------|
| **Cactus** | Green column with arms | 12-20px | 18-32px | Stationary, random size |
| **Spike** | Orange triangle | 14px | 10px | Stationary, ground-level |

## Spawn Rules
- Min spawn interval: 60-100 frames (decreases with score)
- Maximum 3 obstacles on screen at once
- 50% chance cactus, 50% chance spike
- Obstacles scroll left at current game speed
- Removed when off-screen left

---

# 5. VILLAIN

## "The Shadow Stalker"

| Property | Value |
|----------|-------|
| **Appearance** | Dark humanoid figure, red eyes (drawn procedurally) |
| **Size** | 34x50px |
| **First Spawn** | Score 300+ |
| **Cooldown** | 600-900 frames between appearances |
| **Speed** | Base 6, increases with score |
| **Direction** | Moves left (right-to-left), facing left (sprite flipped) |
| **Damage** | -1 life on contact |

**Animation:**
- Leg swing with sine wave (3px amplitude)
- Arm swing (5px amplitude)
- Red eye glow effect
- Dark aura (semi-transparent red rectangle)

## Behavior
1. Spawns at x = W + 30 (off-screen right)
2. Moves left at villain speed (faster than obstacles)
3. Chases player until it leaves screen left
4. Disappears, enters cooldown
5. Repeats

---

# 6. COINS

| Property | Value |
|----------|-------|
| **Appearance** | Gold circle with $ icon, glow effect |
| **Worth** | 5 score each |
| **Max on screen** | 5 (15 in cheat mode) |
| **Spawn interval** | 60-120 frames base |
| **Size** | 16x20px |
| **Height range** | Ground level up to 100px above |

**Visual:**
- Outer glow pulse (sin wave)
- Gold fill (#ffd700)
- Highlight crescent (#ffec8b)
- Dark $ symbol (#b8860b)

---

# 7. WEATHER SYSTEM

| Type | Effect | Particles | Duration |
|------|--------|-----------|----------|
| **None** | Clear sky | 0 | 500-900 frames |
| **Rain** | Blue diagonal lines | 60 lines | 500-900 frames |
| **Snow** | White falling circles | 40 flakes | 500-900 frames |
| **Fog** | Gray radial gradients | 12 patches | 500-900 frames |

## Rain
- Lines: 6+4 speed, 10-20px length
- Scrolls with world (0.3x speed)
- Respawns at top when reaching bottom

## Snow
- Flakes: 1-3 speed, 2-6px radius
- Horizontal drift
- Gentle fall effect

## Fog
- Patches: 30-70px radius, semi-transparent
- Slow scroll (0.3-0.8 speed)
- Appears in upper 200px of screen

---

# 8. TUNNEL MODE

## The Underground
- **Trigger:** Score % 600 < 10 (checks every 400 frames in cheat mode)
- **Duration:** 900 frames (15 seconds)
- **Appearance:** Dark underground with gradient background
- **Ground:** Brown/dark with vertical lines, small rocks
- **Ceiling:** Hanging stalactite-like formations (sine wave)
- **Wall rocks:** Elliptical rock formations along walls

## Visual Changes
- Sky becomes dark gradient (#1a0a00 → #3d2b1a)
- Ceiling appears (30px high with stalactites)
- Ground changes to brown/dark with rock details
- Wall rocks animate with scroll
- Grass disappears from ground

---

# 9. UI

## HUD Elements
| Element | Position | Content |
|---------|----------|---------|
| Username | Top-left | Player name + CHEAT badge |
| Score | Top-right | "Score: N" |
| High Score | Below score | "Best: N" (gold) |
| Speed Bar | Top-right | Speed indicator (yellow → red) |
| Level | Top-left below username | "Level N" |
| Lives | Below level | Red circles (hearts) |
| Overlay | Center | Level complete / congratulations messages |

## Start Screen
- Game title "RUNNER" in red
- Instructions
- Username input field
- PLAY button

## Game Over Screen
- "GAME OVER" heading
- Final score display
- PLAY AGAIN button
- 400ms cooldown before restart allowed

---

# 10. CHEAT SYSTEM

## Cheat Usernames
| Username | Effect |
|----------|--------|
| dev | 99 lives, fast coins, fast weather |
| admin | 99 lives, fast coins, fast weather |
| opencode | 99 lives, fast coins, fast weather |
| test | 99 lives, fast coins, fast weather |
| god | 99 lives, fast coins, fast weather |
| harsh | 99 lives, fast coins, fast weather |

## Cheat Effects
- 99 starting lives (instead of 5)
- Coin max: 15 (instead of 5)
- Coin spawn: every 15 frames (instead of 60-120)
- Weather changes: every 150-250 frames (instead of 500-900)
- Frequent tunnel mode (every 400 frames)
- "CHEAT" badge displayed next to username

---

# 11. SCORING

| Action | Points |
|--------|--------|
| Passing an obstacle | 10 |
| Collecting a coin | 5 |
| Surviving longer | Speed bonus increases obstacle pass rate |

## Leaderboard
- High score saved to `localStorage` as `runnerHighScore`
- Persistent between sessions
- Displayed on HUD and Game Over screen

---

# 12. TECHNICAL

## Engine
- **Custom engine:** Vanilla JavaScript on HTML5 Canvas
- **No dependencies:** Single HTML page + CSS + JS
- **Canvas size:** 600x400 pixels

## Performance
- `requestAnimationFrame` game loop
- Particle systems for weather (up to 60 particles)
- Efficient collision detection (AABB)
- Sprite preloading with Image objects

## Save System
- `localStorage` for high score
- `localStorage` for username and cheat status
- JSON serialized user data

## Browser Support
- Any modern browser with Canvas support
- No WebGL required

---

# 13. DELIVERABLES ✓

## Game Files
| File | Purpose |
|------|---------|
| `index.html` | Main page with canvas and UI |
| `style.css` | Full styling with dark theme |
| `game.js` | Complete game logic (832 lines) |
| `images of char/` (11 files) | Player sprite frames |

## Implemented Features
- [x] Auto-scrolling runner
- [x] Jump mechanics
- [x] Obstacle generation (cactus, spikes)
- [x] Collision detection
- [x] Scoring system
- [x] Lives system (5 lives)
- [x] Invincibility frames
- [x] High score (localStorage)
- [x] 3 levels with score thresholds
- [x] Level completion messages
- [x] Congratulations at 500
- [x] Villain chases player (score 300+)
- [x] Coin collection with glow
- [x] Weather system (rain, snow, fog)
- [x] Tunnel mode (underground)
- [x] Speed indicator bar
- [x] Username system
- [x] Cheat codes
- [x] Start screen
- [x] Game over screen
- [x] Parallax mountains
- [x] Animated clouds
- [x] Sprite animation (11 frames)
- [x] Score-based difficulty scaling
