const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const overlayMsg = document.getElementById('overlayMessage');
const usernameInput = document.getElementById('usernameInput');
const usernameDisplay = document.getElementById('usernameDisplay');
const worldDisplay = document.getElementById('worldDisplay');

const W = 600, H = 400;
const GROUND_Y = 340;
const GRAVITY = 0.62;
const JUMP_FORCE = -11.5;
const MAX_JUMP_TICKS = 14;
const WALK_ACCEL = 0.5;
const WALK_MAX = 4.0;
const SPRINT_MAX = 6.5;
const FRICTION = 0.82;
const SLOW_DURATION = 180;

let gameRunning = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('runnerHighScore')) || 0;
highScoreDisplay.textContent = 'Best: ' + highScore;
const menuHighScore = document.getElementById('menuHighScore');
const gameOverHighScore = document.getElementById('gameOverHighScore');
if (menuHighScore) menuHighScore.textContent = highScore;

const FRAME_FILES = [
  'images of char/17-removebg-preview.png',
  'images of char/18-removebg-preview.png',
  'images of char/19-removebg-preview.png',
  'images of char/20-removebg-preview.png',
  'images of char/21-removebg-preview.png',
  'images of char/22-removebg-preview.png',
  'images of char/23-removebg-preview.png',
  'images of char/24-removebg-preview.png',
  'images of char/25-removebg-preview.png',
  'images of char/25-removebg-preview (1).png',
];
const playerFrames = [];
for (const f of FRAME_FILES) {
  const img = new Image();
  img.src = f;
  playerFrames.push(img);
}
const VILLAIN_FRAMES = ['villan 1 images/2-removebg-preview.png', 'villan 1 images/3-removebg-preview.png', 'villan 1 images/4-removebg-preview.png', 'villan 1 images/5-removebg-preview.png'];
const villainFrames = [];
for (const f of VILLAIN_FRAMES) {
  const img = new Image();
  img.src = f;
  villainFrames.push(img);
}
const VILLAIN2_FRAMES = ['villian 2 images/6-removebg-preview.png', 'villian 2 images/8-removebg-preview.png', 'villian 2 images/9-removebg-preview.png', 'villian 2 images/10-removebg-preview.png'];
const villain2Frames = [];
for (const f of VILLAIN2_FRAMES) {
  const img = new Image();
  img.src = f;
  villain2Frames.push(img);
}
const CROP_X = 83, CROP_Y = 157, CROP_W = 198, CROP_H = 330;
let username = '';
let cheatMode = false;
const CHEAT_USERNAMES = ['dev', 'admin', 'opencode', 'test', 'god', 'harsh'];

// --- Animation Config (user will provide mapping later) ---
const ANIM = {
  idle:  { frames: [0], speed: 0 },
  walk:  { frames: [0, 1, 2, 3], speed: 8 },
  run:   { frames: [4, 5, 6], speed: 5 },
  jump:  { frames: [7], speed: 0 },
  fall:  { frames: [8], speed: 0 },
  crouch: { frames: [0], speed: 0 },
  attack: { frames: [9], speed: 3 },
  hurt:  { frames: [0], speed: 0 },
};

const WORLDS = [
  {
    id: 0, name: 'Verdant Canopy', subtitle: 'The Awakening',
    sky1: '#2d5a27', sky2: '#6aab5e', ground1: '#5a3d2b', ground2: '#3d2b1a',
    grassColor: '#4a8c3f', accentColor: '#8BC34A', groundLine: '#7a5d3b',
    mountainColor: '#5a7a4a', mountainHighlight: '#4a6a3a',
    enemyColor1: '#8d6e63', enemyColor2: '#a1887f', enemyColor3: '#6d4c41',
    enemyType: 'sporeling',
    bgElements: 'trees', textColor: '#a8e6a3',
    musicHint: 'Gentle forest flutes',
    intro: 'The forest hums with ancient energy...',
    dialogue: "Alright... village is counting on me. First time leaving home, already talking to myself. Off to a great start.",
  },
  {
    id: 1, name: 'Frostveil Peaks', subtitle: 'The Ascent',
    sky1: '#1a1a3e', sky2: '#4a6fa5', ground1: '#d4e4f0', ground2: '#a8c8e0',
    grassColor: '#e8f4f8', accentColor: '#B0E0E6', groundLine: '#c0d8e8',
    mountainColor: '#8aa8c8', mountainHighlight: '#6a88a8',
    enemyColor1: '#b0d0e8', enemyColor2: '#90b8d8', enemyColor3: '#c8e0f0',
    enemyType: 'icicle',
    bgElements: 'aurora', textColor: '#b0d8ff',
    musicHint: 'Icy wind chimes',
    intro: 'The peaks whisper of forgotten storms...',
    dialogue: "Whoa... it's freezing all of a sudden. Snow. Great. I packed for a forest, not a mountain. Should've brought a scarf.",
  },
  {
    id: 2, name: 'Caldera Abyss', subtitle: 'The Trial',
    sky1: '#1a0a00', sky2: '#5a2000', ground1: '#3d1a0a', ground2: '#2a0a00',
    grassColor: '#ff4400', accentColor: '#FF6B35', groundLine: '#5a2a0a',
    mountainColor: '#4a1a00', mountainHighlight: '#3a1000',
    enemyColor1: '#ff6b35', enemyColor2: '#e85d26', enemyColor3: '#cc4a1a',
    enemyType: 'ember',
    bgElements: 'ash', textColor: '#ff8c42',
    musicHint: 'Great war drums',
    intro: 'The mountain breathes fire...',
    dialogue: "The ground is shaking... is that a volcano? Of course it is. Why wouldn't it be a volcano. Just another Tuesday.",
  },
  {
    id: 3, name: 'Void Threshold', subtitle: 'The Reckoning',
    sky1: '#0a001a', sky2: '#1a0a3e', ground1: '#1a0a2e', ground2: '#0a0015',
    grassColor: '#4a0080', accentColor: '#9C27B0', groundLine: '#2a0040',
    mountainColor: '#1a0030', mountainHighlight: '#2a0050',
    enemyColor1: '#7c4dff', enemyColor2: '#651fff', enemyColor3: '#b388ff',
    enemyType: 'void',
    bgElements: 'stars', textColor: '#b388ff',
    musicHint: 'Ethereal void drones',
    intro: 'The void stirs...',
    dialogue: "...This place feels wrong. Like the world forgot how to exist here. Keep moving, HARSH. Don't look down. Definitely don't look down.",
  },
];

const POWERUP_TYPES = [
  {
    id: 'wind', name: 'Wind Boots', color: '#4FC3F7', icon: 'W',
    desc: 'Floaty jump', duration: 300,
    effect: null, onCollect: () => showFloatingText('Wind Boots!', '#4FC3F7'),
  },
  {
    id: 'fire', name: 'Fire Orb', color: '#FF5722', icon: 'F',
    desc: 'Destroy obstacles', duration: 480,
    effect: null, onCollect: () => showFloatingText('Fire Orb!', '#FF5722'),
  },
  {
    id: 'shadow', name: 'Shadow Cloak', color: '#7C4DFF', icon: 'S',
    desc: 'Phase through', duration: 360,
    effect: null, onCollect: () => showFloatingText('Shadow Cloak!', '#7C4DFF'),
  },
  {
    id: 'time', name: 'Time Crystal', color: '#00BCD4', icon: 'T',
    desc: 'Slow time', duration: 420,
    effect: null, onCollect: () => showFloatingText('Time Crystal!', '#00BCD4'),
  },
];

