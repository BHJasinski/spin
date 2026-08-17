const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");

const values = [100, 200, 350, 499, 700, 1000, 1500, 2000, 3000, 4000];
const sectorDeg = 36;

let spinning = false;
let currentRotation = 0;
let audioCtx = null;
let rafId = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTick(strength = 1) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(950 - strength * 260, audioCtx.currentTime);

  const v = 0.035 + strength * 0.035;
  gain.gain.setValueAtTime(v, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.055);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.06);
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function spin() {
  if (spinning) return;

  getAudioContext();
  spinning = true;
  spinBtn.disabled = true;

  // Rzeczywisty losowy wynik spośród 10 pól.
  const resultIndex = Math.floor(Math.random() * values.length);

  // Środek sektora zostaje ustawiony dokładnie pod wskaźnikiem.
  const sectorCenter = resultIndex * sectorDeg;
  const targetModulo = normalize(-sectorCenter);

  const currentModulo = normalize(currentRotation);
  let delta = targetModulo - currentModulo;
  if (delta < 0) delta += 360;

  const fullTurns = 4 + Math.floor(Math.random() * 2);
  const startRotation = currentRotation;
  const endRotation = currentRotation + fullTurns * 360 + delta;

  // Wolniejsza animacja: około 10 sekund.
  const duration = 9500 + Math.random() * 1200;
  const startTime = performance.now();

  let previousSector = Math.floor(startRotation / sectorDeg);

  cancelAnimationFrame(rafId);

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(t);

    const rotation = startRotation + (endRotation - startRotation) * eased;
    wheel.style.transform = `rotate(${rotation}deg)`;

    const sector = Math.floor(rotation / sectorDeg);
    if (sector !== previousSector) {
      previousSector = sector;
      playTick(t);
    }

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      currentRotation = endRotation;
      spinning = false;
      spinBtn.disabled = false;

      playTick(1);
      setTimeout(() => playTick(1), 90);
    }
  }

  rafId = requestAnimationFrame(frame);
}

spinBtn.addEventListener("click", spin, { passive: true });
