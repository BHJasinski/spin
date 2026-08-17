const amounts = [100, 200, 350, 499, 700, 1000, 1500, 2000, 3000, 4000];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

const colors = [
  "#ff7474",
  "#f7c95c",
  "#65d7ad",
  "#66a1ef",
  "#ad79e7",
  "#ff9d68",
  "#50d0bd",
  "#e771b2",
  "#98d828",
  "#f28b17"
];

const slice = (Math.PI * 2) / amounts.length;
const sliceDeg = 360 / amounts.length;

let currentRotation = 0;
let spinning = false;
let audioCtx = null;
let lastTickIndex = -1;
let animationStart = 0;
let animationDuration = 0;
let animationStartRotation = 0;
let animationEndRotation = 0;
let animationFrameId = null;

function drawWheel() {
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.455;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < amounts.length; i++) {
    const start = -Math.PI / 2 + i * slice;
    const end = start + slice;
    const mid = start + slice / 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(255,255,255,.88)";
    ctx.stroke();

    // Kwoty ustawione promieniowo, wzdłuż każdego pola.
    ctx.save();
    ctx.rotate(mid);
    ctx.translate(radius * 0.67, 0);

    // Tekst biegnie od środka w stronę obręczy.
    ctx.rotate(Math.PI / 2);

    const value = amounts[i];
    const label = `${value} zł`;
    let fontSize = 62;
    if (value >= 1000) fontSize = 54;
    if (value >= 3000) fontSize = 50;

    ctx.font = `950 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#141a25";
    ctx.shadowColor = "rgba(255,255,255,.34)";
    ctx.shadowBlur = 2;
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  // Zewnętrzna obręcz.
  ctx.beginPath();
  ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
  ctx.lineWidth = 22;
  ctx.strokeStyle = "rgba(250,252,255,.98)";
  ctx.stroke();

  // Wewnętrzny pierścień.
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.20, 0, Math.PI * 2);
  ctx.fillStyle = "#f5deb0";
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#ffc857";
  ctx.stroke();

  ctx.restore();
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function tick(volume = 0.05, pitch = 900) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.045);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function animate(timestamp) {
  const elapsed = timestamp - animationStart;
  const progress = Math.min(elapsed / animationDuration, 1);
  const eased = easeOutQuint(progress);

  const rotation = animationStartRotation +
    (animationEndRotation - animationStartRotation) * eased;

  canvas.style.transform = `rotate(${rotation}deg)`;

  // Dźwięk "terkotania" wskaźnika przy przejściu przez kolejne pola.
  const crossed = Math.floor(rotation / sliceDeg);
  if (crossed !== lastTickIndex) {
    lastTickIndex = crossed;
    const speedFactor = Math.max(0.35, 1 - progress * 0.65);
    tick(0.028 + speedFactor * 0.025, 720 + speedFactor * 420);
  }

  if (progress < 1) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    currentRotation = animationEndRotation;
    spinning = false;
    spinBtn.disabled = false;
    tick(0.09, 520);
    setTimeout(() => tick(0.06, 420), 90);
  }
}

function spin() {
  if (spinning) return;

  ensureAudio();
  spinning = true;
  spinBtn.disabled = true;

  // Prawdziwe losowanie jednego z 10 pól.
  const resultIndex = Math.floor(Math.random() * amounts.length);

  // Środek wybranego pola trafia pod wskaźnik.
  const targetCenter = resultIndex * sliceDeg + sliceDeg / 2;
  const targetModulo = normalize(-targetCenter);

  const currentModulo = normalize(currentRotation);
  let delta = targetModulo - currentModulo;
  if (delta < 0) delta += 360;

  // Wolniejsze, bardziej "fizyczne" koło:
  // 5-6 pełnych obrotów, około 9 sekund.
  const fullTurns = 5 + Math.floor(Math.random() * 2);
  const totalDelta = fullTurns * 360 + delta;

  animationStartRotation = currentRotation;
  animationEndRotation = currentRotation + totalDelta;
  animationDuration = 8800 + Math.random() * 1000;
  animationStart = performance.now();
  lastTickIndex = Math.floor(currentRotation / sliceDeg);

  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(animate);
}

spinBtn.addEventListener("click", spin);

drawWheel();
