const wheel = document.getElementById("wheel");
const wheelZone = document.querySelector(".wheel-zone");

const sectorDeg = 180;

let currentRotation = 0;
let spinning = false;

let dragging = false;
let lastAngle = 0;
let lastTime = 0;
let velocity = 0;

let audioCtx = null;
let rafId = null;

function ensureAudio() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTick(progress = 0) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(880 - progress * 260, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.055);
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function getPointerAngle(clientX, clientY) {
  const rect = wheelZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
}

function setRotation(deg) {
  currentRotation = deg;
  wheel.style.transform = `rotate(${deg}deg)`;
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function releaseSpin(initialVelocity) {
  if (spinning) return;

  spinning = true;

  // Rzeczywiste 50/50 między 499 zł i ZA DARMO
  const resultIndex = Math.random() < 0.5 ? 0 : 1;

  // Środki dwóch pól to 0° i 180°.
  const targetCenter = resultIndex * sectorDeg;
  const targetModulo = normalize(-targetCenter);

  const currentModulo = normalize(currentRotation);
  let delta = targetModulo - currentModulo;
  if (delta < 0) delta += 360;

  const speed = Math.min(Math.abs(initialVelocity), 1.5);

  // Mocniejszy gest = więcej obrotów i dłuższe wyhamowanie.
  const fullTurns = Math.max(2, Math.min(7, Math.round(2 + speed * 3.7)));
  const duration = Math.max(5200, Math.min(9200, 5600 + speed * 2200));

  const startRotation = currentRotation;
  const endRotation = currentRotation + fullTurns * 360 + delta;
  const startTime = performance.now();

  let lastBoundary = Math.floor(currentRotation / sectorDeg);

  cancelAnimationFrame(rafId);

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutQuint(t);

    const rotation = startRotation + (endRotation - startRotation) * eased;
    wheel.style.transform = `rotate(${rotation}deg)`;

    const boundary = Math.floor(rotation / sectorDeg);
    if (boundary !== lastBoundary) {
      lastBoundary = boundary;
      playTick(t);
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      currentRotation = endRotation;
      spinning = false;

      playTick(1);
      setTimeout(() => playTick(1), 90);
    }
  }

  rafId = requestAnimationFrame(frame);
}

function pointerDown(e) {
  if (spinning) return;

  ensureAudio();

  dragging = true;
  wheelZone.setPointerCapture?.(e.pointerId);

  lastAngle = getPointerAngle(e.clientX, e.clientY);
  lastTime = performance.now();
  velocity = 0;
}

function pointerMove(e) {
  if (!dragging || spinning) return;

  const angle = getPointerAngle(e.clientX, e.clientY);
  const now = performance.now();

  let delta = angle - lastAngle;

  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  const dt = Math.max(8, now - lastTime);
  velocity = delta / dt;

  const previousBoundary = Math.floor(currentRotation / sectorDeg);

  setRotation(currentRotation + delta);

  const newBoundary = Math.floor(currentRotation / sectorDeg);

  if (previousBoundary !== newBoundary) {
    playTick(0.15);
  }

  lastAngle = angle;
  lastTime = now;
}

function pointerUp(e) {
  if (!dragging || spinning) return;

  dragging = false;
  wheelZone.releasePointerCapture?.(e.pointerId);

  // Krótki ruch też uruchamia koło.
  const minVelocity = 0.18;
  const finalVelocity =
    Math.abs(velocity) < minVelocity
      ? Math.sign(velocity || 1) * minVelocity
      : velocity;

  releaseSpin(finalVelocity);
}

wheelZone.addEventListener("pointerdown", pointerDown);
wheelZone.addEventListener("pointermove", pointerMove);
wheelZone.addEventListener("pointerup", pointerUp);
wheelZone.addEventListener("pointercancel", pointerUp);
