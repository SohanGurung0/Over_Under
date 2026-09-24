/* ==========================================================================
   Over Under - 3D Dice Engine, Audio Synthesizer, Stats & Game Logic
   ========================================================================== */

const MIN_BET = 300;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtNrp = (n) => `NRP ${n.toFixed(2)}`;

// Cryptographically secure integer generator [min, max]
const cryptoRandInt = (min, max) => {
  const range = max - min + 1;
  const maxUint = 0xFFFFFFFF;
  const threshold = Math.floor((maxUint + 1) / range) * range;
  const arr = new Uint32Array(1);
  let n;
  do {
    crypto.getRandomValues(arr);
    n = arr[0];
  } while (n >= threshold);
  return min + (n % range);
};

// --------------------------------------------------------------------------
// Sound Synthesizer via Native Web Audio API
// --------------------------------------------------------------------------
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem("over_under_sound") !== "false";
  }

  initContext() {
    if (!this.ctx && typeof AudioContext !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("over_under_sound", String(this.enabled));
    return this.enabled;
  }

  playRoll() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(200 + Math.random() * 260, now + i * 0.08);
      gain.gain.setValueAtTime(0.08, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.06);
    }
  }

  playWin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.12, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });
  }

  playPush() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  playLose() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
}

const sounds = new SoundController();

// --------------------------------------------------------------------------
// Player Statistics & Progression (localStorage)
// --------------------------------------------------------------------------
class GameStats {
  constructor() {
    const raw = localStorage.getItem("over_under_player_stats");
    let parsed = null;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    }
    this.data = parsed || { streak: 0, bestStreak: 0, totalRolls: 0, wins: 0 };
    this.updateHUD();
  }

  save() {
    localStorage.setItem("over_under_player_stats", JSON.stringify(this.data));
    this.updateHUD();
  }

  recordRoll(outcome) { // "win", "lose", "push"
    this.data.totalRolls++;
    if (outcome === "win") {
      this.data.wins++;
      this.data.streak++;
      if (this.data.streak > this.data.bestStreak) {
        this.data.bestStreak = this.data.streak;
      }
    } else if (outcome === "lose") {
      this.data.streak = 0;
    }
    this.save();
  }

  updateHUD() {
    const streakEl = document.getElementById("statStreak");
    const bestEl = document.getElementById("statBestStreak");
    const rollsEl = document.getElementById("statTotalRolls");
    if (streakEl) streakEl.textContent = String(this.data.streak);
    if (bestEl) bestEl.textContent = String(this.data.bestStreak);
    if (rollsEl) rollsEl.textContent = String(this.data.totalRolls);
  }
}

const stats = new GameStats();

// --------------------------------------------------------------------------
// Three.js 3D Scene Setup
// --------------------------------------------------------------------------
const canvas = document.getElementById("sceneCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1325, 16, 34);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
camera.position.set(0, 9.6, 10.8);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xb9ccff, 0.34));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.08);
keyLight.position.set(6, 10, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -10;
scene.add(keyLight);

const rim = new THREE.PointLight(0x58c8ff, 0.33, 25);
rim.position.set(-6, 5, -6);
scene.add(rim);

// Casino Table Felt & Rails
const table = { halfW: 4.9, halfH: 2.45, rail: 0.34, pocketR: 0.24 };
const felt = new THREE.Mesh(
    new THREE.BoxGeometry(table.halfW * 2, 0.2, table.halfH * 2),
    new THREE.MeshStandardMaterial({ color: 0x0f6837, roughness: 0.9, metalness: 0.07 })
);
felt.position.y = -0.1;
felt.receiveShadow = true;
scene.add(felt);

function addRail(w, h, d, x, z) {
  const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: 0x5f3b1d, roughness: 0.57, metalness: 0.14 })
  );
  rail.position.set(x, h / 2 - 0.1, z);
  rail.castShadow = true;
  rail.receiveShadow = true;
  scene.add(rail);
}

const outerW = table.halfW * 2 + table.rail * 2;
const outerH = table.halfH * 2 + table.rail * 2;
addRail(outerW, 0.5, table.rail, 0, table.halfH + table.rail / 2);
addRail(outerW, 0.5, table.rail, 0, -table.halfH - table.rail / 2);
addRail(table.rail, 0.5, outerH, table.halfW + table.rail / 2, 0);
addRail(table.rail, 0.5, outerH, -table.halfW - table.rail / 2, 0);

