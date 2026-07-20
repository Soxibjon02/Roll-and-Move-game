/**
 * Galaxy Odyssey - Kosmik va Dunyo Sarguzashtlari
 * Dinamik qadamlar soni, o'yindan chiqish tasdiqlari, mavzular va Urgut Mahallalari xaritasi.
 */

// 1. SOUND SYNTHESIZER
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playSynthSound(type) {
    if (!soundEnabled) return;
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;

        if (type === 'dice') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'move') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'boost') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 0.6);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (type === 'teleport') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.4);
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 35;
            lfoGain.gain.value = 100;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.45);
            lfo.start(now);
            osc.start(now);
            lfo.stop(now + 0.45);
            osc.stop(now + 0.45);
        } else if (type === 'winner') {
            const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((f, idx) => {
                const subOsc = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                subOsc.type = 'triangle';
                subOsc.connect(subGain);
                subGain.connect(audioCtx.destination);
                
                subOsc.frequency.setValueAtTime(f, now + idx * 0.1);
                subGain.gain.setValueAtTime(0.1, now + idx * 0.1);
                subGain.gain.linearRampToValueAtTime(0, now + idx * 0.1 + 0.5);
                subOsc.start(now + idx * 0.1);
                subOsc.stop(now + idx * 0.1 + 0.5);
            });
        } else if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.setValueAtTime(300, now + 0.02);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    } catch(e) {
        console.warn("Audio error:", e);
    }
}

function playSound(soundId, type) {
    const el = document.getElementById(soundId);
    if (el && el.readyState >= 2 && soundEnabled) {
        el.currentTime = 0;
        el.play().catch(() => playSynthSound(type));
    } else {
        playSynthSound(type);
    }
}

// 2. CONFIRMATIONS (Chiqishni tasdiqlash)
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = 'Haqiqatan ham o\'yinni tark etmoqchimisiz?';
});

// 3. DOSKA XARITALARI (MAP CONTROL POINTS)
const mapControlPoints = {
    // Serpentine (Katta Odyssey Yo'li)
    serpentine: [
        { x: 120, y: 1550 },
        { x: 400, y: 1450 },
        { x: 800, y: 1500 },
        { x: 1200, y: 1350 },
        { x: 1000, y: 1100 },
        { x: 600, y: 1150 },
        { x: 350, y: 950 },
        { x: 600, y: 750 },
        { x: 1000, y: 780 },
        { x: 1500, y: 900 },
        { x: 1900, y: 1050 },
        { x: 2300, y: 1150 },
        { x: 2600, y: 950 },
        { x: 2400, y: 700 },
        { x: 2000, y: 600 },
        { x: 1500, y: 500 },
        { x: 1200, y: 300 },
        { x: 1500, y: 150 },
        { x: 1900, y: 220 },
        { x: 2300, y: 300 },
        { x: 2600, y: 150 }
    ],
    // Spiral Yo'l
    spiral: [
        { x: 150, y: 150 },
        { x: 1400, y: 100 },
        { x: 2650, y: 150 },
        { x: 2600, y: 1650 },
        { x: 1400, y: 1700 },
        { x: 200, y: 1650 },
        { x: 350, y: 450 },
        { x: 1400, y: 350 },
        { x: 2400, y: 450 },
        { x: 2300, y: 1350 },
        { x: 1400, y: 1400 },
        { x: 550, y: 1300 },
        { x: 600, y: 700 },
        { x: 1400, y: 650 },
        { x: 2050, y: 750 },
        { x: 1950, y: 1100 },
        { x: 1400, y: 1150 },
        { x: 950, y: 1050 },
        { x: 1000, y: 850 },
        { x: 1400, y: 900 }
    ],
    // Sinsimon Kometalar
    wave: [
        { x: 120, y: 1450 },
        { x: 450, y: 1050 },
        { x: 800, y: 1450 },
        { x: 1150, y: 1050 },
        { x: 1500, y: 1450 },
        { x: 1850, y: 1050 },
        { x: 2200, y: 1450 },
        { x: 2650, y: 1050 },
        { x: 2650, y: 650 },
        { x: 2200, y: 250 },
        { x: 1850, y: 650 },
        { x: 1500, y: 250 },
        { x: 1150, y: 650 },
        { x: 800, y: 250 },
        { x: 450, y: 650 },
        { x: 150, y: 250 }
    ],
    // Urgut Mahallalari xaritasi (Loop ko'rinishidagi katta aylana yo'lak)
    urgut: [
        { x: 150, y: 1550 },   // Start: Urgut Darvozasi
        { x: 300, y: 1200 },   // Krug
        { x: 500, y: 800 },    // Bayrog'
        { x: 400, y: 400 },    // Yuqori Bozor
        { x: 800, y: 300 },    // Torinjak
        { x: 1200, y: 450 },   // Ispanza
        { x: 1500, y: 200 },   // Toshariq
        { x: 1800, y: 500 },   // Ko'tarma
        { x: 2200, y: 300 },   // Yangihayot
        { x: 2600, y: 600 },   // Satang
        { x: 2400, y: 1000 },  // Paxmob
        { x: 2100, y: 1400 },  // Chag'izmon
        { x: 1700, y: 1200 },  // Krug
        { x: 1300, y: 1450 },  // Urgut City
        { x: 800, y: 1500 },   // Yangibozor (Finish)
        { x: 2600, y: 1550 }
    ]
};

// Catmull-Rom spline nuqtalarini yig'ish yordamchisi
function getSplinePoint(points, t) {
    const n = points.length - 1;
    let i = Math.floor(t * n);
    if (i >= n) i = n - 1;
    
    const localT = (t * n) - i;
    
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(n, i + 1)];
    const p3 = points[Math.min(n, i + 2)];
    
    const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * localT +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * localT * localT +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * localT * localT * localT
    );
    
    const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * localT +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * localT * localT +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * localT * localT * localT
    );
    
    return { x, y };
}