const ENEMY_TYPES = {
  sporeling: {
    w: [14, 22], h: [18, 28],
    draw: (x, y, w, h, colors) => {
      ctx.fillStyle = colors[0]; ctx.fillRect(x, y + h * 0.25, w, h * 0.75);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + 2, y + 2, w - 4, h * 0.3);
      ctx.fillStyle = colors[2]; ctx.fillRect(x + 4, y + 4, 3, 3); ctx.fillRect(x + w - 7, y + 4, 3, 3);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 5, y + 5, 2, 2); ctx.fillRect(x + w - 6, y + 5, 2, 2);
    },
  },
  thornback: {
    w: [20, 30], h: [14, 20],
    draw: (x, y, w, h, colors) => {
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.fillStyle = colors[1];
      ctx.fillRect(x, y + h * 0.3, w, 3); ctx.fillRect(x + w * 0.3, y, 3, h);
      ctx.fillRect(x + w * 0.6, y, 3, h); ctx.fillRect(x + w * 0.15, y + h * 0.5, 3, h * 0.5);
      ctx.fillRect(x + w * 0.75, y + h * 0.5, 3, h * 0.5);
      ctx.fillStyle = colors[2]; ctx.fillRect(x + w / 2 - 2, y + h / 2 - 2, 4, 4);
    },
  },
  icicle: {
    w: [10, 16], h: [24, 40],
    draw: (x, y, w, h, colors) => {
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 2, y, w - 4, h);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + 4, y + 2, w - 8, h - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x + w / 2 - 1, y + 4, 2, h * 0.6);
    },
  },
  frostHound: {
    w: [24, 32], h: [16, 22],
    draw: (x, y, w, h, colors) => {
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 4, y + h * 0.3, w - 8, h * 0.6);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + 6, y + 2, w - 12, h * 0.35);
      ctx.fillStyle = '#ff4444'; ctx.fillRect(x + 8, y + 4, 3, 3); ctx.fillRect(x + w - 11, y + 4, 3, 3);
      ctx.fillStyle = colors[2];
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 5, y + h * 0.7, 3, h * 0.3);
    },
  },
  ember: {
    w: [12, 18], h: [16, 24],
    draw: (x, y, w, h, colors) => {
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 2, y + h * 0.3, w - 4, h * 0.6);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + 3, y + 2, w - 6, h * 0.35);
      ctx.fillStyle = colors[2]; ctx.fillRect(x + w / 2 - 2, y + 4, 4, 4);
    },
  },
  voidSpawn: {
    w: [16, 24], h: [20, 28],
    draw: (x, y, w, h, colors) => {
      const pulse = (frameCount & 4) >> 1;
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 2, y + 4 + pulse, w - 4, h - 8);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + 4, y + 2 + pulse, w - 8, h * 0.35);
      ctx.fillStyle = colors[2]; ctx.fillRect(x + 5, y + 4 + pulse, 3, 3); ctx.fillRect(x + w - 8, y + 4 + pulse, 3, 3);
      ctx.fillStyle = 'rgba(180,100,255,0.15)'; ctx.fillRect(x - 2, y - 2 + pulse, w + 4, h + 4);
    },
  },
  voidRift: {
    w: [20, 30], h: [14, 20],
    draw: (x, y, w, h, colors) => {
      const pulse = (frameCount & 6) >> 1;
      ctx.fillStyle = 'rgba(100,0,200,0.15)';
      ctx.fillRect(x - 2, y - 2 + pulse, w + 4, h + 4);
      ctx.fillStyle = colors[0]; ctx.fillRect(x + 4, y + 2 + pulse, w - 8, h - 4);
      ctx.fillStyle = colors[1]; ctx.fillRect(x + w / 2 - 3, y + 4 + pulse, 6, h - 8);
    },
  },
};

const WORLDS_ENEMIES = [
  [{ type: 'sporeling', weight: 70 }, { type: 'thornback', weight: 30 }],
  [{ type: 'icicle', weight: 60 }, { type: 'frostHound', weight: 40 }],
  [{ type: 'ember', weight: 70 }, { type: 'sporeling', weight: 15 }, { type: 'thornback', weight: 15 }],
  [{ type: 'voidSpawn', weight: 60 }, { type: 'voidRift', weight: 40 }],
];

// --- Game State ---
const player = {
  x: 80, y: 0, w: 90, h: 130,
  vx: 0, vy: 0,
  onGround: false,
  facingRight: true,
  animState: 'idle',
  animFrame: 0,
  animTimer: 0,
  sprinting: false,
  crouching: false,
  attacking: false,
  attackTimer: 0,
  hurtTimer: 0,
  jumpHeld: false,
  jumpTicks: 0,
  climbable: null,
  climbing: false,
  specialCooldown: 0,
  slowTimer: 0,
};
player.y = GROUND_Y - player.h;

let camera = { x: 0 };
let maxPlayerX = 0;
let frameCount = 0;
let worldIndex = 0;
let worldTransition = 0;
let prevWorld = 0;
let speedMult = 1;
let groundOffset = 0;

let platforms = [];
let levelEnemies = [];
let levelCoins = [];
let levelPowerUps = [];
let levelVines = [];
let levelDoors = [];
let nextGenX = 0;

let villains = [];
let villainCooldown = 0;
let villainTransitionTimer = 0;

let weatherType = 'none';
let weatherParticles = [];
let weatherTimer = 200;

let activePowerUp = null;
let powerUpTimer = 0;

let particles = [];
let screenshake = { x: 0, y: 0, intensity: 0 };
let floatingTexts = [];

let lives = 5;
let invincible = 0;
let comboCount = 0;
let comboTimer = 0;
let maxCombo = 0;

let storyText = '';
let storyTimer = 0;
let gameOverAt = 0;
let dialogueActive = false;
let dialogueText = '';
let dialogueTimer = 0;
let gamePaused = false;
let pauseTimer = 0;

let paused = false;

// --- Input State ---
const keys = {};

// --- Level Generation ---
function getWorldForScore(s) {
  if (s >= 1800) return 3;
  if (s >= 900) return 2;
  if (s >= 300) return 1;
  return 0;
}

function getWorld() { return WORLDS[worldIndex]; }

function getEnemyTypeForWorld(wIndex) {
  const pool = WORLDS_ENEMIES[wIndex] || WORLDS_ENEMIES[0];
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.weight; if (r <= 0) return e.type; }
  return pool[0].type;
}

function generateLevel() {
  const CHUNK_W = 600;
  while (nextGenX < maxPlayerX + W * 3) {
    const cx = nextGenX;
    const wIdx = getWorldForScore(Math.floor(cx / 8));
    const diff = Math.floor(cx / 800);

    const hasGap = diff > 0 && Math.random() < Math.min(0.15 + diff * 0.02, 0.4);
    let gapX = 0, gapW = 0;
    if (hasGap) {
      gapX = cx + 200 + Math.random() * 200;
      gapW = 60 + Math.random() * 80 + Math.min(diff * 5, 60);
    }

    const prevGroundEnd = cx;
    if (!hasGap) {
      platforms.push({ x: cx, y: GROUND_Y, w: CHUNK_W, h: H - GROUND_Y, solid: true });
    } else {
      if (gapX - cx > 40) {
        platforms.push({ x: cx, y: GROUND_Y, w: gapX - cx, h: H - GROUND_Y, solid: true });
      }
      for (let i = 0; i < 3; i++) {
        const py = GROUND_Y - 50 - Math.random() * 80;
        const pw = 60 + Math.random() * 100;
        platforms.push({ x: gapX + gapW * (i / 3) - pw / 2 + gapW / 6, y: py, w: pw, h: 12, solid: true });
      }
      const endX = gapX + gapW;
      const remaining = cx + CHUNK_W - endX;
      if (remaining > 40) {
        platforms.push({ x: endX, y: GROUND_Y, w: remaining, h: H - GROUND_Y, solid: true });
      }
    }

    if (Math.random() < 0.3 && diff > 1) {
      const vx = cx + 100 + Math.random() * 300;
      platforms.push({ x: vx, y: GROUND_Y - 200, w: 80, h: 12, solid: true, climbable: true });
      levelVines.push({ x: vx + 35, y: GROUND_Y - 200, w: 10, h: 200 });
    }

    if (Math.random() < 0.05 && diff > 2) {
      const dx = cx + 100 + Math.random() * 300;
      levelDoors.push({ x: dx, y: GROUND_Y - 50, w: 30, h: 50, activated: false });
    }

    const enemyCount = 1 + Math.floor(Math.random() * Math.min(diff + 1, 3));
    for (let i = 0; i < enemyCount; i++) {
      const ex = cx + 50 + Math.random() * (CHUNK_W - 100);
      const eType = getEnemyTypeForWorld(wIdx);
      const def = ENEMY_TYPES[eType];
      const ew = def.w[0] + Math.random() * (def.w[1] - def.w[0]);
      const eh = def.h[0] + Math.random() * (def.h[1] - def.h[0]);
      const eY = findGroundY(ex) - eh;
      if (eY < GROUND_Y && eY > GROUND_Y - 200) {
        levelEnemies.push({ x: ex, y: eY, w: ew, h: eh, type: eType, hp: 1, patrolDir: Math.random() < 0.5 ? -1 : 1, patrolRange: 40 + Math.random() * 60, originX: ex, vx: 0 });
      }
    }

    const coinCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < coinCount; i++) {
      const cx2 = cx + 30 + Math.random() * (CHUNK_W - 60);
      const cy = findGroundY(cx2) - 40 - Math.random() * 60;
      if (cy > 20 && cy < GROUND_Y - 10) {
        levelCoins.push({ x: cx2, y: cy, w: 14, h: 14, collected: false, bob: Math.random() * Math.PI * 2 });
      }
    }

    if (Math.random() < 0.08) {
      const px2 = cx + 100 + Math.random() * 400;
      const puType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      if (!activePowerUp || activePowerUp.id !== puType.id) {
        levelPowerUps.push({ x: px2, y: findGroundY(px2) - 50, w: 24, h: 24, type: puType, bob: Math.random() * Math.PI * 2, collected: false });
      }
    }

    nextGenX += CHUNK_W;
  }

  platforms = platforms.filter(p => p.x + p.w > camera.x - 200 && p.x < nextGenX + 200);
  levelEnemies = levelEnemies.filter(e => e.x + e.w > camera.x - 300 && e.x < nextGenX + 200);
  levelCoins = levelCoins.filter(c => c.x + c.w > camera.x - 200 && c.x < nextGenX + 200);
  levelPowerUps = levelPowerUps.filter(p => p.x + p.w > camera.x - 200 && p.x < nextGenX + 200);
  levelVines = levelVines.filter(v => v.x + v.w > camera.x - 200 && v.x < nextGenX + 200);
  levelDoors = levelDoors.filter(d => d.x + d.w > camera.x - 200 && d.x < nextGenX + 200);
}

