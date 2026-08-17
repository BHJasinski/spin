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
  "#f97316", "#facc15", "#6ee7b7", "#60a5fa", "#b07ded",
  "#f59e6b", "#5dd1c4", "#e56eb3", "#9ee12d", "#ef7188",
  "#f1c94f", "#40b6ef", "#9a84e8", "#43c794", "#ff7a12",
  "#6195e8", "#cf70e0", "#86cb11", "#f59e0b"
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

    // sektor
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,.74)";
    ctx.stroke();

    // tekst wzdłuż pola - czytelny jak w kole fortuny
    const mid = start + slice / 2;
    ctx.save();
    ctx.rotate(mid);

    const textRadius = radius * 0.72;
    ctx.translate(textRadius, 0);
    ctx.rotate(Math.PI / 2);

    const label = `${amounts[i]} zł`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#121826";
    ctx.shadowColor = "rgba(255,255,255,.28)";
    ctx.shadowBlur = 1.5;

    // mniejsze fonty dla większych kwot
    let fontSize = 46;
    if (amounts[i] >= 1000) fontSize = 40;
    if (amounts[i] >= 3000) fontSize = 36;

    ctx.font = `900 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  // obręcz zewnętrzna
  ctx.beginPath();
  ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.stroke();

  // piasta
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.19, 0, Math.PI * 2);
  ctx.fillStyle = "#f4e1b7";
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#f5c15a";
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
  const targetCenterDeg = targetIndex * sliceDeg + sliceDeg / 2;
  const finalModulo = normalize(-targetCenterDeg);

  const currentModulo = normalize(currentRotation);
  let delta = finalModulo - currentModulo;
  if (delta < 0) delta += 360;

  // kilka pełnych obrotów + zatrzymanie na 499 zł
  const fullTurns = 9;
  const totalDelta = fullTurns * 360 + delta;

  currentRotation += totalDelta;

  canvas.style.transition = "transform 7s cubic-bezier(.08,.78,.14,1)";
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    spinning = false;
    spinBtn.disabled = false;
    spinMain.disabled = false;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }, 7050);
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
