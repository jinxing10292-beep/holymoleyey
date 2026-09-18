const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joystickBase = document.getElementById('joystickBase');
const joystickKnob = document.getElementById('joystickKnob');
const levelValue = document.getElementById('levelValue');
const xpFill = document.getElementById('xpFill');
const biomeLabel = document.getElementById('biomeLabel');
const distanceLabel = document.getElementById('distanceLabel');

const BIOMES = [
  '초원',
  '붉은 사막',
  '열대 정글',
  '빙결 지대',
  '거대 균사림',
  '화산 지대',
  '심해 균열',
  '수정 해저',
  '독성 습지',
  '고대 폐허',
];

const WORLD_SEGMENT_MIN = 10000;
const WORLD_SEGMENT_MAX = 15000;

const state = {
  level: 1,
  xp: 0,
  xpToNext: 30,
  cameraX: 0,
  cameraY: 0,
  player: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 18,
    speed: 120,
    color: '#5ee2ff',
    glow: '#7ef7a6',
  },
  foods: [],
  input: {
    active: false,
    x: 0,
    y: 0,
  },
  touchPointerId: null,
};

const world = {
  segments: [],
};

const biomePalettes = {
  초원: { skyTop: '#8ad5a1', skyMid: '#b9e8a0', skyBottom: '#7ea388', foodHue: [42, 118], accent: '#9cff8a' },
  '붉은 사막': { skyTop: '#d99a68', skyMid: '#e7c180', skyBottom: '#8b5d3a', foodHue: [18, 42], accent: '#ffd166' },
  '열대 정글': { skyTop: '#45b18a', skyMid: '#77d38d', skyBottom: '#1d6b53', foodHue: [90, 150], accent: '#6ef7c1' },
  '빙결 지대': { skyTop: '#6ea7d9', skyMid: '#aeebff', skyBottom: '#3a5e85', foodHue: [185, 220], accent: '#d8f4ff' },
  '거대 균사림': { skyTop: '#4d8d66', skyMid: '#7ebb7c', skyBottom: '#285a3f', foodHue: [120, 160], accent: '#b7ff9e' },
  '화산 지대': { skyTop: '#7a3342', skyMid: '#db6f4e', skyBottom: '#3a1b1a', foodHue: [0, 26], accent: '#ffb066' },
  '심해 균열': { skyTop: '#0f234d', skyMid: '#204d7f', skyBottom: '#091426', foodHue: [205, 245], accent: '#73d7ff' },
  '수정 해저': { skyTop: '#3d5e7a', skyMid: '#7fd6d5', skyBottom: '#173c52', foodHue: [150, 190], accent: '#a8ffe6' },
  '독성 습지': { skyTop: '#457b51', skyMid: '#78c892', skyBottom: '#234c2f', foodHue: [110, 130], accent: '#d2ff7a' },
  '고대 폐허': { skyTop: '#625c7e', skyMid: '#8c8bb1', skyBottom: '#2d2b42', foodHue: [265, 325], accent: '#d8b6ff' },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * ratio);
  canvas.height = Math.floor(canvas.clientHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getSegmentAtX(x) {
  for (let i = world.segments.length - 1; i >= 0; i -= 1) {
    const segment = world.segments[i];
    if (x >= segment.start && x < segment.end) {
      return segment;
    }
  }
  return world.segments[0] || { biome: '초원', start: 0, end: 12000 };
}

function getBiomeName(x) {
  return getSegmentAtX(x).biome;
}

function getBiomePaletteName(x) {
  return getBiomeName(x);
}

function appendWorldSegment() {
  const last = world.segments[world.segments.length - 1];
  const start = last ? last.end : 0;
  const length = randomInt(WORLD_SEGMENT_MIN, WORLD_SEGMENT_MAX);
  const biome = BIOMES[randomInt(0, BIOMES.length - 1)];

  world.segments.push({
    start,
    end: start + length,
    length,
    biome,
  });
}

function prependWorldSegment() {
  const first = world.segments[0];
  const end = first ? first.start : 0;
  const length = randomInt(WORLD_SEGMENT_MIN, WORLD_SEGMENT_MAX);
  const start = end - length;
  const biome = BIOMES[randomInt(0, BIOMES.length - 1)];

  world.segments.unshift({
    start,
    end,
    length,
    biome,
  });
}

function ensureWorldCoverage() {
  if (!world.segments.length) {
    world.segments.push({ start: 0, end: 12000, length: 12000, biome: '초원' });
  }

  while (state.player.x + 30000 > world.segments[world.segments.length - 1].end) {
    appendWorldSegment();
  }

  while (state.player.x - 20000 < world.segments[0].start) {
    prependWorldSegment();
  }
}

function createFood() {
  const biome = getBiomeName(state.player.x);
  const profile = biomePalettes[biome] || biomePalettes.초원;
  const radius = randomBetween(6, 12);
  const xBias = randomBetween(-1400, 1400);
  const spawnX = state.player.x + xBias;
  const spawnY = randomBetween(-190, 190);
  const value = Math.random() < 0.18 ? 18 : 10;

  state.foods.push({
    x: spawnX,
    y: spawnY,
    radius,
    value,
    hue: randomInt(profile.foodHue[0], profile.foodHue[1]),
    biome,
  });
}

function populateFoodField() {
  while (state.foods.length < 32) {
    createFood();
  }
}

function levelUpIfNeeded() {
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = Math.round(state.xpToNext * 1.45);
    state.player.radius = 18 + (state.level - 1) * 2;
    state.player.speed = 120 + (state.level - 1) * 4;
  }
}