function findGroundY(x) {
  let gy = -1;
  for (const p of platforms) {
    if (p.solid && p.h > 20 && x >= p.x && x < p.x + p.w) {
      if (gy === -1 || p.y < gy) gy = p.y;
    }
  }
  return gy >= 0 ? gy : GROUND_Y;
}

function findPlatformBelow(x, y) {
  let best = null;
  for (const p of platforms) {
    if (p.solid && x + player.w > p.x && x < p.x + p.w && p.y >= y && p.y <= y + 20) {
      if (!best || p.y < best.y) best = p;
    }
  }
  return best;
}

function isTouchingCeiling(px, py) {
  for (const p of platforms) {
    if (p.solid && py <= p.y + p.h && py > p.y &&
        px + player.w > p.x && px < p.x + p.w) {
      return true;
    }
  }
  return false;
}

// --- Player Physics ---
function updatePlayer() {
  const p = player;

  if (p.hurtTimer > 0) { p.hurtTimer--; return; }

  const moveLeft = keys['KeyA'] || keys['ArrowLeft'];
  const moveRight = keys['KeyD'] || keys['ArrowRight'];
  const sprint = keys['ShiftLeft'] || keys['ShiftRight'];
  const jumpHold = keys['Space'];
  const crouch = keys['KeyS'] || keys['ArrowDown'];
  const climb = keys['KeyW'] || keys['ArrowUp'];

  p.sprinting = sprint && (moveLeft || moveRight);
  p.crouching = crouch && p.onGround && !p.attacking;

  if (p.climbing) {
    p.vy = 0;
    p.vx *= 0.8;
    if (climb) p.y -= 2.5;
    if (crouch) p.y += 2.5;
    if (!p.climbable || p.y + p.h < p.climbable.y || p.y > p.climbable.y + p.climbable.h) {
      p.climbing = false;
      p.climbable = null;
    }
    if (jumpHold) { p.climbing = false; p.climbable = null; p.vy = JUMP_FORCE * 0.8; }
    return;
  }

  if (p.attacking) {
    p.attackTimer--;
    if (p.attackTimer <= 0) p.attacking = false;
  }

  const slowMul = p.slowTimer > 0 ? 0.5 : 1;
  if (crouch && p.onGround && !p.attacking) {
    p.vx *= 0.85;
    p.animState = 'crouch';
  } else if (moveLeft && !moveRight) {
    p.facingRight = false;
    const target = (p.sprinting ? -SPRINT_MAX : -WALK_MAX) * slowMul;
    p.vx = Math.max(p.vx - WALK_ACCEL * slowMul, target);
  } else if (moveRight && !moveLeft) {
    p.facingRight = true;
    const target = (p.sprinting ? SPRINT_MAX : WALK_MAX) * slowMul;
    p.vx = Math.min(p.vx + WALK_ACCEL * slowMul, target);
  } else {
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
  }

  if (p.specialCooldown > 0) p.specialCooldown--;

  if (jumpHold && p.onGround && !p.crouching) {
    p.vy = JUMP_FORCE;
    p.onGround = false;
    p.jumpTicks = 0;
    spawnJumpParticles();
  }

  if (!p.onGround) {
    if (jumpHold && p.vy < 0 && p.jumpTicks < MAX_JUMP_TICKS) {
      p.vy += GRAVITY * 0.5;
      p.jumpTicks++;
    } else {
      p.vy += GRAVITY * (p.vy > 0 ? 1.15 : 1.0);
    }
  }

  p.y += p.vy;
  p.x += p.vx;

  if (p.x < 0) { p.x = 0; p.vx = 0; }

  let landed = false;
  const prevBottom = p.y + p.h - p.vy;
  for (const pl of platforms) {
    if (!pl.solid) continue;
    if (p.vy >= 0 && prevBottom <= pl.y && p.y + p.h >= pl.y &&
        p.x + p.w > pl.x + 2 && p.x < pl.x + pl.w - 2) {
      p.y = pl.y - p.h; p.vy = 0;
      if (!p.onGround) spawnLandParticles();
      p.onGround = true; p.jumpTicks = 0;
      landed = true; break;
    }
  }

  if (landed) {
    p.onGround = true;
    p.jumpTicks = 0;
  } else if (p.y + p.h > GROUND_Y + 300) {
    takeDamage();
    if (gameRunning) {
      p.x = Math.max(0, camera.x + 60);
      const gy = findGroundY(p.x);
      p.y = (gy >= 0 && gy < GROUND_Y) ? gy - p.h : GROUND_Y - p.h;
      p.vy = 0; p.vx = 0;
      p.onGround = true;
    }
  } else {
    p.onGround = false;
  }

  if (p.vy < 0 && isTouchingCeiling(p.x, p.y)) {
    p.vy = 0;
    for (const pl of platforms) {
      if (pl.solid && p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y <= pl.y + pl.h && p.y > pl.y - 10) {
        p.y = pl.y + pl.h;
      }
    }
  }

  if (p.vx > 0 && p.x > maxPlayerX) maxPlayerX = p.x;

  if (p.attacking) {
    p.animState = 'attack';
  } else if (!p.onGround) {
    p.animState = p.vy < 0 ? 'jump' : 'fall';
  } else if (p.crouching) {
    p.animState = 'crouch';
  } else if (Math.abs(p.vx) > 3.5) {
    p.animState = 'run';
  } else if (Math.abs(p.vx) > 0.5) {
    p.animState = 'walk';
  } else {
    p.animState = 'idle';
  }

  for (const v of levelVines) {
    if (p.x + p.w > v.x && p.x < v.x + v.w && p.y + p.h > v.y && p.y < v.y + v.h) {
      p.climbable = v;
      if (keys['KeyW'] || keys['ArrowUp']) p.climbing = true;
      break;
    }
  }

  // Enemy collision
  for (let i = levelEnemies.length - 1; i >= 0; i--) {
    const e = levelEnemies[i];
    if (p.x + p.w > e.x && p.x < e.x + e.w && p.y + p.h > e.y && p.y < e.y + e.h) {
      if (invincible > 0) continue;
      if (activePowerUp && activePowerUp.id === 'shadow') continue;
      if (activePowerUp && activePowerUp.id === 'fire') {
        levelEnemies.splice(i, 1); score += 5;
        spawnHitParticles(e.x + e.w / 2, e.y + e.h / 2); continue;
      }
      if (p.vy > 0 && p.y + p.h - e.y < 20) {
        levelEnemies.splice(i, 1);
        p.vy = JUMP_FORCE * 0.6;
        comboCount++; comboTimer = 120;
        if (comboCount > maxCombo) maxCombo = comboCount;
        score += 10 * (1 + comboCount * 0.1);
        spawnHitParticles(e.x + e.w / 2, e.y + e.h / 2);
        showFloatingText('+' + Math.floor(10 * (1 + comboCount * 0.1)), '#ffd700');
        shake(3);
      } else {
        takeDamage();
      }
    }
  }

  // Attack hitbox
  if (p.attacking && p.attackTimer > 10) {
    const ax = p.facingRight ? p.x + p.w : p.x - 30;
    const ay = p.y;
    const aw = 30, ah = p.h;
    for (let i = levelEnemies.length - 1; i >= 0; i--) {
      const e = levelEnemies[i];
      if (ax + aw > e.x && ax < e.x + e.w && ay + ah > e.y && ay < e.y + e.h) {
        levelEnemies.splice(i, 1);
        score += 15;
        spawnHitParticles(e.x + e.w / 2, e.y + e.h / 2);
        showFloatingText('+15', '#ff5722');
        shake(2);
      }
    }
  }

  // Coin collection
  for (let i = levelCoins.length - 1; i >= 0; i--) {
    const c = levelCoins[i];
    if (p.x + p.w > c.x && p.x < c.x + c.w && p.y + p.h > c.y && p.y < c.y + c.h) {
      levelCoins.splice(i, 1);
      score += 5;
      comboCount++; comboTimer = 120;
      if (comboCount > maxCombo) maxCombo = comboCount;
      spawnCoinParticles(c.x + c.w / 2, c.y + c.h / 2);
    }
  }

  // Power-up collection
  for (let i = levelPowerUps.length - 1; i >= 0; i--) {
    const pu = levelPowerUps[i];
    if (p.x + p.w > pu.x && p.x < pu.x + pu.w && p.y + p.h > pu.y && p.y < pu.y + pu.h) {
      activePowerUp = pu.type;
      powerUpTimer = pu.type.duration;
      spawnPowerUpParticles(pu.x, pu.y, pu.type.color);
      pu.type.onCollect();
      levelPowerUps.splice(i, 1);
    }
  }

  if (activePowerUp) {
    powerUpTimer--;
    if (activePowerUp.id === 'wind' && !p.onGround && p.vy > 0) p.vy = Math.min(p.vy, 2);
    if (powerUpTimer <= 0) activePowerUp = null;
  }
}