// Arc-Length parameterization spline (tekis oraliq)
function getEquidistantSplinePoints(controlPoints, count) {
    const tempSamples = 1500;
    const sampledPoints = [];
    let totalLength = 0;
    const lengths = [0];

    let prev = getSplinePoint(controlPoints, 0);
    sampledPoints.push(prev);

    for (let i = 1; i <= tempSamples; i++) {
        const curr = getSplinePoint(controlPoints, i / tempSamples);
        const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        totalLength += dist;
        lengths.push(totalLength);
        sampledPoints.push(curr);
        prev = curr;
    }

    const equidistantPoints = [];
    const stepLength = totalLength / (count - 1);

    for (let i = 0; i < count; i++) {
        const targetDist = i * stepLength;
        let low = 0;
        let high = lengths.length - 1;
        while (low < high - 1) {
            const mid = Math.floor((low + high) / 2);
            if (lengths[mid] < targetDist) {
                low = mid;
            } else {
                high = mid;
            }
        }

        const ratio = (targetDist - lengths[low]) / (lengths[high] - lengths[low] || 1);
        const pt1 = sampledPoints[low];
        const pt2 = sampledPoints[high];
        
        equidistantPoints.push({
            x: pt1.x + (pt2.x - pt1.x) * ratio,
            y: pt1.y + (pt2.y - pt1.y) * ratio
        });
    }

    return equidistantPoints;
}

// 4. MAP LANDMARKS AND SECTOR GENERATION
// Urgut mahallalari ro'yxati
const urgutMilestones = [
    "Urgut Darvozasi (Boshlanish)",
    "Krug chorrahasi",
    "Mahalla Bayrog'i",
    "Yuqori bozor",
    "Torinjak mahallasi",
    "Ispanza bog'lari",
    "Toshariq arig'i",
    "Ko'tarma tepaligi",
    "Yangihayot ko'chasi",
    "Satang guzari",
    "Paxmob bulog'i",
    "Chag'izmon mahallasi",
    "Krug markazi",
    "Urgut City massivi",
    "Yangibozor bozori (Marra)"
];

function getSectorName(index, totalSteps) {
    if (gameConfig.mapType === 'urgut') {
        const milestoneIndex = Math.min(urgutMilestones.length - 1, Math.floor((index / totalSteps) * urgutMilestones.length));
        return urgutMilestones[milestoneIndex];
    }
    // Standart Kosmik sayyoralar nomlari
    if (index === 0) return "Yer sayyorasi (Start)";
    const ratio = index / totalSteps;
    if (ratio <= 0.08) return "Yer Orbitasi";
    if (ratio <= 0.16) return "Oy Cratyerlari";
    if (ratio <= 0.24) return "Merkuriy maydoni";
    if (ratio <= 0.32) return "Venera Gazlari";
    if (ratio <= 0.40) return "Asteroidlar Belbogi";
    if (ratio <= 0.48) return "Mars Qizil sahrosi";
    if (ratio <= 0.56) return "Orbital Koinot Stansiyasi";
    if (ratio <= 0.64) return "Yupiter bo'ronli buluti";
    if (ratio <= 0.72) return "Saturn Halqa yo'li";
    if (ratio <= 0.80) return "Uran Muzliklari";
    if (ratio <= 0.88) return "Neptun bag'ri";
    if (ratio <= 0.94) return "Galaktika Wormhole";
    if (ratio <= 0.98) return "Katta Qora Tuynuk";
    return "Galaktika Core (Marra)";
}

function getSectorColor(index, totalSteps) {
    if (gameConfig.mapType === 'urgut') {
        // Urgut mahallalari uchun mahalliy yashil/milliy ranglar sxemasi
        const colors = ["#2e7d32", "#1565c0", "#f57c00", "#d84315", "#ad1457", "#6a1b9a", "#00838f", "#ef6c00"];
        return colors[index % colors.length];
    }
    const ratio = index / totalSteps;
    if (ratio <= 0.1) return "var(--color-earth)";
    if (ratio <= 0.2) return "var(--color-moon)";
    if (ratio <= 0.3) return "var(--color-mercury)";
    if (ratio <= 0.4) return "var(--color-venus)";
    if (ratio <= 0.5) return "var(--color-asteroid)";
    if (ratio <= 0.6) return "var(--color-mars)";
    if (ratio <= 0.7) return "var(--color-neptune)";
    if (ratio <= 0.8) return "var(--color-saturn)";
    if (ratio <= 0.9) return "var(--color-uranus)";
    return "var(--color-finish)";
}

// Maxsus katak shablonlari (Bonus va Tuzoqlar)
const specialTileTemplates = {
    rocket: { type: "rocket", move: 8, title: "Tezlanish", icon: "🚀", text: "Quyosh shamolini ushladi! 8 qadam oldinga." },
    warpgate: { type: "warpgate", move: 12, title: "Warp Darvozasi", icon: "⭐", text: "Giper-sakrash faol! 12 qadam oldinga." },
    alienHelp: { type: "alienHelp", move: 5, title: "Koinot Yordami", icon: "🛸", text: "Nurlar yordamida 5 qadam oldinga." },
    meteor: { type: "meteor", move: -4, title: "Meteor Strike", icon: "☄", text: "Asteroid to'qnashuvi tufayli 4 qadam ortga." },
    blackhole: { type: "blackhole", move: -12, title: "Qora Tuynuk", icon: "🕳", text: "Kuchli gravitatsiya! 12 qadam ortga tortildi." },
    wormhole: { type: "wormhole", move: 15, title: "Portal Sakrashi", icon: "🌌", text: "Teleport tunnelidan o'tdingiz. 15 qadam oldinga!" },
    spacestation: { type: "spacestation", move: 0, title: "Space Station", icon: "🛰", text: "Zaryadlandi! Zarni yana bir marta tekin tashlang." },
    frozen: { type: "frozen", move: 0, title: "Muzlagan Hudud", icon: "❄", text: "Muzlab qoldingiz! Navbat o'tkaziladi." },
    storm: { type: "storm", move: 0, title: "Kuchli Bo'ron", icon: "🔥", text: "Bo'ron tufayli oxirgi checkpointga qayting!" },
    crystal: { type: "crystal", move: 6, title: "Tezlik Kristalli", icon: "💎", text: "Tezlik kristalli faollashdi. 6 qadam oldinga." },
    satellite: { type: "satellite", move: 3, title: "Yo'ldosh Gravitatsiyasi", icon: "📡", text: "Gravitatsion yordam faol. 3 qadam oldinga." },
    supernova: { type: "supernova", move: 0, title: "Supernova Portlashi", icon: "🌠", text: "Portlash to'lqini! Orqadagi barcha o'yinchilar +2 qadam oladilar." },
    trap3: { type: "trap3", move: -3, title: "Tuzoq", icon: "🧲", text: "Maydon to'siqlari! 3 qadam ortga." },
    trap5: { type: "trap5", move: -5, title: "Chiqindilar", icon: "🗑️", text: "Yo'l yopildi. 5 qadam ortga." },
    trap6: { type: "trap6", move: -6, title: "Gravitatsion To'lqin", icon: "🌊", text: "To'lqin sizni orqaga surdi. 6 qadam ortga." },
    bonus4: { type: "bonus4", move: 4, title: "Quyosh Batareyasi", icon: "☀️", text: "Energiya manbai faol. 4 qadam oldinga." },
    bonus6: { type: "bonus6", move: 6, title: "Ion Dvigatel", icon: "⚡", text: "Ion oqimi bilan tezlashdingiz." }
};

