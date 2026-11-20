// Dibuja un QR como SVG con los colores de la fiesta.
window.qrSVG = function (texto, oscuro = "#2a0611", claro = "#fbf3e4") {
  const q = qrcode(0, "M"); q.addData(texto); q.make();
  const n = q.getModuleCount(), m = 2, t = n + m * 2; let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + m} ${y + m}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}" shape-rendering="crispEdges" role="img" aria-label="Código QR"><rect width="${t}" height="${t}" fill="${claro}"/><path d="${d}" fill="${oscuro}"/></svg>`;
};
