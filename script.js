const amounts = [100, 200, 300, 400, 499, 550, 700, 900, 1200, 1500, 1800, 2200, 2500, 2800, 3000, 3300, 3500, 3800, 4000];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const spinMain = document.getElementById("spinMain");
const modal = document.getElementById("resultModal");
const closeModal = document.getElementById("closeModal");

const targetValue = 499;
const targetIndex = amounts.indexOf(targetValue);
const slice = (Math.PI * 2) / amounts.length;

const colors = [
  "#ff7b72", "#f6c85f", "#6ee7b7", "#74a7ff", "#c084fc",
  "#ff9f68", "#5eead4", "#f472b6", "#a3e635", "#fb7185",
  "#facc15", "#38bdf8", "#a78bfa", "#34d399", "#f97316",
  "#60a5fa", "#e879f9", "#84cc16", "#f59e0b"
];

let currentRotation = 0;
let spinning = false;

function drawWheel() {
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < amounts.length; i++) {
    const start = -Math.PI / 2 + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,.72)";
    ctx.stroke();

    const angle = start + slice / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(radius * 0.66, 0);
    ctx.rotate(Math.PI / 2);

    const label = `${amounts[i]} zł`;
    ctx.font = amounts[i] >= 1000
      ? "800 27px Inter, system-ui, sans-serif"
      : "900 31px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#121826";

    ctx.shadowColor = "rgba(255,255,255,.45)";
    ctx.shadowBlur = 3;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "rgba(255,255,255,.94)";
  ctx.stroke();

  ctx.restore();
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function spin() {
  if (spinning) return;
  spinning = true;

  spinBtn.disabled = true;
  spinMain.disabled = true;

  const sliceDeg = 360 / amounts.length;

  // Środek pola 499 zł ma trafić dokładnie pod wskaźnik na godzinie 12.
  const targetCenterDeg = targetIndex * sliceDeg + sliceDeg / 2;

  // Canvas zaczyna pierwsze pole od godziny 12, więc obrót o -targetCenterDeg
  // ustawia środek pola 499 zł pod wskaźnikiem.
  const finalModulo = normalize(-targetCenterDeg);

  const currentModulo = normalize(currentRotation);
  let delta = finalModulo - currentModulo;
  if (delta < 0) delta += 360;

  const fullTurns = 7 + Math.floor(Math.random() * 3);
  const totalDelta = fullTurns * 360 + delta;

  currentRotation += totalDelta;

  canvas.style.transition = "transform 5.6s cubic-bezier(.11,.72,.13,1)";
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    spinning = false;
    spinBtn.disabled = false;
    spinMain.disabled = false;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }, 5750);
}

spinBtn.addEventListener("click", spin);
spinMain.addEventListener("click", spin);

closeModal.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
});

drawWheel();