let checkpoints = [];

// Tasodifiy maxsus kataklar taqsimotini hisoblash
// Kamida MIN_GAP qadam oraliq qo'yiladi, tuzoqlar va bonuslar tenglikda tarqaladi
function generateRandomHazards(level, numTiles) {
    const distribution = {};
    let count = 35;
    if (level === 'low')    count = Math.round(numTiles * 0.12);
    if (level === 'medium') count = Math.round(numTiles * 0.20);
    if (level === 'high')   count = Math.round(numTiles * 0.28);

    const MIN_GAP = 5; // Har ikki maxsus katak orasida kamida 5 ta oddiy katak bo'lishi shart

    // Checkpoint va boshlanish/tugash kataklar hech qachon maxsus bo'lmasligi kerak
    const forbidden = new Set(checkpoints);
    forbidden.add(0);
    forbidden.add(numTiles);

    // 1-bosqich: tekis tarqalgan nomzod indekslar ro'yxati hosil qilamiz
    // Butun yo'lni bo'laklarga bo'lib har biridan bitta nomzod olamiz
    const candidatePool = [];
    const segmentSize = Math.floor(numTiles / count);

    for (let seg = 0; seg < count; seg++) {
        const segStart = seg * segmentSize + 1;
        const segEnd = Math.min((seg + 1) * segmentSize - 1, numTiles - 1);
        // Har bir segmentning tasodifiy nuqtasini ol
        const candidates = [];
        for (let i = segStart; i <= segEnd; i++) {
            if (!forbidden.has(i)) candidates.push(i);
        }
        if (candidates.length > 0) {
            const picked = candidates[Math.floor(Math.random() * candidates.length)];
            candidatePool.push(picked);
        }
    }

    // 2-bosqich: saralash va MIN_GAP shartini tekshirish bilan filtrlash
    candidatePool.sort((a, b) => a - b);

    const selected = [];
    let lastPlaced = -MIN_GAP;
    for (const idx of candidatePool) {
        if (idx - lastPlaced >= MIN_GAP) {
            selected.push(idx);
            lastPlaced = idx;
        }
    }

    // 3-bosqich: Bonus va tuzoqlarni tenglik bilan birma-bir qo'yish
    const bonusTypes  = ["rocket", "warpgate", "alienHelp", "wormhole", "crystal", "satellite", "spacestation", "bonus4", "bonus6"];
    const hazardTypes = ["meteor", "blackhole", "trap3", "trap5", "trap6", "frozen", "storm", "supernova"];

    selected.forEach((idx, i) => {
        if (i % 2 === 0) {
            distribution[idx] = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        } else {
            distribution[idx] = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
        }
    });

    return distribution;
}

// 5. GAME STATE
const tokens = ["👨‍🚀", "🚀", "👽", "🛸"];
const playerColors = ["var(--p1-color)", "var(--p2-color)", "var(--p3-color)", "var(--p4-color)"];

let gameConfig = {
    playersCount: 2,
    players: [],
    mapType: 'serpentine',
    themeType: 'space',
    totalSteps: 150,
    diceMode: 'auto',
    hazardLevel: 'medium'
};

let activePlayerIdx = 0;
let turnCount = 1;
let isRolling = false;
let isMoving = false;
let boardZoom = 0.7;
let cameraPos = { x: 0, y: 0 };
let stepTimeoutId = null;
let skipCurrentMoveFn = null;

// 6. VIEWPORT VA CAMERA
const boardViewport = document.getElementById("board-viewport");
const boardContainer = document.getElementById("board-container");

function updateViewportTransform() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetX = vw / 2 - cameraPos.x * boardZoom;
    const targetY = vh / 2 - cameraPos.y * boardZoom;
    
    boardContainer.style.transform = `translate(${targetX}px, ${targetY}px) scale(${boardZoom})`;
    boardContainer.style.setProperty('--cam-x', `${targetX}px`);
    boardContainer.style.setProperty('--cam-y', `${targetY}px`);
}

function panToCoordinate(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        console.warn("Invalid coordinate pan request:", x, y);
        return;
    }
    boardContainer.classList.add("smooth-pan");
    cameraPos.x = x;
    cameraPos.y = y;
    updateViewportTransform();
    
    setTimeout(() => {
        boardContainer.classList.remove("smooth-pan");
    }, 400);
}

// Drag & Pan boshqaruvi
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let cameraStart = { x: 0, y: 0 };

boardViewport.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    cameraStart.x = cameraPos.x;
    cameraStart.y = cameraPos.y;
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) / boardZoom;
    const dy = (e.clientY - dragStart.y) / boardZoom;
    cameraPos.x = cameraStart.x - dx;
    cameraPos.y = cameraStart.y - dy;
    updateViewportTransform();
});

window.addEventListener("mouseup", () => isDragging = false);