function takeDamage() {
  if (invincible > 0) return;
  if (activePowerUp && activePowerUp.id === 'shadow') return;
  lives--;
  comboCount = 0;
  shake(6);
  spawnHitParticles(player.x + player.w / 2, player.y + player.h / 2);
  player.hurtTimer = 20;
  if (lives <= 0) { gameOver(); return; }
  invincible = 60;
}

// --- Enemy AI ---
function updateEnemies() {
  for (const e of levelEnemies) {
    const dx = e.x - player.x;
    if (Math.abs(dx) < W + 100) {
      if (e.type === 'frostHound' || e.type === 'voidSpawn') {
        const dir = player.x > e.x ? 1 : -1;
        e.vx += dir * 0.1;
        e.vx = Math.max(-1.5, Math.min(1.5, e.vx));
      } else {
        e.x += e.patrolDir * 0.5;
        if (Math.abs(e.x - e.originX) > e.patrolRange) e.patrolDir *= -1;
        e.vx = 0;
      }
    }
    e.x += e.vx || 0;
  }
}

// --- Villain ---
function updateVillain() {
  const MAX_VILLAINS = 2;

  if (villainTransitionTimer > 0) {
    villainTransitionTimer--;
    if (villainTransitionTimer === 0 && score >= 800) {
      const vw = 90, vh = 135;
      villains.push({
        x: camera.x + W + 50, y: GROUND_Y - 135,
        w: vw, h: vh, frame: 0, lifetime: 480,
        type: 'front',
      });
      villainCooldown = 180;
    }
  }

  if (score >= 800 && villains.length < MAX_VILLAINS && villainCooldown === 0) {
    const isFront = villains.length % 2 === 1;
    const vw = isFront ? 90 : 120;
    const vh = isFront ? 135 : 180;
    villains.push({
      x: isFront ? camera.x + W + 50 : camera.x - 80 - villains.length * 100,
      y: GROUND_Y - (isFront ? 135 : 180),
      w: vw, h: vh, frame: 0, lifetime: 480,
      type: isFront ? 'front' : 'back',
    });
    villainCooldown = 180;
  }
  if (villainCooldown > 0) villainCooldown--;
  if (villains.length === 0) return;

  for (let i = villains.length - 1; i >= 0; i--) {
    const v = villains[i];
    v.lifetime--;
    if (v.lifetime <= 0) {
      villains.splice(i, 1);
      villainCooldown = 250;
      continue;
    }
    const targetX = v.type === 'front' ? player.x + 200 : player.x - 120 - i * 80;
    v.x += (targetX - v.x) * 0.02 + (v.type === 'front' ? -0.5 : 0.5);
    v.frame += 0.15;

    if (player.x + player.w > v.x && player.x < v.x + v.w &&
        player.y + player.h > v.y && player.y < v.y + v.h) {
      if (v.type === 'front' && !player.onGround) {
        continue;
      }
      if (v.type === 'front') {
        player.slowTimer = SLOW_DURATION;
        spawnPowerUpParticles(v.x + v.w / 2, v.y + v.h / 2, '#4FC3F7');
        villains.splice(i, 1);
        villainCooldown = 150;
        continue;
      }
      if (activePowerUp && activePowerUp.id === 'shadow') {
        v.x -= 200;
        spawnPowerUpParticles(v.x + v.w / 2, v.y + v.h / 2, '#7C4DFF');
        villains.splice(i, 1);
        villainCooldown = 150;
        continue;
      }
      takeDamage();
      villainCooldown = 250;
      villains.splice(i, 1);
      continue;
    }

    if (v.x + v.w < camera.x - 200) {
      villains.splice(i, 1);
      villainCooldown = 500 + Math.floor(Math.random() * 300) - worldIndex * 50;
      if (villainCooldown < 250) villainCooldown = 250;
    }
  }
}

// --- Particles ---
function spawnJumpParticles() {
  const cx = camera.x;
  for (let i = 0; i < 6; i++) {
    particles.push({
      x: player.x + player.w / 2 + (Math.random() - 0.5) * 20 - cx,
      y: player.y + player.h,
      vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2 - 1,
      life: 20 + Math.random() * 15, maxLife: 35,
      color: getWorld().groundLine, size: 2 + Math.random() * 3,
    });
  }
}

function spawnLandParticles() {
  const cx = camera.x;
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x + player.w / 2 + (Math.random() - 0.5) * 30 - cx,
      y: player.y + player.h - 4,
      vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 1.5,
      life: 15 + Math.random() * 10, maxLife: 25,
      color: getWorld().groundLine, size: 2 + Math.random() * 4,
    });
  }
}

function spawnHitParticles(x, y) {
  const cx = camera.x;
  for (let i = 0; i < 12; i++) {
    particles.push({ x: x - cx, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 20 + Math.random() * 15, maxLife: 35, color: '#ff4444', size: 2 + Math.random() * 3 });
  }
}

function spawnCoinParticles(x, y) {
  const cx = camera.x;
  for (let i = 0; i < 5; i++) {
    particles.push({ x: x - cx, y, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1, life: 15 + Math.random() * 10, maxLife: 25, color: '#ffd700', size: 2 + Math.random() * 2 });
  }
}

