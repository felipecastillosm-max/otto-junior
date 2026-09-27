const API_BASE = "http://localhost:8787";

const netBadge = document.getElementById("net-badge");

function updateNetStatus() {
  if (!netBadge) return;
  if (navigator.onLine) {
    netBadge.textContent = "En línea";
    netBadge.className = "badge online";
  } else {
    netBadge.textContent = "Sin señal";
    netBadge.className = "badge offline";
  }
}

window.addEventListener("online", updateNetStatus);
window.addEventListener("offline", updateNetStatus);
updateNetStatus();

async function apiGet(action) {
  const res = await fetch(`${API_BASE}/?action=${action}`);
  return res.json();
}

async function apiPost(action, data) {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