// Touch drag
boardViewport.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    dragStart.x = e.touches[0].clientX;
    dragStart.y = e.touches[0].clientY;
    cameraStart.x = cameraPos.x;
    cameraStart.y = cameraPos.y;
});

window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const dx = (e.touches[0].clientX - dragStart.x) / boardZoom;
    const dy = (e.touches[0].clientY - dragStart.y) / boardZoom;
    cameraPos.x = cameraStart.x - dx;
    cameraPos.y = cameraStart.y - dy;
    updateViewportTransform();
});

window.addEventListener("touchend", () => isDragging = false);
window.addEventListener("resize", updateViewportTransform);

document.getElementById("btn-zoom-in").addEventListener("click", () => {
    boardZoom = Math.min(1.5, boardZoom + 0.1);
    updateViewportTransform();
});
document.getElementById("btn-zoom-out").addEventListener("click", () => {
    boardZoom = Math.max(0.4, boardZoom - 0.1);
    updateViewportTransform();
});
document.getElementById("btn-focus-player").addEventListener("click", () => {
    const currP = gameConfig.players[activePlayerIdx];
    const tile = boardTiles[currP.position];
    panToCoordinate(tile.x, tile.y);
});

// 7. DOSKA GENERATSIYASI (VISUAL BOARD GENERATOR)
function buildBoardData() {
    boardTiles = [];
    const ctrlPoints = mapControlPoints[gameConfig.mapType];
    
    // Checkpointlarni dinamik aniqlash (Har 25 qadamda, lekin oxirgi qadamdan kamida 5 ta uzoq)
    checkpoints = [];
    for (let cp = 25; cp < gameConfig.totalSteps; cp += 25) {
        if (gameConfig.totalSteps - cp >= 5) {
            checkpoints.push(cp);
        }
    }

    const equidistantCoords = getEquidistantSplinePoints(ctrlPoints, gameConfig.totalSteps + 1);
    const distribution = generateRandomHazards(gameConfig.hazardLevel, gameConfig.totalSteps);

    for (let i = 0; i <= gameConfig.totalSteps; i++) {
        const name = getSectorName(i, gameConfig.totalSteps);
        const color = getSectorColor(i, gameConfig.totalSteps);
        const coord = equidistantCoords[i];

        const tile = {
            number: i,
            x: Math.round(coord.x),
            y: Math.round(coord.y),
            name: name,
            color: color,
            type: "normal",
            move: 0,
            title: "",
            icon: "",
            text: "",
            isCheckpoint: checkpoints.includes(i)
        };

        if (distribution[i]) {
            const spec = specialTileTemplates[distribution[i]];
            tile.type = spec.type;
            tile.move = spec.move;
            tile.title = spec.title;
            tile.icon = spec.icon;
            tile.text = spec.text;
        }

        if (i === 0) {
            tile.type = "start";
        } else if (i === gameConfig.totalSteps) {
            tile.type = "finish";
        }

        boardTiles.push(tile);
    }
}