function updateHud() {
  levelValue.textContent = state.level;
  xpFill.style.width = `${(state.xp / state.xpToNext) * 100}%`;
  const currentBiome = getBiomeName(state.player.x);
  biomeLabel.textContent = currentBiome;
  distanceLabel.textContent = `${Math.floor(Math.abs(state.player.x))}m`;
}

function findNearestFood() {
  let best = null;
  let bestDistance = Infinity;

  for (const food of state.foods) {
    const dx = food.x - state.player.x;
    const dy = food.y - state.player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = food;
    }
  }

  return best;
}

function consumeFood(food) {
  state.xp += food.value;
  levelUpIfNeeded();
  updateHud();

  const index = state.foods.indexOf(food);
  if (index >= 0) {
    state.foods.splice(index, 1);
  }

  createFood();
}

function handlePointerMove(event) {
  if (state.touchPointerId !== null && event.pointerId !== state.touchPointerId) {
    return;
  }

  const rect = joystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const maxDistance = rect.width * 0.42;
  const distance = Math.hypot(dx, dy) || 1;
  const limitedDistance = Math.min(distance, maxDistance);
  const angle = Math.atan2(dy, dx);

  const knobX = Math.cos(angle) * limitedDistance;
  const knobY = Math.sin(angle) * limitedDistance;

  joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  state.input.x = clamp(knobX / maxDistance, -1, 1);
  state.input.y = clamp(knobY / maxDistance, -1, 1);
  state.input.active = true;
}

function resetJoystick() {
  state.input.active = false;
  state.input.x = 0;
  state.input.y = 0;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
}

joystickBase.addEventListener('pointerdown', (event) => {
  state.touchPointerId = event.pointerId;
  joystickBase.setPointerCapture(event.pointerId);
  handlePointerMove(event);
});

joystickBase.addEventListener('pointermove', handlePointerMove);

joystickBase.addEventListener('pointerup', (event) => {
  if (event.pointerId === state.touchPointerId) {
    state.touchPointerId = null;
    resetJoystick();
  }
});

joystickBase.addEventListener('pointerleave', () => {
  if (state.touchPointerId !== null) {
    return;
  }
  resetJoystick();
});

joystickBase.addEventListener('pointercancel', () => {
  state.touchPointerId = null;
  resetJoystick();
});

function update(dt) {
  ensureWorldCoverage();

  let moveX = 0;
  let moveY = 0;

  if (state.input.active) {
    moveX = state.input.x;
    moveY = state.input.y;
  } else {
    const target = findNearestFood();

    if (target) {
      const dx = target.x - state.player.x;
      const dy = target.y - state.player.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 0.001) {
        moveX = (dx / distance) * 0.9;
        moveY = (dy / distance) * 0.9;
      }
    }
  }

  const moveLength = Math.hypot(moveX, moveY) || 1;
  const directionX = moveX / moveLength;
  const directionY = moveY / moveLength;
  const speed = state.player.speed * dt;

  state.player.x += directionX * speed * (moveLength || 0);
  state.player.y += directionY * speed * (moveLength || 0);

  state.player.y = clamp(state.player.y, -260, 260);

  state.cameraX = state.player.x - canvas.clientWidth / 2;
  state.cameraY = state.player.y - canvas.clientHeight * 0.42;

  for (const food of state.foods) {
    const dx = food.x - state.player.x;
    const dy = food.y - state.player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < state.player.radius + food.radius + 1) {
      consumeFood(food);
      break;
    }
  }

  while (state.foods.length < 32) {
    createFood();
  }

  updateHud();
}

function drawBackground() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const currentBiome = getBiomeName(state.player.x);
  const palette = biomePalettes[currentBiome] || biomePalettes.초원;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.28, palette.skyMid);
  sky.addColorStop(0.62, palette.skyBottom);
  sky.addColorStop(1, '#1b2a25');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let i = -5; i <= 5; i += 1) {
    const y = i * 90 - state.cameraY * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = -10; i <= 10; i += 1) {
    const x = i * 110 - state.cameraX * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawWorldBoundaries() {
  for (const segment of world.segments) {
    const left = segment.start - state.cameraX;
    const right = segment.end - state.cameraX;

    if (right < -200 || left > canvas.clientWidth + 200) {
      continue;
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, canvas.clientHeight);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(left, 0, Math.max(0, right - left), canvas.clientHeight);
  }
}

function drawFood(food) {
  const x = food.x - state.cameraX;
  const y = food.y - state.cameraY;

  ctx.beginPath();
  ctx.fillStyle = `hsl(${food.hue}, 80%, 60%)`;
  ctx.arc(x, y, food.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.arc(x - food.radius * 0.25, y - food.radius * 0.35, food.radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const x = canvas.clientWidth / 2;
  const y = canvas.clientHeight * 0.58;

  ctx.beginPath();
  ctx.fillStyle = state.player.glow;
  ctx.shadowColor = 'rgba(126,247,166,0.9)';
  ctx.shadowBlur = 20;
  ctx.arc(x, y, state.player.radius + 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = state.player.color;
  ctx.shadowBlur = 0;
  ctx.arc(x, y, state.player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.arc(x - state.player.radius * 0.3, y - state.player.radius * 0.25, state.player.radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawBackground();
  drawWorldBoundaries();

  for (const food of state.foods) {
    drawFood(food);
  }

  drawPlayer();
}

let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000 || 0.016, 0.033);
  lastTime = timestamp;

  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
ensureWorldCoverage();
populateFoodField();
updateHud();
requestAnimationFrame(gameLoop);
