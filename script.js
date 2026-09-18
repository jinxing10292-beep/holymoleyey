const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joystickBase = document.getElementById('joystickBase');
const joystickKnob = document.getElementById('joystickKnob');
const levelValue = document.getElementById('levelValue');
const xpFill = document.getElementById('xpFill');
const biomeLabel = document.getElementById('biomeLabel');
const distanceLabel = document.getElementById('distanceLabel');

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

const biomes = ['초원', '붉은 사막', '열대 정 jungle', '빙결 지대'];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * ratio);
  canvas.height = Math.floor(canvas.clientHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getBiomeName(x) {
  const absoluteX = Math.abs(x);
  if (absoluteX < 12000) return '초원';
  if (absoluteX < 24000) return '붉은 사막';
  if (absoluteX < 36000) return '열대 정글';
  return '빙결 지대';
}

function createFood() {
  const radius = randomBetween(6, 12);
  const spawnX = state.player.x + randomBetween(-1200, 1200);
  const spawnY = randomBetween(-190, 190);
  const value = Math.random() < 0.2 ? 18 : 10;

  state.foods.push({
    x: spawnX,
    y: spawnY,
    radius,
    value,
    hue: randomBetween(45, 140),
  });
}

function populateFoodField() {
  while (state.foods.length < 28) {
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
  biomeLabel.textContent = getBiomeName(state.player.x);
  distanceLabel.textContent = `${Math.abs(Math.floor(state.player.x))}m`;
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

  state.player.x = clamp(state.player.x, -100000, 100000);
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

  while (state.foods.length < 28) {
    createFood();
  }
}

function drawBackground() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#8ad5a1');
  sky.addColorStop(0.2, '#b9e8a0');
  sky.addColorStop(0.5, '#dfe7b4');
  sky.addColorStop(1, '#7ea388');
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
populateFoodField();
updateHud();
requestAnimationFrame(gameLoop);
