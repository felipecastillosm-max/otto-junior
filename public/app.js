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