function renderBoard() {
    const tilesLayer = document.getElementById("tiles-layer");
    tilesLayer.innerHTML = "";
    
    const boardSvg = document.getElementById("board-path-svg");
    boardSvg.innerHTML = `
        <path id="path-bg" class="board-path-line" d=""></path>
        <path id="path-flow" class="board-path-line-dash" d=""></path>
    `;
    const pathBg = document.getElementById("path-bg");
    const pathFlow = document.getElementById("path-flow");
    
    let pathData = "";

    boardTiles.forEach((tile, index) => {
        if (index === 0) {
            pathData += `M ${tile.x} ${tile.y}`;
        } else {
            pathData += ` L ${tile.x} ${tile.y}`;
        }

        const tileEl = document.createElement("div");
        tileEl.className = "tile";
        if (tile.isCheckpoint) tileEl.classList.add("tile-checkpoint");
        
        tileEl.style.left = `${tile.x}px`;
        tileEl.style.top = `${tile.y}px`;
        tileEl.style.color = tile.color;
        tileEl.style.border = `2px solid ${tile.color}`;
        tileEl.style.background = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(0,0,0,0.85))`;
        tileEl.style.boxShadow = `inset 0 0 10px rgba(255,255,255,0.1), 0 0 10px ${tile.color}33`;

        if (tile.isCheckpoint) {
            tileEl.innerHTML = `<span>CP ${tile.number}</span>`;
        } else {
            tileEl.innerHTML = `<span>${tile.number}</span>`;
        }

        if (tile.icon) {
            const badge = document.createElement("div");
            badge.className = "tile-icon";
            badge.innerText = tile.icon;
            tileEl.appendChild(badge);
        }

        const tooltip = document.createElement("span");
        tooltip.className = "tooltip-content";
        tooltip.innerHTML = `
            <strong>${tile.name}</strong><br>
            ${tile.title ? `<span style="color:${tile.color}">${tile.title} (${tile.icon})</span><br>${tile.text}` : 'Koinot tinch hududi'}
        `;
        tileEl.appendChild(tooltip);

        tileEl.addEventListener("mouseenter", () => playSound("snd-hover", "hover"));

        tilesLayer.appendChild(tileEl);
    });

    pathBg.setAttribute("d", pathData);
    pathFlow.setAttribute("d", pathData);

    renderDecorations();
}

function renderDecorations() {
    const decoLayer = document.getElementById("decorations-layer");
    decoLayer.innerHTML = "";
    
    if (gameConfig.mapType === 'urgut') {
        const urgutImages = [
            { name: "Urgut Darvozasi", file: "urgut_darvozasi.png" },
            { name: "Krug", file: "krug.png" },
            { name: "Bayrog'", file: "bayrog.png" },
            { name: "Yuqori Bozor", file: "yuqori_bozor.png" },
            { name: "Torinjak", file: "torinjak.png" },
            { name: "Ispanza", file: "ispanza.png" },
            { name: "Toshariq", file: "toshariq.png" },
            { name: "Ko'tarma", file: "kotarma.png" },
            { name: "Yangihayot", file: "yangihayot.png" },
            { name: "Satang", file: "satang.png" },
            { name: "Paxmob", file: "paxmob.png" },
            { name: "Chag'izmon", file: "chagizmon.png" },
            { name: "Krug", file: "krug.png" },
            { name: "Urgut City", file: "urgut_city.png" },
            { name: "Yangibozor", file: "yangibozor.png" }
        ];

        urgutImages.forEach((img, idx) => {
            const tileIdx = Math.round((idx / (urgutImages.length - 1)) * gameConfig.totalSteps);
            const tile = boardTiles[tileIdx];
            if (!tile) return;

            const cardEl = document.createElement("div");
            cardEl.className = "urgut-deco-card";

            const imgEl = document.createElement("img");
            imgEl.src = `images/${img.file}`;
            imgEl.alt = img.name;

            const labelEl = document.createElement("span");
            labelEl.className = "urgut-deco-label";
            labelEl.innerText = img.name;

            cardEl.appendChild(imgEl);
            cardEl.appendChild(labelEl);

            // Alternating side offsets to avoid overlaps
            const offsetVal = 105;
            const angle = idx % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
            cardEl.style.left = `${tile.x + Math.cos(angle) * offsetVal}px`;
            cardEl.style.top = `${tile.y + Math.sin(angle) * offsetVal}px`;

            decoLayer.appendChild(cardEl);
        });
        return;
    }

    // Mavzuga ko'ra bezak emojilar ro'yxati
    let emojis = ["🪐", "🌌", "👽", "🛸", "☄️", "👨‍🚀", "🕳️"];
    if (gameConfig.themeType === 'jungle') {
        emojis = ["🦁", "🌴", "🐍", "🐒", "🐊", "🎋", "🌿", "🦋", "🌳"];
    } else if (gameConfig.themeType === 'cities') {
        emojis = ["🏙️", "🗼", "🗽", "🏰", "🎡", "🏎️", "🗼", "🚕", "🌇"];
    }

    const decorPositions = [
        { x: 300, y: 1100, size: 160 },
        { x: 750, y: 1250, size: 200 },
        { x: 1300, y: 1200, size: 180 },
        { x: 2200, y: 1050, size: 240 },
        { x: 1800, y: 800, size: 180 },
        { x: 1200, y: 550, size: 220 },
        { x: 1900, y: 350, size: 150 },
        { x: 2400, y: 150, size: 180 },
        { x: 900, y: 200, size: 200 }
    ];

    decorPositions.forEach((p, idx) => {
        const div = document.createElement("div");
        div.className = "deco-planet";
        div.style.left = `${p.x}px`;
        div.style.top = `${p.y}px`;
        div.style.width = `${p.size}px`;
        div.style.height = `${p.size}px`;

        const emoji = emojis[idx % emojis.length];

        div.innerHTML = `
            <div style="font-size: ${p.size * 0.4}px; text-align: center; line-height: ${p.size}px; filter: drop-shadow(0 0 15px var(--color-uranus))">
                ${emoji}
            </div>
        `;
        decoLayer.appendChild(div);
    });
}

// 8. SETUP EKRANI LOAD
function initSetup() {
    const list = document.getElementById("players-config-list");
    list.innerHTML = "";
    
    for (let i = 0; i < gameConfig.playersCount; i++) {
        const row = document.createElement("div");
        row.className = "config-row";
        
        const tokenIdx = i % tokens.length;
        
        row.innerHTML = `
            <div style="color: ${playerColors[i]}; font-family: var(--font-sci-fi); font-weight: bold;">
                Explorer ${i + 1}
            </div>
            <input type="text" value="Explorer ${i + 1}" id="p-name-${i}">
            <div class="token-selector">
                ${tokens.map((tok, idx) => `
                    <div class="token-opt ${idx === tokenIdx ? 'selected' : ''}" data-player="${i}" data-index="${idx}">${tok}</div>
                `).join('')}
            </div>
        `;
        list.appendChild(row);
    }

    document.querySelectorAll(".token-opt").forEach(opt => {
        opt.addEventListener("click", function() {
            const playerRowIdx = parseInt(this.getAttribute("data-player"));
            const items = list.querySelectorAll(`.token-opt[data-player="${playerRowIdx}"]`);
            items.forEach(el => el.classList.remove("selected"));
            this.classList.add("selected");
        });
    });
}

// Sozlamalar menyusi elementlari bog'lanishi
document.querySelectorAll(".btn-count").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-count").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.playersCount = parseInt(this.getAttribute("data-count"));
        initSetup();
    });
});

document.querySelectorAll(".btn-map").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-map").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.mapType = this.getAttribute("data-map");
    });
});

document.querySelectorAll(".btn-theme").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-theme").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.themeType = this.getAttribute("data-theme");
    });
});

document.querySelectorAll(".btn-steps").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-steps").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.totalSteps = parseInt(this.getAttribute("data-steps"));
    });
});

document.querySelectorAll(".btn-dice-mode").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-dice-mode").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.diceMode = this.getAttribute("data-mode");
    });
});

document.querySelectorAll(".btn-hazard").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".btn-hazard").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        gameConfig.hazardLevel = this.getAttribute("data-level");
    });
});

initSetup();

// O'yinni boshlash
document.getElementById("start-game-btn").addEventListener("click", () => {
    gameConfig.players = [];
    for (let i = 0; i < gameConfig.playersCount; i++) {
        const nameInput = document.getElementById(`p-name-${i}`);
        const activeTokenEl = document.querySelector(`.token-opt[data-player="${i}"].selected`);
        const tokenChar = activeTokenEl ? tokens[parseInt(activeTokenEl.getAttribute("data-index"))] : tokens[i];
        
        gameConfig.players.push({
            id: i,
            name: nameInput.value || `Explorer ${i + 1}`,
            color: playerColors[i],
            token: tokenChar,
            position: 0,
            checkpoint: 0,
            skipNextTurn: false
        });
    }

    const tokensLayer = document.getElementById("tokens-layer");
    tokensLayer.innerHTML = "";
    gameConfig.players.forEach(p => {
        const el = document.createElement("div");
        el.className = "player-token";
        el.id = `token-${p.id}`;
        el.style.color = p.color;
        el.style.borderColor = p.color;
        el.style.boxShadow = `0 10px 15px rgba(0, 0, 0, 0.5), 0 0 15px ${p.color}`;
        el.innerText = p.token;
        tokensLayer.appendChild(el);
    });

    // Vizual mavzuni qo'llash
    document.body.className = `theme-${gameConfig.themeType}` + (isLightMode ? " light-mode" : "");
    const stars = document.querySelector(".stars-container");
    if (gameConfig.themeType === 'space') {
        stars.style.display = "block";
    } else {
        stars.style.display = "block"; // Background gradientlar ishlashi uchun stars ko'rinishda qoladi
    }

    // Zarik rejimi
    const diceScene = document.getElementById("dice-scene");
    const autoRollBtn = document.getElementById("roll-dice-btn");
    const manualPanel = document.getElementById("manual-dice-panel");

    if (gameConfig.diceMode === 'manual') {
        diceScene.classList.add("hidden");
        autoRollBtn.classList.add("hidden");
        manualPanel.classList.remove("hidden");
    } else {
        diceScene.classList.remove("hidden");
        autoRollBtn.classList.remove("hidden");
        manualPanel.classList.add("hidden");
    }

    document.getElementById("setup-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");
    document.querySelector(".settings-dropdown").classList.remove("hidden");
    
    activePlayerIdx = 0;
    turnCount = 1;
    isRolling = false;
    isMoving = false;
    
    buildBoardData();
    renderBoard();
    updateHUD();
    syncTokenPositions(true);
});

// 9. GAMEPLAY ACTIONS
function updateHUD() {
    document.getElementById("hud-turn-count").innerText = turnCount;
    const curP = gameConfig.players[activePlayerIdx];
    document.getElementById("current-player-name").innerText = curP.name;
    document.getElementById("current-player-name").style.color = curP.color;
    document.getElementById("current-player-token-indicator").innerText = curP.token;
    
    const lbSorted = [...gameConfig.players].sort((a, b) => b.position - a.position);
    const lbContainer = document.getElementById("hud-leaderboard");
    lbContainer.innerHTML = lbSorted.map((p, index) => `
        <div class="lbl-item" style="border-left-color: ${p.color}">
            <span>${index + 1}.</span>
            <span>${p.token}</span>
            <span style="font-weight: bold; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</span>
            <span style="color:#00f0ff;">S:${p.position}</span>
        </div>
    `).join('');
}

function syncTokenPositions(focusActive = false) {
    if (!boardTiles || boardTiles.length === 0) return;
    
    gameConfig.players.forEach((p, idx) => {
        const el = document.getElementById(`token-${p.id}`);
        if (!el) return;
        
        // Ensure position is within valid range
        const pos = Math.max(0, Math.min(boardTiles.length - 1, p.position));
        const tile = boardTiles[pos];
        if (!tile) return;
        
        let offsetX = 0;
        let offsetY = 0;
        const overlaps = gameConfig.players.filter(o => o.position === p.position && o.id < p.id);
        if (overlaps.length > 0) {
            const angle = (overlaps.length * Math.PI) / 2;
            offsetX = Math.cos(angle) * 16;
            offsetY = Math.sin(angle) * 16;
        }

        el.style.left = `${tile.x + offsetX}px`;
        el.style.top = `${tile.y + offsetY}px`;
        
        if (idx === activePlayerIdx && focusActive) {
            panToCoordinate(tile.x, tile.y);
        }
    });
}

// 10. ZAR TASHLLASH (ROLL DICE LOOPS)
const rollBtn = document.getElementById("roll-dice-btn");
const diceCube = document.getElementById("dice-cube");

rollBtn.addEventListener("click", () => {
    if (isRolling || isMoving) return;
    triggerRollProcess();
});

document.querySelectorAll(".btn-manual-roll").forEach(btn => {
    btn.addEventListener("click", function() {
        if (isMoving || isRolling) return;
        const value = parseInt(this.getAttribute("data-val"));
        
        const curP = gameConfig.players[activePlayerIdx];
        if (curP.skipNextTurn) {
            curP.skipNextTurn = false;
            logEvent(`${curP.name} muzlab qolgan edi. Navbatni o'tkazib yuboradi!`);
            nextTurn();
            return;
        }

        logEvent(`${curP.name} haqiqiy zar tashladi va ${value} chiqdi!`);
        movePlayer(activePlayerIdx, value);
    });
});