function spawnPowerUpParticles(x, y, color) {
  const cx = camera.x;
  for (let i = 0; i < 15; i++) {
    particles.push({ x: x - cx, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 25 + Math.random() * 15, maxLife: 40, color, size: 2 + Math.random() * 4 });
  }
}

function showFloatingText(text, color) {
  floatingTexts.push({ text, color, x: player.x + player.w / 2 - camera.x, y: player.y - 20, vy: -2, life: 60, maxLife: 60 });
}

function shake(intensity) {
  screenshake.intensity = Math.max(screenshake.intensity, intensity);
}

// --- Update Functions ---
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i]; ft.y += ft.vy; ft.vy *= 0.97; ft.life--;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function updateScreenshake() {
  if (screenshake.intensity > 0) {
    screenshake.x = (Math.random() - 0.5) * screenshake.intensity * 2;
    screenshake.y = (Math.random() - 0.5) * screenshake.intensity * 2;
    screenshake.intensity *= 0.9;
    if (screenshake.intensity < 0.5) { screenshake.intensity = 0; screenshake.x = 0; screenshake.y = 0; }
  }
}

function updateWeather() {
  weatherTimer--;
  if (weatherTimer <= 0) {
    const types = ['none', 'rain', 'snow', 'fog'];
    let next;
    do { next = types[Math.floor(Math.random() * types.length)]; } while (next === weatherType);
    weatherType = next;
    weatherParticles = [];
    weatherTimer = 400 + Math.random() * 300;
    if (weatherType === 'rain') {
      for (let i = 0; i < 25; i++) weatherParticles.push({ x: Math.random() * W, y: Math.random() * H, speed: 5 + Math.random() * 4, len: 8 + Math.random() * 8 });
    } else if (weatherType === 'snow') {
      for (let i = 0; i < 25; i++) weatherParticles.push({ x: Math.random() * W, y: Math.random() * H, speed: 0.8 + Math.random() * 1.5, r: 1.5 + Math.random() * 3.5, drift: (Math.random() - 0.5) * 0.8 });
    } else if (weatherType === 'fog') {
      for (let i = 0; i < 8; i++) weatherParticles.push({ x: Math.random() * W, y: Math.random() * 150, speed: 0.3 + Math.random() * 0.4, r: 40 + Math.random() * 50 });
    }
  }
  const wSpeed = 2;
  for (const p of weatherParticles) {
    if (weatherType === 'rain') { p.x -= wSpeed * 0.2; p.y += p.speed; if (p.y > H) { p.y = -p.len; p.x = Math.random() * W; } }
    else if (weatherType === 'snow') { p.x += p.drift - wSpeed * 0.1; p.y += p.speed; if (p.y > H) { p.y = -p.r; p.x = Math.random() * W; } }
    else if (weatherType === 'fog') { p.x -= p.speed + wSpeed * 0.05; if (p.x + p.r < 0) { p.x = W + p.r; p.y = Math.random() * 150; } }
  }
  if (worldIndex === 3) { weatherType = 'none'; weatherParticles = []; }
}

// --- Camera ---
function updateCamera() {
  const targetX = player.x - W * 0.3;
  const maxCamX = Math.max(0, maxPlayerX - W * 0.5);
  camera.x += (targetX - camera.x) * 0.08;
  camera.x = Math.max(0, Math.min(camera.x, maxCamX));
}

// --- Animation ---
function updateAnimation() {
  const p = player;
  const anim = ANIM[p.animState] || ANIM.idle;
  if (anim.speed > 0) {
    p.animTimer++;
    if (p.animTimer >= anim.speed) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % anim.frames.length;
    }
  } else {
    p.animFrame = 0;
  }
}

// --- Main Update ---
function update() {
  if (!gameRunning || paused) return;
  frameCount++;

  if (gamePaused) {
    if (!dialogueActive) {
      pauseTimer--;
      if (pauseTimer <= 0) gamePaused = false;
    } else {
      dialogueTimer--;
      if (dialogueTimer <= 0) { dialogueActive = false; gamePaused = false; }
    }
    return;
  }

  score = Math.floor(maxPlayerX / 8);

  const newWorld = getWorldForScore(score);
  if (newWorld !== worldIndex) {
    prevWorld = worldIndex;
    worldIndex = newWorld;
    worldTransition = 60;
    const w = getWorld();
    storyText = w.intro;
    storyTimer = 180;
    if (overlayMsg) {
      overlayMsg.style.display = 'block';
      overlayMsg.textContent = '✦ ' + w.name + ' ✦';
      overlayMsg.style.color = w.textColor;
      setTimeout(() => { overlayMsg.style.display = 'none'; }, 2000);
    }
    setTimeout(() => {
      dialogueText = w.dialogue;
      dialogueActive = true;
      dialogueTimer = 300;
      gamePaused = true;
      pauseTimer = 180;
    }, 2200);
    villainTransitionTimer = 180;
    updateHUD();
  }
  if (worldTransition > 0) worldTransition--;
  if (newWorld !== worldIndex) {
    villainTransitionTimer = 180;
  }

  speedMult = 1 + Math.min(score / 1500, 0.5);
  if (activePowerUp && activePowerUp.id === 'time') speedMult = 0.5;

  updatePlayer();
  updateEnemies();
  updateVillain();
  generateLevel();
  updateCamera();
  updateAnimation();
  updateParticles();
  updateFloatingTexts();
  updateScreenshake();
  updateWeather();

  if (invincible > 0) invincible--;
  if (comboTimer > 0) comboTimer--;
  else comboCount = 0;
  if (storyTimer > 0) storyTimer--;
  if (player.slowTimer > 0) player.slowTimer--;

  if (Math.abs(player.vx) > 0.3) {
    groundOffset = (groundOffset + Math.abs(player.vx) * 0.5 * speedMult) % 40;
  }
  updateHUD();
}

// --- Drawing ---
function getLerpedColor(progress, c1, c2) {
  if (progress <= 0) return c1;
  if (progress >= 1) return c2;
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  return `rgb(${Math.round(r1 + (r2 - r1) * progress)},${Math.round(g1 + (g2 - g1) * progress)},${Math.round(b1 + (b2 - b1) * progress)})`;
}

let _cachedColors = null;

function getWorldColors() {
  if (_cachedColors) return _cachedColors;
  const w = getWorld();
  if (worldTransition <= 0) { _cachedColors = w; return w; }
  const prevW = WORLDS[prevWorld] || WORLDS[0];
  const t = worldTransition / 60;
  _cachedColors = {
    sky1: getLerpedColor(1 - t, prevW.sky1, w.sky1),
    sky2: getLerpedColor(1 - t, prevW.sky2, w.sky2),
    ground1: getLerpedColor(1 - t, prevW.ground1, w.ground1),
    ground2: getLerpedColor(1 - t, prevW.ground2, w.ground2),
    grassColor: getLerpedColor(1 - t, prevW.grassColor, w.grassColor),
    accentColor: getLerpedColor(1 - t, prevW.accentColor, w.accentColor),
    groundLine: getLerpedColor(1 - t, prevW.groundLine, w.groundLine),
    mountainColor: getLerpedColor(1 - t, prevW.mountainColor, w.mountainColor),
    mountainHighlight: getLerpedColor(1 - t, prevW.mountainHighlight, w.mountainHighlight),
    enemyColor1: getLerpedColor(1 - t, prevW.enemyColor1, w.enemyColor1),
    enemyColor2: getLerpedColor(1 - t, prevW.enemyColor2, w.enemyColor2),
    enemyColor3: getLerpedColor(1 - t, prevW.enemyColor3, w.enemyColor3),
    textColor: w.textColor,
  };
  return _cachedColors;
}