const pocketPositions = [
  new THREE.Vector2(-table.halfW, -table.halfH),
  new THREE.Vector2(0, -table.halfH - 0.02),
  new THREE.Vector2(table.halfW, -table.halfH),
  new THREE.Vector2(-table.halfW, table.halfH),
  new THREE.Vector2(0, table.halfH + 0.02),
  new THREE.Vector2(table.halfW, table.halfH)
];
const pocketMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.92, metalness: 0.05 });
pocketPositions.forEach((p) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(table.pocketR, table.pocketR * 0.85, 0.22, 20), pocketMat);
  m.position.set(p.x, -0.18, p.y);
  m.receiveShadow = true;
  scene.add(m);
});

function make8BallTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#0d0d0d";
  g.fillRect(0, 0, 256, 256);
  g.beginPath();
  g.fillStyle = "#ffffff";
  g.arc(128, 128, 46, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#111";
  g.font = "bold 78px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("8", 128, 136);
  return new THREE.CanvasTexture(c);
}

const black8 = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 36, 36),
    new THREE.MeshStandardMaterial({ map: make8BallTexture(), roughness: 0.24, metalness: 0.18 })
);
black8.position.set(0, 0.24, 0);
black8.castShadow = true;
black8.receiveShadow = true;
scene.add(black8);

// Dice Texture Generator
function dieFaceTexture(n) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#f7f9ff";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#d8deeb";
  g.lineWidth = 10;
  g.strokeRect(8, 8, 240, 240);
  g.fillStyle = "#1f2636";
  g.font = "bold 150px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(n), 128, 144);
  if (n === 6) {
    g.fillRect(128 - 40, 144 + 50, 80, 8);
  }
  return new THREE.CanvasTexture(c);
}

function createDie() {
  const mats = [
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(1), roughness: 0.28, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(6), roughness: 0.28, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(2), roughness: 0.28, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(5), roughness: 0.28, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(3), roughness: 0.28, metalness: 0.1 }),
    new THREE.MeshStandardMaterial({ map: dieFaceTexture(4), roughness: 0.28, metalness: 0.1 })
  ];
  const d = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mats);
  d.castShadow = true;
  d.receiveShadow = true;
  return d;
}

const dieA = createDie();
const dieB = createDie();
dieA.position.set(-1.2, 0.45, -0.35);
dieB.position.set(1.2, 0.45, 0.35);
scene.add(dieA, dieB);

const FACE_NORMALS = [
  { value: 1, normal: new THREE.Vector3(1, 0, 0) },
  { value: 6, normal: new THREE.Vector3(-1, 0, 0) },
  { value: 2, normal: new THREE.Vector3(0, 1, 0) },
  { value: 5, normal: new THREE.Vector3(0, -1, 0) },
  { value: 3, normal: new THREE.Vector3(0, 0, 1) },
  { value: 4, normal: new THREE.Vector3(0, 0, -1) }
];

function topValueFromQuaternion(q) {
  let best = -Infinity;
  let value = 1;
  const up = new THREE.Vector3(0, 1, 0);
  for (const face of FACE_NORMALS) {
    const n = face.normal.clone().applyQuaternion(q);
    const d = n.dot(up);
    if (d > best) {
      best = d;
      value = face.value;
    }
  }
  return value;
}

function topValueFromMesh(mesh) {
  return topValueFromQuaternion(mesh.quaternion);
}