function triggerRollProcess() {
    const curP = gameConfig.players[activePlayerIdx];
    if (curP.skipNextTurn) {
        curP.skipNextTurn = false;
        logEvent(`${curP.name} muzlab qolgan edi. Navbatni o'tkazib yuboradi!`);
        nextTurn();
        return;
    }

    isRolling = true;
    playSound("snd-dice", "dice");
    diceCube.className = "cube rolling";
    
    setTimeout(() => {
        const rollResult = Math.floor(Math.random() * 6) + 1;
        diceCube.className = `cube show-${rollResult}`;
        isRolling = false;
        
        logEvent(`${curP.name} zarni tashladi: ${rollResult}!`);
        movePlayer(activePlayerIdx, rollResult);
    }, 1000);
}

// 11. HARAKATLANTIRISH VA TUZOQLAR
function getFinalMoveState(player, steps) {
    const direction = steps >= 0 ? 1 : -1;
    let finalPos = player.position;
    let finalCheckpoint = player.checkpoint;
    let hitCheckpointBarrier = false;
    
    for (let i = 1; i <= Math.abs(steps); i++) {
        let nextPos = finalPos + direction;
        if (nextPos < 0) nextPos = 0;
        if (nextPos > gameConfig.totalSteps) nextPos = gameConfig.totalSteps;
        
        if (direction < 0 && nextPos < finalCheckpoint) {
            hitCheckpointBarrier = true;
            break;
        }
        
        finalPos = nextPos;
        if (checkpoints.includes(finalPos) && finalPos > finalCheckpoint) {
            finalCheckpoint = finalPos;
        }
    }
    return { finalPos, finalCheckpoint, hitCheckpointBarrier };
}