function drawBackground() {
  const c = getWorldColors();
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, c.sky1);
  grad.addColorStop(1, c.sky2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  const mOffset = camera.x * 0.3;
  for (let i = 0; i < 4; i++) {
    const mx = (i * 240 - mOffset) % (W + 400) - 100;
    ctx.fillStyle = c.mountainColor;
    ctx.fillRect(mx, GROUND_Y - 70, 10, 70);
    ctx.fillStyle = c.mountainHighlight;
    ctx.fillRect(mx - 20, GROUND_Y - 80, 50, 10);
    ctx.fillRect(mx - 10, GROUND_Y - 90, 30, 10);
  }

  for (const p of platforms) {
    if (p.solid && p.h > 20) {
      const sx = p.x - camera.x;
      if (sx + p.w < 0 || sx > W) continue;
      ctx.fillStyle = c.ground1;
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = c.ground2;
      for (let x = -groundOffset + (p.x % 40); x < p.w; x += 40) {
        const dx = sx + x;
        if (dx >= sx && dx < sx + p.w) ctx.fillRect(dx, p.y, 2, p.h);
      }
      ctx.fillStyle = c.groundLine;
      ctx.fillRect(sx, p.y, p.w, 3);
    } else if (p.solid) {
      const sx = p.x - camera.x;
      if (sx + p.w < 0 || sx > W) continue;
      ctx.fillStyle = c.groundLine;
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = c.accentColor + '60';
      ctx.fillRect(sx + 2, p.y + 2, p.w - 4, p.h - 4);
    }
  }
}

function drawEnemies() {
  const c = getWorldColors();
  for (const e of levelEnemies) {
    const sx = e.x - camera.x;
    if (sx + e.w < 0 || sx > W) continue;
    const def = ENEMY_TYPES[e.type];
    if (def) def.draw(sx, e.y, e.w, e.h, [c.enemyColor1, c.enemyColor2, c.enemyColor3]);
  }
}

function drawVillain() {
  for (const v of villains) {
    const sx = v.x - camera.x;
    if (sx + v.w < -50 || sx > W + 50) continue;
    const frameIdx = Math.floor(v.frame) % 4;
    const frames = v.type === 'front' ? villain2Frames : villainFrames;
    const img = frames[frameIdx];
    if (img && img.complete && img.naturalWidth > 0) {
      if (v.type === 'front') {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + v.w, v.y, -v.w, v.h);
      } else {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx, v.y, v.w, v.h);
      }
    } else {
      ctx.fillStyle = '#e94560';
      ctx.fillRect(sx, v.y, v.w, v.h);
    }
  }
}

function drawCoins() {
  for (const c of levelCoins) {
    const sx = c.x - camera.x;
    if (sx + c.w < 0 || sx > W) continue;
    const bobY = c.y + Math.sin(frameCount * 0.06 + c.bob) * 3;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(sx, bobY, c.w, c.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', sx + c.w / 2, bobY + c.h / 2 + 1);
  }
}

function drawPowerUps() {
  for (const pu of levelPowerUps) {
    const sx = pu.x - camera.x;
    if (sx + pu.w < 0 || sx > W) continue;
    const bob = Math.sin(frameCount * 0.05 + pu.bob) * 4;
    ctx.fillStyle = pu.type.color;
    ctx.fillRect(sx, pu.y + bob, pu.w, pu.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pu.type.icon, sx + pu.w / 2, pu.y + bob + pu.h / 2 + 1);
  }
}

function drawVines() {
  for (const v of levelVines) {
    const sx = v.x - camera.x;
    if (sx + v.w < 0 || sx > W) continue;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(sx, v.y, v.w, v.h);
    ctx.fillStyle = '#795548';
    for (let y = v.y; y < v.y + v.h; y += 20) {
      ctx.fillRect(sx + 2, y + 8, v.w - 4, 4);
    }
  }
}

function drawDoors() {
  for (const d of levelDoors) {
    const sx = d.x - camera.x;
    if (sx + d.w < 0 || sx > W) continue;
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(sx, d.y, d.w, d.h);
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(sx + 4, d.y + 4, d.w - 8, d.h - 8);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(sx + d.w / 2 - 2, d.y + d.h / 2 - 5, 4, 10);
  }
}

function drawPlayer() {
  if (invincible > 0 && Math.floor(invincible / 4) % 2 === 0) return;
  const p = player;
  const anim = ANIM[p.animState] || ANIM.idle;
  const frameIdx = anim.frames[p.animFrame] || 0;
  const img = playerFrames[Math.min(frameIdx, playerFrames.length - 1)];
  const sx = p.x - camera.x;

  if (p.attacking) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(p.facingRight ? sx + p.w : sx - 20, p.y + 10, 20, p.h - 20);
  }

  if (img && img.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    let srcX = CROP_X, srcY = CROP_Y, srcW = CROP_W, srcH = CROP_H;
    if (srcX + srcW > iw || srcY + srcH > ih || srcW <= 0 || srcH <= 0) {
      const maxF = Math.max(...Object.values(ANIM).flatMap(a => a.frames)) + 1;
      const fw = Math.floor(iw / maxF);
      if (fw > 0 && frameIdx < maxF) {
        srcX = frameIdx * fw; srcY = 0;
        srcW = fw; srcH = ih;
      } else {
        srcX = 0; srcY = 0; srcW = iw; srcH = ih;
      }
    }

    if (p.facingRight) {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, sx, p.y, p.w, p.h);
    } else {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, sx + p.w, p.y, -p.w, p.h);
    }
  } else {
    ctx.fillStyle = '#e94560';
    ctx.fillRect(sx, p.y, p.w, p.h);
  }

  if (activePowerUp) {
    ctx.fillStyle = activePowerUp.color + '40';
    ctx.fillRect(sx - 3, p.y - 3, p.w + 6, p.h + 6);
  }
  if (p.slowTimer > 0) {
    ctx.fillStyle = 'rgba(79,195,247,0.15)';
    ctx.fillRect(sx, p.y, p.w, p.h);
  }
}

function drawWeather() {
  if (worldIndex === 3) return;
  if (weatherType === 'rain') {
    ctx.fillStyle = 'rgba(180,210,255,0.25)';
    for (const p of weatherParticles) ctx.fillRect(p.x, p.y, 2, p.len);
  } else if (weatherType === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const p of weatherParticles) ctx.fillRect(p.x, p.y, p.r, p.r);
  } else if (weatherType === 'fog') {
    ctx.fillStyle = 'rgba(200,200,220,0.06)';
    for (const p of weatherParticles) ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawDialogue() {
  if (!dialogueActive || !dialogueText) return;
  const bx = 30, bw = W - 60, by = 64, bh = 70;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = 'rgba(255,215,0,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(username || 'HARSH', bx + 12, by + 8);

  ctx.fillStyle = '#fff';
  ctx.font = '12px sans-serif';
  const words = dialogueText.split(' ');
  let line = '', ly = by + 28;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > bw - 28) {
      ctx.fillText(line.trim(), bx + 12, ly);
      line = word + ' ';
      ly += 16;
    } else line = test;
  }
  ctx.fillText(line.trim(), bx + 12, ly);

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('[ SPACE to continue ]', bx + bw - 8, by + bh + 14);

  const blink = (frameCount & 16) ? 0.6 : 0.3;
  ctx.fillStyle = 'rgba(255,255,255,' + blink + ')';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('▸', bx + bw - 8, by + bh - 4);
}

function drawFloatingTexts() {
  for (const ft of floatingTexts) {
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}

function drawPauseMenu() {
  if (!paused) return;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', W / 2, H / 2 - 60);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#aaa';
  const controls = [
    'A / D — Move',
    'Space — Jump (hold for height)',
    'Shift — Sprint',
    'S — Crouch',
    'W — Climb vines',
    'J — Attack',
    'K — Special Ability',
    'E — Interact',
    'F — Toggle Fullscreen',
    'Esc — Resume',
  ];
  for (let i = 0; i < controls.length; i++) {
    ctx.fillStyle = i < 9 ? '#ccc' : '#ffd700';
    ctx.fillText(controls[i], W / 2, H / 2 - 20 + i * 20);
  }
}

function drawHUD() {
  const w = getWorld();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(4, 2, 160, 56);

  ctx.fillStyle = w.textColor;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(w.name, 10, 6);

  ctx.fillStyle = '#fff';
  ctx.font = '11px sans-serif';
  ctx.fillText(w.subtitle, 10, 24);

  ctx.fillStyle = '#ffd700';
  ctx.font = '12px sans-serif';
  ctx.fillText('✦ ' + score, 10, 42);

  if (activePowerUp) {
    const px = W - 110, py = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(px - 4, py - 2, 108, 26);
    ctx.fillStyle = activePowerUp.color;
    ctx.fillRect(px, py + 18, (powerUpTimer / activePowerUp.duration) * 100, 4);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(activePowerUp.name, px, py + 4);
  }

  if (villains.length > 0) {
    ctx.fillStyle = 'rgba(255,0,0,0.1)';
    ctx.fillRect(W - 110, 38, 106, 16);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠ THE STALKER', W - 106, 42);
  }

  const heartSize = 8;
  const heartGap = 14;
  const startX = W - 10 - heartSize;
  const displayHearts = Math.min(lives, 10);
  for (let i = 0; i < displayHearts; i++) {
    const hx = startX - i * heartGap;
    ctx.fillStyle = '#e94560';
    ctx.fillRect(hx, H - 20, heartSize, heartSize);
    ctx.fillStyle = '#ff6b81';
    ctx.fillRect(hx + 2, H - 18, heartSize - 4, heartSize - 4);
    if (i === 0 && invincible > 0) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx - 2, H - 22, heartSize + 4, heartSize + 4);
    }
  }
  if (lives > 10) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('+' + (lives - 10), startX - 9 * heartGap - 2, H - 12);
  }

  if (comboCount > 1) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('x' + comboCount, 14, 76);
  }
}

