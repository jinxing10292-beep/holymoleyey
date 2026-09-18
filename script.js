const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const joystickBase = document.getElementById('joystickBase');
const joystickKnob = document.getElementById('joystickKnob');
const levelValue = document.getElementById('levelValue');
const xpFill = document.getElementById('xpFill');
const biomeLabel = document.getElementById('biomeLabel');
const distanceLabel = document.getElementById('distanceLabel');
const cellSelectOverlay = document.getElementById('cellSelectOverlay');
const evolutionOverlay = document.getElementById('evolutionOverlay');
const evolutionChoices = document.getElementById('evolutionChoices');
const evolutionLevelText = document.getElementById('evolutionLevelText');
const evolutionStageText = document.getElementById('evolutionStageText');
const cellStatusText = document.getElementById('cellStatusText');
const evolutionStatusText = document.getElementById('evolutionStatusText');

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

const EVOLUTION_STAGE3_PROFILES = {
  질주형: { summary: '폭주형과 질풍형으로 이어지는 기동 진화', speed: 1.22, size: 4, color: '#97f8ff', stage4: ['폭주형', '질풍형'], stage5: ['광폭종', '천풍종'] },
  사냥형: { summary: '포식형과 추적형으로 이어지는 공격 진화', speed: 1.18, size: 3, color: '#ffc49d', stage4: ['포식형', '추적형'], stage5: ['대포식종', '추적종'] },
  유목형: { summary: '방랑형과 개척형으로 이어지는 탐험 진화', speed: 1.14, size: 2, color: '#d5ff9a', stage4: ['방랑형', '개척형'], stage5: ['대륙방랑종', '개척종'] },
  덩굴형: { summary: '재생형과 거대덩굴형으로 이어지는 생존 진화', speed: 1.1, size: 5, color: '#8ef7a4', stage4: ['재생형', '거대덩굴형'], stage5: ['불멸균종', '거대목종'] },
  거목형: { summary: '고목형과 세계수형으로 이어지는 고급 성장 진화', speed: 1.07, size: 6, color: '#bbff9d', stage4: ['고목형', '세계수형'], stage5: ['고대목종', '세계수종'] },
  균사형: { summary: '대균사형과 독포자형으로 이어지는 확산 진화', speed: 1.12, size: 4, color: '#d3ff8a', stage4: ['대균사형', '독포자형'], stage5: ['균사군체종', '맹독포자종'] },
  갑각형: { summary: '중갑형과 가시갑각형으로 이어지는 방어 진화', speed: 1.02, size: 7, color: '#c0d9ff', stage4: ['중갑형', '가시갑각형'], stage5: ['중장갑종', '가시갑주종'] },
  철갑형: { summary: '요새형과 전투갑각형으로 이어지는 방어형 진화', speed: 0.98, size: 8, color: '#bfd7ff', stage4: ['요새형', '전투갑각형'], stage5: ['성채종', '전쟁갑각종'] },
  결정형: { summary: '마력결정형과 거대결정형으로 이어지는 에너지 진화', speed: 1.16, size: 5, color: '#d8b8ff', stage4: ['마력결정형', '거대결정형'], stage5: ['마력결정종', '거대결정종'] },
  질주유영형: { summary: '초고속유영종과 대양방랑종으로 이어짐', speed: 1.3, size: 3, color: '#9ce6ff', stage4: ['초고속유영종', '대양방랑종'], stage5: ['초고속유영종', '대양방랑종'] },
  회피유영형: { summary: '회피전문종으로 이어지는 민첩 진화', speed: 1.25, size: 2, color: '#9cefc7', stage4: ['회피전문종'], stage5: ['회피전문종'] },
  장거리유영형: { summary: '대양방랑종으로 이어지는 장거리 진화', speed: 1.2, size: 3, color: '#bceeff', stage4: ['대양방랑종'], stage5: ['대양방랑종'] },
  거대산호형: { summary: '산호거체종과 해저갑주종으로 이어짐', speed: 1.05, size: 7, color: '#9ef7d2', stage4: ['산호거체종', '해저갑주종'], stage5: ['산호거체종', '해저갑주종'] },
  경질산호형: { summary: '해저갑주종으로 이어지는 방어형 진화', speed: 1.0, size: 8, color: '#c4f5d8', stage4: ['해저갑주종'], stage5: ['해저갑주종'] },
  재생산호형: { summary: '불멸산호종으로 이어지는 회복형 진화', speed: 1.08, size: 5, color: '#7cf7cb', stage4: ['불멸산호종'], stage5: ['불멸산호종'] },
  추적포식형: { summary: '해양추적종으로 이어지는 추적형 진화', speed: 1.18, size: 4, color: '#ffb8d9', stage4: ['해양추적종'], stage5: ['해양추적종'] },
  돌진포식형: { summary: '해양돌격종으로 이어지는 돌진형 진화', speed: 1.28, size: 4, color: '#ff9fc7', stage4: ['해양돌격종'], stage5: ['해양돌격종'] },
  군체포식형: { summary: '군체사냥종으로 이어지는 집단형 진화', speed: 1.15, size: 5, color: '#ffd6a9', stage4: ['군체사냥종'], stage5: ['군체사냥종'] },
  압력적응형: { summary: '초압력적응종으로 이어지는 심해 적응 진화', speed: 1.12, size: 5, color: '#9ea8ff', stage4: ['초압력적응종'], stage5: ['초압력적응종'] },
  심연잠복형: { summary: '심연잠복종으로 이어지는 은신 진화', speed: 1.14, size: 4, color: '#a7c8ff', stage4: ['심연잠복종'], stage5: ['심연잠복종'] },
  심연재생형: { summary: '심연재생종으로 이어지는 회복 진화', speed: 1.08, size: 6, color: '#a7f6d0', stage4: ['심연재생종'], stage5: ['심연재생종'] },
  중괴수형: { summary: '대형괴수종으로 이어지는 압도형 진화', speed: 1.0, size: 8, color: '#cfb1ff', stage4: ['대형괴수종'], stage5: ['대형괴수종'] },
  포식괴수형: { summary: '심연포식종으로 이어지는 포식 진화', speed: 1.22, size: 5, color: '#ffc0d4', stage4: ['심연포식종'], stage5: ['심연포식종'] },
  돌격괴수형: { summary: '심연돌격종으로 이어지는 돌진 진화', speed: 1.26, size: 6, color: '#ffb7ae', stage4: ['심연돌격종'], stage5: ['심연돌격종'] },
  강광발광형: { summary: '강광발광종으로 이어지는 광원 진화', speed: 1.16, size: 3, color: '#8fffe0', stage4: ['강광발광종'], stage5: ['강광발광종'] },
  유인발광형: { summary: '유혹발광종으로 이어지는 유인 진화', speed: 1.12, size: 3, color: '#b8ffdd', stage4: ['유혹발광종'], stage5: ['유혹발광종'] },
  탐색발광형: { summary: '심해탐색종으로 이어지는 탐색 진화', speed: 1.2, size: 3, color: '#9ce9ff', stage4: ['심해탐색종'], stage5: ['심해탐색종'] },
};