function movePlayer(playerIdx, steps, isChainMove = false) {
    isMoving = true;
    const p = gameConfig.players[playerIdx];
    let stepsLeft = Math.abs(steps);
    const direction = steps >= 0 ? 1 : -1;
    
    // Pre-calculate final target state for immediate skip
    const finalState = getFinalMoveState(p, steps);
    
    skipCurrentMoveFn = function() {
        if (stepTimeoutId) {
            clearTimeout(stepTimeoutId);
            stepTimeoutId = null;
        }
        
        p.position = finalState.finalPos;
        p.checkpoint = finalState.finalCheckpoint;
        
        if (finalState.hitCheckpointBarrier) {
            logEvent(`Checkpoint ${p.checkpoint} sizni ortga qaytishdan himoya qildi!`);
        }
        
        skipCurrentMoveFn = null;
        isMoving = false;
        
        syncTokenPositions(true);
        updateHUD();
        
        if (p.position === gameConfig.totalSteps) {
            triggerWinScreen(p);
        } else {
            if (!isChainMove) {
                handleCellLanding(p);
            }
        }
    };
    
    function step() {
        if (stepsLeft <= 0) {
            isMoving = false;
            skipCurrentMoveFn = null;
            if (!isChainMove) {
                handleCellLanding(p);
            }
            return;
        }

        let nextPos = p.position + direction;

        if (nextPos < 0) nextPos = 0;
        if (nextPos > gameConfig.totalSteps) nextPos = gameConfig.totalSteps;

        if (direction < 0 && nextPos < p.checkpoint) {
            logEvent(`Checkpoint ${p.checkpoint} sizni ortga qaytishdan himoya qildi!`);
            stepsLeft = 0;
            isMoving = false;
            skipCurrentMoveFn = null;
            handleCellLanding(p);
            return;
        }

        p.position = nextPos;
        
        if (checkpoints.includes(p.position) && p.position > p.checkpoint) {
            p.checkpoint = p.position;
            logEvent(`${p.name} o'z joyini Checkpoint ${p.position} da qulfladi!`);
            triggerSpecialCellVisuals(p.position, "var(--color-uranus)");
        }

        playSound("snd-move", "move");
        
        const tokEl = document.getElementById(`token-${p.id}`);
        tokEl.classList.add("moving");
        setTimeout(() => tokEl.classList.remove("moving"), 500);

        syncTokenPositions(true);
        updateHUD();

        if (p.position === gameConfig.totalSteps) {
            isMoving = false;
            skipCurrentMoveFn = null;
            triggerWinScreen(p);
            return;
        }

        stepsLeft--;
        stepTimeoutId = setTimeout(step, 600);
    }

    step();
}

function handleCellLanding(p) {
    const tile = boardTiles[p.position];
    if (tile.type === "normal" || tile.type === "start") {
        nextTurn();
        return;
    }

    logEvent(`${p.name} -> ${tile.title}! ${tile.text}`);
    triggerSpecialCellVisuals(p.position, tile.color);

    setTimeout(() => {
        switch (tile.type) {
            case "rocket":
            case "alienHelp":
            case "satellite":
            case "crystal":
            case "warpgate":
            case "wormhole":
            case "bonus4":
            case "bonus6":
                playSound("snd-boost", "boost");
                movePlayer(activePlayerIdx, tile.move, true);
                setTimeout(nextTurn, Math.abs(tile.move) * 600 + 400);
                break;
            case "meteor":
            case "blackhole":
            case "trap3":
            case "trap5":
            case "trap6":
                playSound("snd-teleport", "teleport");
                movePlayer(activePlayerIdx, tile.move, true);
                setTimeout(nextTurn, Math.abs(tile.move) * 600 + 400);
                break;
            case "spacestation":
                playSound("snd-boost", "boost");
                logEvent(`${p.name} yana bir marta zar tashlaydi!`);
                updateHUD();
                break;
            case "frozen":
                p.skipNextTurn = true;
                nextTurn();
                break;
            case "storm":
                const backSteps = p.checkpoint - p.position;
                if (backSteps === 0) {
                    logEvent(`${p.name} allaqachon Checkpoint ${p.checkpoint} da xavfsiz.`);
                    nextTurn();
                } else {
                    playSound("snd-teleport", "teleport");
                    movePlayer(activePlayerIdx, backSteps, true);
                    setTimeout(nextTurn, Math.abs(backSteps) * 600 + 400);
                }
                break;
            case "supernova":
                playSound("snd-boost", "boost");
                gameConfig.players.forEach(otherP => {
                    if (otherP.id !== p.id && otherP.position < p.position) {
                        otherP.position = Math.min(gameConfig.totalSteps, otherP.position + 2);
                        if (checkpoints.includes(otherP.position) && otherP.position > otherP.checkpoint) {
                            otherP.checkpoint = otherP.position;
                        }
                    }
                });
                syncTokenPositions(false);
                updateHUD();
                nextTurn();
                break;
            default:
                nextTurn();
        }
    }, 1500);
}

function nextTurn() {
    activePlayerIdx = (activePlayerIdx + 1) % gameConfig.playersCount;
    if (activePlayerIdx === 0) {
        turnCount++;
    }
    updateHUD();
    syncTokenPositions(true);
}

function logEvent(msg) {
    const el = document.getElementById("event-text");
    el.innerText = msg;
    el.classList.remove("text-glow");
    void el.offsetWidth; 
    el.classList.add("text-glow");
}

// 12. EFFEKTLAR VA ZARRACHALAR
function triggerSpecialCellVisuals(tileIndex, color) {
    const tile = boardTiles[tileIndex];
    
    boardViewport.classList.add("shake");
    setTimeout(() => boardViewport.classList.remove("shake"), 400);

    const particleCount = 25;
    const parent = document.getElementById("particles-layer");
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.backgroundColor = color;
        p.style.boxShadow = `0 0 10px ${color}`;
        p.style.left = `${tile.x}px`;
        p.style.top = `${tile.y}px`;
        
        const size = Math.random() * 8 + 4;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 150 + 30;
        p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

        parent.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }

    const alertBox = document.createElement("div");
    alertBox.className = "alert-popup text-glow";
    alertBox.style.borderColor = color;
    alertBox.style.boxShadow = `0 0 35px ${color}`;
    alertBox.innerHTML = `<h3>${tile.icon} ${tile.title}</h3>`;
    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.classList.add("active"), 50);
    setTimeout(() => {
        alertBox.classList.remove("active");
        setTimeout(() => alertBox.remove(), 400);
    }, 1500);
}