function buildOrientationsByTop() {
  const byTop = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const seen = new Set();
  for (let xi = 0; xi < 4; xi++) {
    for (let yi = 0; yi < 4; yi++) {
      for (let zi = 0; zi < 4; zi++) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(
            xi * Math.PI / 2,
            yi * Math.PI / 2,
            zi * Math.PI / 2
        ));
        const key = `${q.x.toFixed(3)}|${q.y.toFixed(3)}|${q.z.toFixed(3)}|${q.w.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const top = topValueFromQuaternion(q);
        byTop[top].push(q.clone());
      }
    }
  }

  for (let i = 1; i <= 6; i++) {
    const list = byTop[i];
    list.sort((qa, qb) => {
      const localUp = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0)
      ][i === 1 ? 0 : i === 6 ? 1 : i === 2 ? 2 : i === 5 ? 3 : i === 3 ? 4 : 5];
      const worldUpA = localUp.clone().applyQuaternion(qa);
      const worldUpB = localUp.clone().applyQuaternion(qb);
      return worldUpA.z - worldUpB.z;
    });
    byTop[i] = [list[0]];
  }
  return byTop;
}

const ORIENTATIONS_BY_TOP = buildOrientationsByTop();

// --------------------------------------------------------------------------
// UI & State Management
// --------------------------------------------------------------------------
const ui = {
  homeScreen: document.getElementById("homeScreen"),
  gameScreen: document.getElementById("gameScreen"),
  shopScreen: document.getElementById("shopScreen"),
  startBtn: document.getElementById("startBtn"),
  quitBtn: document.getElementById("quitBtn"),
  bankroll: document.getElementById("bankrollText"),
  rollHistory: document.getElementById("rollHistory"),
  betInput: document.getElementById("betInput"),
  guessHigherBtn: document.getElementById("guessHigherBtn"),
  guessLowerBtn: document.getElementById("guessLowerBtn"),
  guessSevenBtn: document.getElementById("guessSevenBtn"),
  resetBtn: document.getElementById("resetBtn"),
  guessModal: document.getElementById("guessModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  modalBetInput: document.getElementById("modalBetInput"),
  modalCancelBtn: document.getElementById("modalCancelBtn"),
  modalRollBtn: document.getElementById("modalRollBtn"),
  rechargeInput: document.getElementById("rechargeInput"),
  rechargeBtn: document.getElementById("rechargeBtn"),
  backBtn: document.getElementById("backBtn"),
  exitToHomeBtn: document.getElementById("exitToHomeBtn"),
  shopBtn: document.getElementById("shopBtn"),
  soundToggleBtn: document.getElementById("soundToggleBtn"),
  heroPlayNowBtn: document.getElementById("heroPlayNowBtn"),
  navPlayBtn: document.getElementById("navPlayBtn")
};

const state = {
  bankroll: 1000,
  rolling: false,
  guess: "seven",
  pendingGuess: null,
  rollHistory: [],
  reveal: {
    active: false,
    start: 0,
    upMs: 800,
    holdMs: 2400,
    downMs: 800
  },
  rollStart: 0,
  spinDuration: 2200,
  settleDuration: 450,
  a: { result: 1, target: new THREE.Quaternion(), revealQ: new THREE.Quaternion(), base: new THREE.Vector3(-1.2, 0.45, -0.35) },
  b: { result: 1, target: new THREE.Quaternion(), revealQ: new THREE.Quaternion(), base: new THREE.Vector3(1.2, 0.45, 0.35) }
};

const DESKTOP_A_BASE = new THREE.Vector3(-1.2, 0.45, -0.35);
const DESKTOP_B_BASE = new THREE.Vector3(1.2, 0.45, 0.35);
const MOBILE_A_BASE = new THREE.Vector3(-0.7, 0.45, -0.2);
const MOBILE_B_BASE = new THREE.Vector3(0.7, 0.45, 0.2);

function syncUI() {
  if (ui.bankroll) ui.bankroll.textContent = fmtNrp(state.bankroll);
}

function showNotify(msg, type = "info") {
  const c = document.getElementById("toastContainer");
  if (!c) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = "toastOut 0.4s forwards";
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

function triggerConfetti() {
  const colors = ["#c9974d", "#e3b565", "#4a9a6a", "#f3ead9", "#9a3f34"];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 8 + 6) + "px";
    el.style.height = (Math.random() * 4 + 8) + "px";
    el.style.borderRadius = "2px";
    document.body.appendChild(el);

    const duration = Math.random() * 2 + 2;
    el.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], { duration: duration * 1000, easing: "cubic-bezier(0.1, 0, 0.9, 1)" });

    setTimeout(() => el.remove(), duration * 1000);
  }
}

function triggerLoseEffect() {
  const v = document.getElementById("loseVignette");
  if (!v) return;
  v.classList.add("active");
  setTimeout(() => v.classList.remove("active"), 2500);
}

function showScreen(name) {
  if (ui.homeScreen) ui.homeScreen.classList.add("hidden");
  if (ui.gameScreen) ui.gameScreen.classList.add("hidden");
  if (ui.shopScreen) ui.shopScreen.classList.add("hidden");
  if (name === "home" && ui.homeScreen) ui.homeScreen.classList.remove("hidden");
  if (name === "game" && ui.gameScreen) ui.gameScreen.classList.remove("hidden");
  if (name === "shop" && ui.shopScreen) ui.shopScreen.classList.remove("hidden");
  resize();
}

function labelForGuess(guess) {
  if (guess === "higher") return "Higher than 7";
  if (guess === "lower") return "Lower than 7";
  return "Exactly 7";
}

function openGuessModal(guess) {
  if (state.rolling) return;
  state.pendingGuess = guess;
  ui.modalTitle.textContent = "Confirm Guess";
  ui.modalBody.textContent = `You picked "${labelForGuess(guess)}".`;
  ui.modalBetInput.value = ui.betInput.value || String(MIN_BET);
  ui.guessModal.classList.remove("hidden");
}

function closeGuessModal() {
  state.pendingGuess = null;
  if (ui.guessModal) ui.guessModal.classList.add("hidden");
}

function validateBet(bet) {
  if (!Number.isFinite(bet) || bet <= 0) {
    showNotify("Enter a valid positive bet.", "lose");
    return false;
  }
  if (bet < MIN_BET) {
    showNotify(`Minimum bet is NRP ${MIN_BET}.`, "lose");
    return false;
  }
  if (bet > state.bankroll) {
    showNotify("Insufficient virtual bankroll. Please recharge in the Shop.", "lose");
    return false;
  }
  return true;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function startReveal(now) {
  state.reveal.active = true;
  state.reveal.start = now;
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.2);
  state.a.revealQ.copy(tilt).multiply(state.a.target);
  state.b.revealQ.copy(tilt).multiply(state.b.target);
}

function renderRollHistory() {
  if (!ui.rollHistory) return;
  if (!state.rollHistory.length) {
    ui.rollHistory.textContent = "-";
    return;
  }
  ui.rollHistory.innerHTML = state.rollHistory.map((r) =>
      `<span class="roll-pill ${r.outcome}">${r.sum}</span>`
  ).join("");
  ui.rollHistory.scrollLeft = 0;
}

function resetRound() {
  state.rolling = false;
  state.pendingGuess = null;
  state.reveal.active = false;
  state.rollHistory = [];
  renderRollHistory();
  if (ui.betInput) ui.betInput.value = String(MIN_BET);
  closeGuessModal();
  dieA.position.copy(state.a.base);
  dieB.position.copy(state.b.base);
  dieA.rotation.set(0.4, 0.8, 0.2);
  dieB.rotation.set(-0.3, -0.4, 0.5);
}

function resetGame() {
  state.bankroll = 1000;
  syncUI();
  resetRound();
}

function startRoll(guess, bet) {
  if (state.rolling) return false;
  if (!validateBet(bet)) return false;
  state.reveal.active = false;
  state.guess = guess;
  state.bankroll -= bet;
  syncUI();

  state.a.result = cryptoRandInt(1, 6);
  state.b.result = cryptoRandInt(1, 6);
  const listA = ORIENTATIONS_BY_TOP[state.a.result];
  const listB = ORIENTATIONS_BY_TOP[state.b.result];
  state.a.target.copy(listA[cryptoRandInt(0, listA.length - 1)]);
  state.b.target.copy(listB[cryptoRandInt(0, listB.length - 1)]);

  dieA.userData.spin = new THREE.Vector3(
      (Math.random() * 2 + 2.3) * (Math.random() < 0.5 ? -1 : 1),
      (Math.random() * 2 + 2.7) * (Math.random() < 0.5 ? -1 : 1),
      (Math.random() * 2 + 2.3) * (Math.random() < 0.5 ? -1 : 1)
  );
  dieB.userData.spin = new THREE.Vector3(
      (Math.random() * 2 + 2.3) * (Math.random() < 0.5 ? -1 : 1),
      (Math.random() * 2 + 2.7) * (Math.random() < 0.5 ? -1 : 1),
      (Math.random() * 2 + 2.3) * (Math.random() < 0.5 ? -1 : 1)
  );

  state.rolling = true;
  state.rollStart = performance.now();
  sounds.playRoll();
  return true;
}

function finishRoll(now) {
  state.rolling = false;
  const bet = Number(ui.betInput.value) || 0;
  const die1 = topValueFromMesh(dieA);
  const die2 = topValueFromMesh(dieB);
  const sum = die1 + die2;
  let payout = 0;
  let outcome = "lose";

  if (state.guess === "higher") {
    if (sum > 7) {
      payout = bet * 2;
      outcome = "win";
    } else if (sum === 7) {
      payout = bet;
      outcome = "push";
    }
  } else if (state.guess === "lower") {
    if (sum < 7) {
      payout = bet * 2;
      outcome = "win";
    } else if (sum === 7) {
      payout = bet;
      outcome = "push";
    }
  } else if (sum === 7) {
    payout = bet * 4;
    outcome = "win";
  }

  state.bankroll += payout;
  syncUI();
  state.rollHistory.unshift({ sum, outcome });
  renderRollHistory();

  // Record outcome in stats
  stats.recordRoll(outcome);

  const net = payout - bet;
  if (outcome === "win") {
    const mult = state.guess === "seven" ? "4x" : "2x";
    showNotify(`WIN! +${fmtNrp(net)} (${mult} payout)`, "win");
    sounds.playWin();
    triggerConfetti();
  } else if (outcome === "push") {
    showNotify("PUSH! You guessed Higher/Lower and rolled 7. Full stake returned!", "info");
    sounds.playPush();
  } else {
    showNotify(`LOSE. -${fmtNrp(Math.abs(net))}`, "lose");
    sounds.playLose();
    triggerLoseEffect();
  }
  startReveal(now);
}

// --------------------------------------------------------------------------
// Event Listeners & Interactive Handlers
// --------------------------------------------------------------------------
if (ui.startBtn) ui.startBtn.addEventListener("click", () => showScreen("game"));
if (ui.shopBtn) ui.shopBtn.addEventListener("click", () => showScreen("shop"));
if (ui.backBtn) ui.backBtn.addEventListener("click", () => showScreen("home"));
if (ui.exitToHomeBtn) ui.exitToHomeBtn.addEventListener("click", () => showScreen("home"));

// Go to Game Handlers (Header, Hero, Floating & Section Buttons)
function scrollToGameAndStart() {
  showScreen("game");
  const gameSec = document.getElementById("gameArea");
  if (gameSec) {
    gameSec.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.querySelectorAll(".go-to-game-trigger").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToGameAndStart();
  });
});

// Floating Go to Game Button Scroll Observer
const floatingBtn = document.getElementById("floatingGoToGameBtn");
if (floatingBtn) {
  window.addEventListener("scroll", () => {
    const gameArea = document.getElementById("gameArea");
    if (!gameArea) return;
    const rect = gameArea.getBoundingClientRect();
    if (rect.bottom < 150) {
      floatingBtn.classList.add("visible");
    } else {
      floatingBtn.classList.remove("visible");
    }
  }, { passive: true });
}

// Sound Toggle
if (ui.soundToggleBtn) {
  const updateSoundBtn = () => {
    ui.soundToggleBtn.textContent = sounds.enabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
  };
  updateSoundBtn();
  ui.soundToggleBtn.addEventListener("click", () => {
    sounds.toggle();
    updateSoundBtn();
  });
}

// Quit Button
const quitBtn = document.getElementById("quitBtn");
if (quitBtn) {
  const newQuitBtn = quitBtn.cloneNode(true);
  quitBtn.parentNode.replaceChild(newQuitBtn, quitBtn);
  newQuitBtn.addEventListener("click", () => {
    showNotify("Thanks for playing Over Under! You can return to play anytime.", "info");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  });
}

if (ui.rechargeBtn) {
  ui.rechargeBtn.addEventListener("click", () => {
    const amount = Number(ui.rechargeInput.value);
    if (!Number.isFinite(amount) || amount <= 0) return showNotify("Enter a valid recharge amount.", "lose");
    state.bankroll += amount;
    syncUI();
    showNotify(`Recharged +${fmtNrp(amount)} free credits!`, "win");
  });
}

if (ui.guessHigherBtn) ui.guessHigherBtn.addEventListener("click", () => openGuessModal("higher"));
if (ui.guessLowerBtn) ui.guessLowerBtn.addEventListener("click", () => openGuessModal("lower"));
if (ui.guessSevenBtn) ui.guessSevenBtn.addEventListener("click", () => openGuessModal("seven"));
if (ui.modalCancelBtn) ui.modalCancelBtn.addEventListener("click", closeGuessModal);
if (ui.modalRollBtn) {
  ui.modalRollBtn.addEventListener("click", () => {
    const guess = state.pendingGuess;
    const bet = Number(ui.modalBetInput.value);
    if (!guess) return;
    if (!validateBet(bet)) return;
    ui.betInput.value = String(bet);
    closeGuessModal();
    startRoll(guess, bet);
  });
}
if (ui.resetBtn) ui.resetBtn.addEventListener("click", resetRound);

// --------------------------------------------------------------------------
// 3D Animation Loop & Resize
// --------------------------------------------------------------------------
function animateDice(now, dt) {
  if (!state.rolling) {
    if (state.reveal.active) {
      const up = state.reveal.upMs;
      const hold = state.reveal.holdMs;
      const down = state.reveal.downMs;
      const total = up + hold + down;
      const elapsed = now - state.reveal.start;

      let mix = 0;
      if (elapsed < up) {
        mix = easeInOut(clamp(elapsed / up, 0, 1));
      } else if (elapsed < up + hold) {
        mix = 1;
      } else if (elapsed < total) {
        const t = clamp((elapsed - up - hold) / down, 0, 1);
        mix = 1 - easeInOut(t);
      } else {
        mix = 0;
        state.reveal.active = false;
      }

      const closeA = new THREE.Vector3(-0.6, 1.55, 1.7);
      const closeB = new THREE.Vector3(0.6, 1.55, 1.95);
      dieA.position.lerpVectors(state.a.base, closeA, mix);
      dieB.position.lerpVectors(state.b.base, closeB, mix);
      dieA.quaternion.slerpQuaternions(state.a.target, state.a.revealQ, mix);
      dieB.quaternion.slerpQuaternions(state.b.target, state.b.revealQ, mix);
      return;
    }
    dieA.rotation.y += dt * 0.35;
    dieB.rotation.x += dt * 0.33;
    return;
  }

  const t = now - state.rollStart;
  const spinPhase = t < state.spinDuration;
  const settleT = clamp((t - state.spinDuration) / state.settleDuration, 0, 1);
  const wobbleA = Math.sin(t / 130) * 0.14;
  const wobbleB = Math.cos(t / 150) * 0.14;
  const bounce = Math.abs(Math.sin(t / 90)) * 0.14 * (spinPhase ? 1 : (1 - settleT));

  dieA.position.set(state.a.base.x + wobbleA, state.a.base.y + bounce, state.a.base.z + wobbleB * 0.7);
  dieB.position.set(state.b.base.x - wobbleB, state.b.base.y + bounce * 0.9, state.b.base.z - wobbleA * 0.7);

  if (spinPhase) {
    dieA.rotation.x += dieA.userData.spin.x * dt;
    dieA.rotation.y += dieA.userData.spin.y * dt;
    dieA.rotation.z += dieA.userData.spin.z * dt;
    dieB.rotation.x += dieB.userData.spin.x * dt;
    dieB.rotation.y += dieB.userData.spin.y * dt;
    dieB.rotation.z += dieB.userData.spin.z * dt;
    return;
  }

  const qa = dieA.quaternion.clone().slerp(state.a.target, 0.14 + settleT * 0.22);
  const qb = dieB.quaternion.clone().slerp(state.b.target, 0.14 + settleT * 0.22);
  dieA.quaternion.copy(qa);
  dieB.quaternion.copy(qb);

  if (settleT >= 1) {
    dieA.position.copy(state.a.base);
    dieB.position.copy(state.b.base);
    dieA.quaternion.copy(state.a.target);
    dieB.quaternion.copy(state.b.target);
    finishRoll(now);
  }
}

function resize() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr);
  renderer.setSize(rect.width, rect.height, false);

  const aspect = rect.width / rect.height;
  camera.aspect = aspect;

  if (aspect < 0.85) {
    camera.fov = 60;
    camera.position.set(0, 11, 12);
    state.a.base.copy(MOBILE_A_BASE);
    state.b.base.copy(MOBILE_B_BASE);
  } else {
    camera.fov = 46;
    camera.position.set(0, 9.6, 10.8);
    state.a.base.copy(DESKTOP_A_BASE);
    state.b.base.copy(DESKTOP_B_BASE);
  }
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
syncUI();
resetRound();
showScreen("home");

let prev = performance.now();
function tick(now) {
  const dt = Math.min((now - prev) / 1000, 0.033);
  prev = now;
  animateDice(now, dt);
  if (black8) black8.rotation.y += dt * 0.3;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);