function draw() {
  _cachedColors = null;
  ctx.save();
  ctx.translate(screenshake.x, screenshake.y);

  drawBackground();
  drawVines();
  drawDoors();
  drawEnemies();
  drawVillain();
  drawCoins();
  drawPowerUps();
  drawPlayer();
  drawWeather();
  drawParticles();
  drawFloatingTexts();
  drawDialogue();
  drawPauseMenu();
  drawHUD();

  ctx.restore();
}

function updateHUD() {
  scoreDisplay.textContent = '✦ ' + score;
  if (worldIndex !== undefined) {
    worldDisplay.textContent = WORLDS[worldIndex] ? WORLDS[worldIndex].name : 'Verdant Canopy';
  }
}

function gameOver() {
  gameRunning = false;
  gameOverAt = Date.now();
  if (overlayMsg) overlayMsg.style.display = 'none';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('runnerHighScore', highScore);
    highScoreDisplay.textContent = 'Best: ' + highScore;
    if (menuHighScore) menuHighScore.textContent = highScore;
  }
  if (gameOverHighScore) gameOverHighScore.textContent = highScore;
  finalScore.textContent = '✦ Score: ' + score + '  |  Best Combo: x' + maxCombo;
  gameOverScreen.style.display = 'block';
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  player.x = 80;
  player.y = GROUND_Y - player.h;
  player.vx = 0; player.vy = 0;
  player.onGround = true;
  player.facingRight = true;
  player.animState = 'idle';
  player.animFrame = 0; player.animTimer = 0;
  player.sprinting = false; player.crouching = false;
  player.attacking = false; player.attackTimer = 0;
  player.hurtTimer = 0; player.jumpHeld = false;
  player.jumpTicks = 0; player.climbing = false;
  player.climbable = null; player.specialCooldown = 0;
  player.slowTimer = 0;

  camera = { x: 0 };
  maxPlayerX = player.x;
  frameCount = 0;
  worldIndex = 0;
  worldTransition = 0;
  prevWorld = 0;
  speedMult = 1;
  groundOffset = 0;

  platforms = [];
  levelEnemies = [];
  levelCoins = [];
  levelPowerUps = [];
  levelVines = [];
  levelDoors = [];
  nextGenX = 0;

  villains = [];
  villainCooldown = 0;
  villainTransitionTimer = 0;

  weatherType = 'none';
  weatherParticles = [];
  weatherTimer = 200;

  activePowerUp = null;
  powerUpTimer = 0;

  particles = [];
  screenshake = { x: 0, y: 0, intensity: 0 };
  floatingTexts = [];

  lives = 5;
  invincible = 0;
  comboCount = 0;
  comboTimer = 0;
  maxCombo = 0;

  storyText = '';
  storyTimer = 0;
  dialogueActive = false;
  dialogueText = '';
  dialogueTimer = 0;
  gamePaused = false;
  pauseTimer = 0;
  paused = false;

  if (overlayMsg) overlayMsg.style.display = 'none';
  updateHUD();
}

function startGame() {
  const inputName = usernameInput.value.trim();
  if (inputName) {
    username = inputName;
    cheatMode = CHEAT_USERNAMES.includes(username.toLowerCase());
    saveUserData();
    if (usernameDisplay) usernameDisplay.textContent = username;
  }
  resetGame();
  generateLevel();
  if (cheatMode) lives = 99;
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  gameRunning = true;
}

function canRestart() {
  return Date.now() - gameOverAt > 400;
}

function loadUserData() {
  const saved = localStorage.getItem('runnerUser');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      username = data.name || '';
      cheatMode = data.cheat || false;
    } catch { username = ''; cheatMode = false; }
  }
  if (username) {
    usernameInput.value = username;
    if (usernameDisplay) usernameDisplay.textContent = username;
  }
}
function saveUserData() {
  localStorage.setItem('runnerUser', JSON.stringify({ name: username, cheat: cheatMode }));
}
loadUserData();

// --- Input Handling ---
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();

  if (e.code === 'Escape') {
    if (!gameRunning) return;
    paused = !paused;
    if (dialogueActive) { dialogueActive = false; gamePaused = false; }
    return;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    if (dialogueActive) { dialogueActive = false; gamePaused = false; return; }
    if (!gameRunning && gameOverScreen.style.display === 'block' && canRestart()) { startGame(); return; }
    if (!gameRunning && startScreen.style.display !== 'none') { startGame(); return; }
    return;
  }

  if (e.code === 'KeyJ' && gameRunning && !paused) {
    if (!player.attacking) {
      player.attacking = true;
      player.attackTimer = 18;
    }
  }

  if (e.code === 'KeyK' && gameRunning && !paused && player.specialCooldown === 0) {
    player.specialCooldown = 120;
    for (let i = levelEnemies.length - 1; i >= 0; i--) {
      const e = levelEnemies[i];
      if (Math.abs(e.x - player.x) < W) {
        levelEnemies.splice(i, 1);
        score += 15;
        spawnHitParticles(e.x + e.w / 2, e.y + e.h / 2);
      }
    }
    shake(5);
    showFloatingText('SPECIAL!', '#9C27B0');
  }

  if (e.code === 'KeyF') {
    toggleFullscreen();
    return;
  }

  if (e.code === 'KeyE' && gameRunning && !paused) {
    for (const d of levelDoors) {
      if (!d.activated && Math.abs(d.x - player.x) < 60 && Math.abs((d.y + d.h / 2) - (player.y + player.h / 2)) < 80) {
        d.activated = true;
        showFloatingText('Interacted!', '#ffd700');
        spawnPowerUpParticles(d.x + d.w / 2, d.y + d.h / 2, '#ffd700');
        score += 25;
        break;
      }
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

canvas.addEventListener('click', () => {
  canvas.focus();
  if (dialogueActive) { dialogueActive = false; gamePaused = false; return; }
  if (paused) { paused = false; return; }
  if (!gameRunning && gameOverScreen.style.display === 'block' && canRestart()) startGame();
  else if (!gameRunning && startScreen.style.display !== 'none') startGame();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// --- Touch Controls ---
const touchKeys = { 'KeyA': false, 'KeyD': false, 'KeyJ': false, 'KeyK': false, 'Space': false, 'ShiftLeft': false };

function setTouchKey(code, down) {
  touchKeys[code] = down;
  keys[code] = down;
}

function setupTouchButton(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); el.classList.add('active'); setTouchKey(code, true); });
  el.addEventListener('touchend', (e) => { e.preventDefault(); el.classList.remove('active'); setTouchKey(code, false); });
  el.addEventListener('touchcancel', (e) => { el.classList.remove('active'); setTouchKey(code, false); });
}

setupTouchButton('touchLeft', 'KeyA');
setupTouchButton('touchRight', 'KeyD');
setupTouchButton('touchAttack', 'KeyJ');
setupTouchButton('touchSpecial', 'KeyK');
setupTouchButton('touchSprint', 'ShiftLeft');

// Pause button
const touchPause = document.getElementById('touchPause');
if (touchPause) {
  touchPause.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    paused = !paused;
    if (dialogueActive) { dialogueActive = false; gamePaused = false; }
  });
}