const EVOLUTION_TREE = {
  ground: {
    label: '지상 세포',
    baseSpeed: 120,
    baseColor: '#5ee2ff',
    glow: '#7ef7a6',
    stage2: [
      { name: '초원형', summary: '기동성과 탐색에 특화', speed: 1.1, size: 2, color: '#8ef0ff', stage3: ['질주형', '사냥형', '유목형'] },
      { name: '수목형', summary: '체력과 회복에 특화', speed: 0.95, size: 4, color: '#9bf7a2', stage3: ['덩굴형', '거목형', '균사형'] },
      { name: '암석형', summary: '방어와 공격에 특화', speed: 0.9, size: 6, color: '#b7d1ff', stage3: ['갑각형', '철갑형', '결정형'] },
    ],
  },
  ocean: {
    label: '해양 세포',
    baseSpeed: 150,
    baseColor: '#6ce0ff',
    glow: '#99f7ff',
    stage2: [
      { name: '유영형', summary: '이동 속도와 회피 특화', speed: 1.15, size: 2, color: '#8ee7ff', stage3: ['질주유영형', '회피유영형', '장거리유영형'] },
      { name: '산호형', summary: '체력과 방어 특화', speed: 0.95, size: 5, color: '#8ef7c0', stage3: ['거대산호형', '경질산호형', '재생산호형'] },
      { name: '포식형', summary: '공격력과 돌진 특화', speed: 1.08, size: 3, color: '#ff9ecb', stage3: ['추적포식형', '돌진포식형', '군체포식형'] },
    ],
  },
  abyss: {
    label: '심해 세포',
    baseSpeed: 100,
    baseColor: '#7d8cff',
    glow: '#b5b7ff',
    stage2: [
      { name: '심연형', summary: '압력 적응과 체력 특화', speed: 1.05, size: 5, color: '#90a9ff', stage3: ['압력적응형', '심연잠복형', '심연재생형'] },
      { name: '괴수형', summary: '공격력과 체력 특화', speed: 0.9, size: 7, color: '#d5a6ff', stage3: ['중괴수형', '포식괴수형', '돌격괴수형'] },
      { name: '발광형', summary: '희귀 먹이 탐색 특화', speed: 1.1, size: 3, color: '#8fffe2', stage3: ['강광발광형', '유인발광형', '탐색발광형'] },
    ],
  },
};