// 13. G'ALABA
function triggerWinScreen(winner) {
    playSound("snd-winner", "winner");
    
    document.getElementById("winner-name").innerText = winner.name;
    document.getElementById("winner-name").style.color = winner.color;

    const lbSorted = [...gameConfig.players].sort((a, b) => b.position - a.position);
    const winLb = document.getElementById("win-leaderboard");
    winLb.innerHTML = lbSorted.map((p, idx) => `
        <div class="final-ld-row" style="border-left: 4px solid ${p.color}">
            <span>#${idx + 1} ${p.token} ${p.name}</span>
            <span style="color: #00f0ff">Sektor ${p.position}</span>
        </div>
    `).join('');

    createFireworks();
    document.getElementById("win-modal").classList.add("active");
}

function createFireworks() {
    const parent = document.body;
    let fireworksLeft = 15;
    
    function launch() {
        if (fireworksLeft <= 0 || !document.getElementById("win-modal").classList.contains("active")) return;
        
        const fX = Math.random() * window.innerWidth;
        const fY = Math.random() * (window.innerHeight * 0.6);
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        
        for (let i = 0; i < 35; i++) {
            const p = document.createElement("div");
            p.className = "particle";
            p.style.backgroundColor = color;
            p.style.boxShadow = `0 0 10px ${color}`;
            p.style.position = "fixed";
            p.style.left = `${fX}px`;
            p.style.top = `${fY}px`;
            
            const size = Math.random() * 6 + 3;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 200 + 50;
            p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
            p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
            
            parent.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
        
        fireworksLeft--;
        setTimeout(launch, 400);
    }
    
    launch();
}

// 14. NAVIGATSIYA
document.getElementById("btn-restart").addEventListener("click", () => {
    if (!confirm("Haqiqatan ham o'yinni qaytadan boshlamoqchimisiz? Joriy sarguzasht natijalari yo'qoladi.")) {
        return;
    }
    gameConfig.players.forEach(p => {
        p.position = 0;
        p.checkpoint = 0;
        p.skipNextTurn = false;
    });
    activePlayerIdx = 0;
    turnCount = 1;
    isRolling = false;
    isMoving = false;
    
    buildBoardData();
    renderBoard();
    logEvent("Missiya qayta yuklandi!");
    updateHUD();
    syncTokenPositions(true);
});

document.getElementById("btn-new-match").addEventListener("click", () => {
    if (!confirm("Haqiqatan ham yangi missiya sozlamalariga qaytmoqchimisiz?")) {
        return;
    }
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("setup-screen").classList.add("active");
    document.querySelector(".settings-dropdown").classList.add("hidden");
});

document.getElementById("btn-play-again").addEventListener("click", () => {
    document.getElementById("win-modal").classList.remove("active");
    // Qayta boshlashda tasdiqlash shart emas
    gameConfig.players.forEach(p => {
        p.position = 0;
        p.checkpoint = 0;
        p.skipNextTurn = false;
    });
    activePlayerIdx = 0;
    turnCount = 1;
    isRolling = false;
    isMoving = false;
    buildBoardData();
    renderBoard();
    logEvent("Yangi missiya boshlandi!");
    updateHUD();
    syncTokenPositions(true);
});

document.getElementById("btn-win-setup").addEventListener("click", () => {
    document.getElementById("win-modal").classList.remove("active");
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("setup-screen").classList.add("active");
    document.querySelector(".settings-dropdown").classList.add("hidden");
});

const rulesModal = document.getElementById("rules-modal");
document.getElementById("btn-rules").addEventListener("click", () => {
    rulesModal.classList.add("active");
});
document.getElementById("close-rules-btn").addEventListener("click", () => {
    rulesModal.classList.remove("active");
});

document.getElementById("btn-fullscreen").addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
});

document.getElementById("btn-sound").addEventListener("click", function(e) {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    this.innerHTML = soundEnabled ? "🔊 Ovozni o'chirish" : "🔇 Ovozni yoqish";
    playSound("snd-hover", "hover");
});

// Sozlamalar dropdownini yoqish/o'chirish
const btnSettingsToggle = document.getElementById("btn-settings-toggle");
const settingsDropdown = document.getElementById("settings-dropdown-content");

btnSettingsToggle.addEventListener("click", function(e) {
    e.stopPropagation();
    settingsDropdown.classList.toggle("active");
    playSound("snd-hover", "hover");
});

// Tashqariga bosilganda dropdownni yopish
document.addEventListener("click", function() {
    settingsDropdown.classList.remove("active");
});

// Tungi/Kunduzgi rejim boshqaruvi
let isLightMode = false;
document.getElementById("btn-theme-mode").addEventListener("click", function() {
    isLightMode = !isLightMode;
    document.body.classList.toggle("light-mode", isLightMode);
    this.innerText = isLightMode ? "☀️" : "🌙";
    playSound("snd-hover", "hover");
});

// Ekran bosilganda yurish animatsiyasini o'tkazib yuborish (Tezlashtirish)
function handleGlobalSkipRequest(e) {
    // Agar foydalanuvchi biron bir boshqaruv tugmasi yoki sozlamani bossa, o'tkazib yubormaslik
    if (e.target.closest("button") || e.target.closest(".dropdown-content") || e.target.closest(".manual-dice-entry")) {
        return;
    }
    if (isMoving && typeof skipCurrentMoveFn === "function") {
        skipCurrentMoveFn();
    }
}

window.addEventListener("click", handleGlobalSkipRequest);
window.addEventListener("touchstart", handleGlobalSkipRequest, { passive: true });