// Jump button (Space) with tap-to-restart/start
const touchJump = document.getElementById('touchJump');
if (touchJump) {
  touchJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchJump.classList.add('active');
    if (dialogueActive) { dialogueActive = false; gamePaused = false; return; }
    if (paused) { paused = false; return; }
    if (!gameRunning && gameOverScreen.style.display === 'block' && canRestart()) { startGame(); return; }
    if (!gameRunning && startScreen.style.display !== 'none') { startGame(); return; }
    if (gameRunning && !paused) {
      setTouchKey('Space', true);
    }
  });
  touchJump.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchJump.classList.remove('active');
    setTouchKey('Space', false);
  });
  touchJump.addEventListener('touchcancel', () => {
    touchJump.classList.remove('active');
    setTouchKey('Space', false);
  });
}

// Prevent default touch on canvas to avoid scrolling
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());

// Detect touch device to show controls
const touchControls = document.getElementById('touchControls');
let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) touchControls.style.display = 'block';

// Touch controls permanent in mobile mode
const origStartGame2 = startGame;
startGame = function() {
  origStartGame2();
  if (isTouchDevice) touchControls.style.display = 'block';
};
const origGameOver2 = gameOver;
gameOver = function() {
  origGameOver2();
  if (isTouchDevice) touchControls.style.display = 'block';
};
const origReset2 = resetGame;
resetGame = function() {
  origReset2();
  if (isTouchDevice) touchControls.style.display = 'block';
};

// --- Canvas Scaling ---
function resizeCanvas() {
  const container = document.getElementById('gameContainer');
  if (deviceMode === 'mobile') {
    container.classList.add('mobile-mode');
  } else {
    container.classList.remove('mobile-mode');
    const maxW = window.innerWidth - 4;
    const maxH = window.innerHeight - 4;
    const scale = Math.min(maxW / W, maxH / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
  }
}

// --- Device Mode ---
let deviceMode = localStorage.getItem('runnerDevice') || null;
const deviceSelector = document.getElementById('deviceSelector');

function setDeviceMode(mode) {
  deviceMode = mode;
  localStorage.setItem('runnerDevice', mode);
  deviceSelector.classList.remove('show');
  if (mode === 'mobile') {
    isTouchDevice = true;
    document.body.classList.add('mobile-active');
    if (touchControls) touchControls.style.display = 'block';
  } else {
    document.body.classList.remove('mobile-active');
  }
  document.getElementById('switchToMobile').classList.toggle('active', mode === 'mobile');
  document.getElementById('switchToPC').classList.toggle('active', mode === 'pc');
  if (mode === 'pc' && orientPrompt) orientPrompt.style.display = 'none';
  resizeCanvas();
}

if (!deviceMode) {
  deviceSelector.classList.add('show');
} else {
  setDeviceMode(deviceMode);
}

document.getElementById('mobileMode').addEventListener('click', () => setDeviceMode('mobile'));
document.getElementById('pcMode').addEventListener('click', () => setDeviceMode('pc'));

// --- Fullscreen ---
let isFullscreen = false;

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

document.addEventListener('fullscreenchange', () => {
  isFullscreen = !!document.fullscreenElement;
  const container = document.getElementById('gameContainer');
  container.classList.toggle('fullscreen', isFullscreen);
  const fsBtn = document.getElementById('fullscreenBtn');
  if (fsBtn) fsBtn.textContent = isFullscreen ? '⛶' : '⛶';
  const fsToggle = document.getElementById('fullscreenToggle');
  if (fsToggle) fsToggle.classList.toggle('active', isFullscreen);
  resizeCanvas();
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Fullscreen button
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

// --- Settings Panel ---
const settingsPanel = document.getElementById('settingsPanel');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettings');
const soundToggleEl = document.getElementById('soundToggle');

let soundEnabled = localStorage.getItem('runnerSound') !== 'off';

if (soundToggleEl) soundToggleEl.classList.toggle('active', soundEnabled);

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    if (paused || !gameRunning) {
      settingsPanel.classList.toggle('show');
    }
  });
}

if (closeSettings) {
  closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('show');
  });
}

if (soundToggleEl) {
  soundToggleEl.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleEl.classList.toggle('active', soundEnabled);
    localStorage.setItem('runnerSound', soundEnabled ? 'on' : 'off');
  });
}

const fsToggle = document.getElementById('fullscreenToggle');
if (fsToggle) fsToggle.addEventListener('click', toggleFullscreen);

document.getElementById('switchToMobile').addEventListener('click', () => {
  setDeviceMode('mobile');
  settingsPanel.classList.remove('show');
});
document.getElementById('switchToPC').addEventListener('click', () => {
  setDeviceMode('pc');
  settingsPanel.classList.remove('show');
});

// --- Procedural Sound Effects ---
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type, volume) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration || 0.1));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (duration || 0.1));
  } catch {}
}

function playJumpSound() { playTone(520, 0.12, 'square', 0.06); }
function playCoinSound() { playTone(880, 0.08, 'sine', 0.07); setTimeout(() => playTone(1100, 0.08, 'sine', 0.05), 60); }
function playHitSound() { playTone(180, 0.2, 'sawtooth', 0.1); }
function playAttackSound() { playTone(350, 0.06, 'square', 0.05); }
function playSpecialSound() { playTone(250, 0.15, 'sawtooth', 0.08); setTimeout(() => playTone(500, 0.1, 'sine', 0.06), 80); }
function playPowerUpSound() { playTone(660, 0.1, 'sine', 0.07); setTimeout(() => playTone(990, 0.12, 'sine', 0.06), 80); }
function playLandSound() { playTone(120, 0.06, 'triangle', 0.04); }
function playVillainSound() { playTone(140, 0.3, 'sawtooth', 0.06); }

// Hook sounds into game actions
const origTakeDamage = takeDamage;
takeDamage = function() { playHitSound(); origTakeDamage(); };

const origSpawnCoinParticles = spawnCoinParticles;
spawnCoinParticles = function(x, y) { playCoinSound(); origSpawnCoinParticles(x, y); };

const origUpdatePlayer2 = updatePlayer;
updatePlayer = function() {
  const p = player;
  const wasOnGround = p.onGround;
  const wasJump = keys['Space'] && p.onGround && !p.crouching;
  const prevPULen = levelPowerUps.length;
  origUpdatePlayer2();
  if (!wasOnGround && p.onGround) playLandSound();
  if (wasJump && p.vy < 0 && wasOnGround) playJumpSound();
  if (levelPowerUps.length < prevPULen) playPowerUpSound();
};

document.addEventListener('keydown', function hookAttack(e) {
  if (e.code === 'KeyJ' && gameRunning && !paused) playAttackSound();
  if (e.code === 'KeyK' && gameRunning && !paused && player.specialCooldown === 0) playSpecialSound();
});

// --- Orientation Prompt ---
const orientPrompt = document.getElementById('orientationPrompt');
const dismissOrient = document.getElementById('dismissOrientation');
let orientDismissed = false;

function checkOrientation() {
  if (!isTouchDevice || orientDismissed) return;
  orientPrompt.style.display = (window.innerHeight > window.innerWidth) ? 'flex' : 'none';
}

if (dismissOrient) {
  dismissOrient.addEventListener('click', () => {
    orientDismissed = true;
    orientPrompt.style.display = 'none';
  });
}

window.addEventListener('resize', checkOrientation);
setTimeout(checkOrientation, 500);

// --- FPS Counter ---
const fpsEl = document.getElementById('fpsCounter');
let fpsFrames = 0;
let fpsTime = 0;
let fpsValue = 0;

function updateFPS() {
  fpsFrames++;
  const now = performance.now();
  if (now - fpsTime >= 1000) {
    fpsValue = fpsFrames;
    fpsFrames = 0;
    fpsTime = now;
    if (fpsEl) fpsEl.textContent = fpsValue + ' FPS';
  }
}

const origDraw = draw;
draw = function() {
  origDraw();
  updateFPS();
};

gameLoop();