const EVOLUTION_BRANCH_MAP = {
  질주형: { stage4: ['폭주형', '질풍형'], stage5: ['광폭종', '천풍종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  사냥형: { stage4: ['포식형', '추적형'], stage5: ['대포식종', '추적종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  유목형: { stage4: ['방랑형', '개척형'], stage5: ['대륙방랑종', '개척종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  덩굴형: { stage4: ['재생형', '거대덩굴형'], stage5: ['불멸균종', '거대목종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  거목형: { stage4: ['고목형', '세계수형'], stage5: ['고대목종', '세계수종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  균사형: { stage4: ['대균사형', '독포자형'], stage5: ['균사군체종', '맹독포자종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  갑각형: { stage4: ['중갑형', '가시갑각형'], stage5: ['중장갑종', '가시갑주종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  철갑형: { stage4: ['요새형', '전투갑각형'], stage5: ['성채종', '전쟁갑각종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  결정형: { stage4: ['마력결정형', '거대결정형'], stage5: ['마력결정종', '거대결정종'], rare: ['고대 지상종', '천둥 지상종', '태풍 지상종', '거대 지상종'], final: '대지의 지배종' },
  질주유영형: { stage4: ['초고속유영종', '대양방랑종'], stage5: ['초고속유영종', '대양방랑종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  회피유영형: { stage4: ['회피전문종'], stage5: ['회피전문종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  장거리유영형: { stage4: ['대양방랑종'], stage5: ['대양방랑종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  거대산호형: { stage4: ['산호거체종', '해저갑주종'], stage5: ['산호거체종', '해저갑주종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  경질산호형: { stage4: ['해저갑주종'], stage5: ['해저갑주종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  재생산호형: { stage4: ['불멸산호종'], stage5: ['불멸산호종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  추적포식형: { stage4: ['해양추적종'], stage5: ['해양추적종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  돌진포식형: { stage4: ['해양돌격종'], stage5: ['해양돌격종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  군체포식형: { stage4: ['군체사냥종'], stage5: ['군체사냥종'], rare: ['폭풍 해양종', '심해적응 해양종', '거대 해양종'], final: '대양의 지배종' },
  압력적응형: { stage4: ['초압력적응종'], stage5: ['초압력적응종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  심연잠복형: { stage4: ['심연잠복종'], stage5: ['심연잠복종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  심연재생형: { stage4: ['심연재생종'], stage5: ['심연재생종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  중괴수형: { stage4: ['대형괴수종'], stage5: ['대형괴수종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  포식괴수형: { stage4: ['심연포식종'], stage5: ['심연포식종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  돌격괴수형: { stage4: ['심연돌격종'], stage5: ['심연돌격종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  강광발광형: { stage4: ['강광발광종'], stage5: ['강광발광종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  유인발광형: { stage4: ['유혹발광종'], stage5: ['유혹발광종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
  탐색발광형: { stage4: ['심해탐색종'], stage5: ['심해탐색종'], rare: ['심연군주종', '심해포식종', '심연발광종'], final: '심연의 지배종' },
};

const WORLD_SEGMENT_MIN = 10000;
const WORLD_SEGMENT_MAX = 15000;

const state = {
  selectedCell: null,
  evolution: null,
  evolutionStage: null,
  pendingEvolution: null,
  evolutionPath: [],
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

function applyEvolutionBonuses() {
  const cell = state.selectedCell ? EVOLUTION_TREE[state.selectedCell] : EVOLUTION_TREE.ground;
  const baseSpeed = cell.baseSpeed + (state.level - 1) * 4;
  const evolutionBonus = state.evolution ? state.evolution.speed : 1;
  state.player.speed = baseSpeed * evolutionBonus;
  state.player.color = state.evolution ? state.evolution.color : cell.baseColor;
  state.player.glow = state.evolution ? state.evolution.color : cell.glow;
  state.player.radius = 18 + (state.level - 1) * 2 + (state.evolution ? state.evolution.size : 0);
}

function renderEvolutionOptions() {
  if (!state.selectedCell) {
    return;
  }

  const cell = EVOLUTION_TREE[state.selectedCell];
  evolutionChoices.innerHTML = '';

  let options = [];

  if (state.evolutionStage === 'stage2') {
    options = cell.stage2;
  } else if (state.evolutionStage === 'stage3' && state.pendingEvolution) {
    options = (state.pendingEvolution.stage3 || []).map((name) => ({
      name,
      summary: EVOLUTION_STAGE3_PROFILES[name]?.summary || '특화 진화 경로',
      speed: EVOLUTION_STAGE3_PROFILES[name]?.speed || 1.1,
      size: EVOLUTION_STAGE3_PROFILES[name]?.size || 2,
      color: EVOLUTION_STAGE3_PROFILES[name]?.color || '#ffffff',
      stage4: EVOLUTION_STAGE3_PROFILES[name]?.stage4 || EVOLUTION_BRANCH_MAP[name]?.stage4 || [],
      stage5: EVOLUTION_STAGE3_PROFILES[name]?.stage5 || EVOLUTION_BRANCH_MAP[name]?.stage5 || [],
    }));
  } else if (state.evolutionStage === 'stage4' && state.pendingEvolution) {
    const stage4Names = EVOLUTION_BRANCH_MAP[state.pendingEvolution.name]?.stage4 || state.pendingEvolution.stage4 || [];
    options = stage4Names.map((name) => ({
      name,
      summary: `${name}으로 이어지는 상위 진화`,
      speed: 1.2,
      size: 4,
      color: '#ffd166',
      stage5: EVOLUTION_BRANCH_MAP[name]?.stage5 || [],
    }));
  } else if (state.evolutionStage === 'stage5' && state.pendingEvolution) {
    const stage5Names = EVOLUTION_BRANCH_MAP[state.pendingEvolution.name]?.stage5 || state.pendingEvolution.stage5 || [];
    options = stage5Names.map((name) => ({
      name,
      summary: `${name}으로 이어지는 고급 진화`,
      speed: 1.36,
      size: 5,
      color: '#8fffe0',
    }));
  }

  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cell-card';
    button.innerHTML = `
      <span class="cell-name">${option.name}</span>
      <span class="cell-detail">${option.summary}</span>
      ${state.evolutionStage === 'stage2' ? `<span class="cell-detail">분기: ${option.stage3.join(', ')}</span>` : ''}
      ${state.evolutionStage === 'stage3' ? `<span class="cell-detail">후속: ${Array.isArray(option.stage4) ? option.stage4.join(', ') : '진화 경로'}</span>` : ''}
      ${state.evolutionStage === 'stage4' ? '<span class="cell-detail">상위 진화 경로</span>' : ''}
      ${state.evolutionStage === 'stage5' ? '<span class="cell-detail">고급 진화</span>' : ''}
    `;

    button.addEventListener('click', () => {
      if (state.evolutionStage === 'stage2') {
        state.pendingEvolution = option;
        state.evolutionPath = [option.name];
        state.evolutionStage = 'stage3';
        evolutionStageText.textContent = '특화 진화';
        evolutionLevelText.textContent = '4';
        renderEvolutionOptions();
        return;
      }

      if (state.evolutionStage === 'stage3') {
        state.pendingEvolution = option;
        state.evolutionPath = [...(state.evolutionPath || []), option.name];
        state.evolutionStage = 'stage4';
        evolutionStageText.textContent = '상위 진화';
        evolutionLevelText.textContent = '5';
        renderEvolutionOptions();
        return;
      }

      if (state.evolutionStage === 'stage4') {
        state.pendingEvolution = option;
        state.evolutionPath = [...(state.evolutionPath || []), option.name];
        state.evolutionStage = 'stage5';
        evolutionStageText.textContent = '고급 진화';
        evolutionLevelText.textContent = '6';
        renderEvolutionOptions();
        return;
      }

      if (state.evolutionStage === 'stage5') {
        state.evolution = option;
        state.evolutionPath = [...(state.evolutionPath || []), option.name];
        applyEvolutionBonuses();
        evolutionOverlay.classList.add('hidden');
        state.evolutionStage = null;
        state.pendingEvolution = null;
        updateHud();
      }
    });

    evolutionChoices.appendChild(button);
  });
}

function showEvolutionPanel() {
  if (!state.selectedCell || state.evolution) {
    return;
  }

  state.evolutionStage = 'stage2';
  state.pendingEvolution = null;
  state.evolutionPath = [];
  evolutionStageText.textContent = '초기 진화';
  evolutionLevelText.textContent = '3';
  renderEvolutionOptions();
  evolutionOverlay.classList.remove('hidden');
}

function levelUpIfNeeded() {
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = Math.round(state.xpToNext * 1.45);

    if (state.level >= 3 && !state.evolution) {
      showEvolutionPanel();
    }

    applyEvolutionBonuses();
  }
}

function updateHud() {
  levelValue.textContent = state.level;
  xpFill.style.width = `${(state.xp / state.xpToNext) * 100}%`;
  const currentBiome = getBiomeName(state.player.x);
  biomeLabel.textContent = currentBiome;
  distanceLabel.textContent = `${Math.floor(Math.abs(state.player.x))}m`;

  const selectedCellName = state.selectedCell ? EVOLUTION_TREE[state.selectedCell].label : '미선택';
  const evolutionName = state.evolution ? state.evolution.name : (state.pendingEvolution ? state.pendingEvolution.name : '기본 세포');
  const evolutionPathText = state.evolutionPath.length ? ` / ${state.evolutionPath.join(' → ')}` : '';
  cellStatusText.textContent = selectedCellName;
  evolutionStatusText.textContent = `${evolutionName}${evolutionPathText}`;
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

function selectCell(cellKey) {
  const profile = EVOLUTION_TREE[cellKey];
  if (!profile) {
    return;
  }

  state.selectedCell = cellKey;
  state.evolution = null;
  state.player.color = profile.baseColor;
  state.player.glow = profile.glow;
  cellSelectOverlay.classList.add('hidden');
  applyEvolutionBonuses();
  updateHud();
}

function bindCellSelection() {
  document.querySelectorAll('.cell-card[data-cell]').forEach((button) => {
    const cellKey = button.dataset.cell;
    button.addEventListener('click', () => {
      if (!cellKey) {
        return;
      }
      selectCell(cellKey);
    });
  });
}

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
bindCellSelection();

resizeCanvas();
ensureWorldCoverage();
populateFoodField();
applyEvolutionBonuses();
updateHud();
requestAnimationFrame(gameLoop);
