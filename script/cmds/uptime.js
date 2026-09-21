// ─── PATCH ANTI-ERROR clearLine ───
if (typeof process.stderr.clearLine !== 'function') {
    process.stderr.clearLine = function() { return this; };
}
// ──────────────────────────────────

const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "status", "ping"],
    version: "1.0",
    author: "Master Charbel",
    countDown: 5,
    role: 0,
    shortDescription: "📊 Statut du bot en image",
    longDescription: "Affiche le temps de fonctionnement du bot et les infos système sous forme d'image.",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ message, args, api, event }) {

    // ─── Données système ───
    const startTime = global.GoatBot?.startTime || Date.now();
    const uptimeMs = Date.now() - startTime;

    const days    = Math.floor(uptimeMs / 86400000);
    const hours   = Math.floor((uptimeMs % 86400000) / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);

    const uptimeStr = `${days}j ${hours}h ${minutes}m ${seconds}s`;

    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const ramUsed  = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
    const ramPct   = Math.round((ramUsed / ramTotal) * 100);

    const cpuModel = os.cpus()[0]?.model?.split(" ").slice(0, 4).join(" ") || "Inconnu";
    const cpuCount = os.cpus().length;

    const platform = os.platform();
    const nodeVer  = process.version;

    const ping = Date.now() - event.timestamp;
    const pingLabel = ping < 300 ? "Excellent" : ping < 700 ? "Bon" : "Lent";
    const pingColor = ping < 300 ? "#10b981" : ping < 700 ? "#f59e0b" : "#ef4444";

    const totalCmds = global.GoatBot?.commands?.size || 0;

    // ─── Canvas ───
    const W = 680;
    const H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Fond
    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(0, 0, W, H);

    // Grille de points déco
    ctx.fillStyle = "rgba(124,58,237,0.07)";
    for (let gx = 20; gx < W; gx += 30) {
      for (let gy = 20; gy < H; gy += 30) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─── Helpers ───
    const roundRect = (x, y, w, h, r, fill, stroke, sw = 1) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill)  { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
    };

    const drawText = (txt, x, y, font, color, align = "left") => {
      ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
      ctx.fillText(txt, x, y);
      ctx.textAlign = "left";
    };

    const progressBar = (x, y, w, h, pct, color) => {
      roundRect(x, y, w, h, h / 2, "rgba(255,255,255,0.06)", "rgba(255,255,255,0.1)", 1);
      const filled = Math.max(h, (pct / 100) * w);
      roundRect(x, y, filled, h, h / 2, color, null);
      drawText(`${pct}%`, x + w + 10, y + h - 2, "bold 12px sans-serif", color);
    };

    // ─── HEADER ───
    const hGrad = ctx.createLinearGradient(0, 0, W, 110);
    hGrad.addColorStop(0, "#1a0533");
    hGrad.addColorStop(1, "#0d1f3c");
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, W, 110);

    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(0, 0, 5, 110);

    roundRect(W - 60, 32, 12, 12, 6, "#10b981", null);
    drawText("EN LIGNE", W - 42, 43, "bold 12px sans-serif", "#10b981");

    drawText("MASTER CHARBEL BOT", 28, 48, "bold 26px sans-serif", "#c4b5fd");
    drawText("System Status & Uptime", 28, 74, "14px sans-serif", "#7c3aed");

    ctx.strokeStyle = "rgba(124,58,237,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(W, 110); ctx.stroke();

    // ─── UPTIME ───
    roundRect(24, 126, W - 48, 80, 12, "rgba(124,58,237,0.1)", "#7c3aed", 1);
    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(24, 126, 4, 80);

    drawText("UPTIME", 44, 154, "11px sans-serif", "#6d28d9");
    drawText(uptimeStr, 44, 186, "bold 28px monospace", "#e9d5ff");

    const blocks = [
      { v: String(days).padStart(2,"0"),    l: "JOURS" },
      { v: String(hours).padStart(2,"0"),   l: "HEURES" },
      { v: String(minutes).padStart(2,"0"), l: "MIN" },
      { v: String(seconds).padStart(2,"0"), l: "SEC" },
    ];
    let bx = W - 48 - 4 * 74;
    for (const b of blocks) {
      roundRect(bx, 134, 68, 64, 8, "rgba(124,58,237,0.15)", "rgba(124,58,237,0.3)", 1);
      drawText(b.v, bx + 34, 168, "bold 22px monospace", "#c4b5fd", "center");
      drawText(b.l, bx + 34, 188, "10px sans-serif", "#6d28d9", "center");
      bx += 74;
    }

    // ─── PING ───
    roundRect(24, 220, 200, 80, 12, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 1);
    drawText("PING", 44, 246, "11px sans-serif", "#6d28d9");
    drawText(`${ping} ms`, 44, 276, "bold 24px monospace", pingColor);
    drawText(pingLabel, 44, 294, "12px sans-serif", pingColor);

    // ─── COMMANDES ───
    roundRect(236, 220, 200, 80, 12, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 1);
    drawText("COMMANDES", 256, 246, "11px sans-serif", "#6d28d9");
    drawText(`${totalCmds}`, 256, 276, "bold 24px monospace", "#a78bfa");
    drawText("chargées", 256, 294, "12px sans-serif", "#6d28d9");

    // ─── NODE ───
    roundRect(448, 220, 208, 80, 12, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 1);
    drawText("NODE.JS", 468, 246, "11px sans-serif", "#6d28d9");
    drawText(nodeVer, 468, 276, "bold 24px monospace", "#10b981");
    drawText(platform, 468, 294, "12px sans-serif", "#6d28d9");

    // ─── RAM ───
    roundRect(24, 316, W - 48, 80, 12, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 1);
    drawText("MÉMOIRE RAM", 44, 340, "11px sans-serif", "#6d28d9");
    drawText(`${ramUsed} GB / ${ramTotal} GB`, 44, 362, "bold 14px monospace", "#c4b5fd");
    progressBar(44, 372, W - 48 - 88, 14,
      ramPct,
      ramPct < 60 ? "#10b981" : ramPct < 80 ? "#f59e0b" : "#ef4444"
    );

    // ─── CPU ───
    roundRect(24, 410, W - 48, 68, 12, "rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)", 1);
    drawText("CPU", 44, 434, "11px sans-serif", "#6d28d9");
    drawText(cpuModel, 44, 458, "13px sans-serif", "#a78bfa", "left");
    drawText(`${cpuCount} coeurs`, W - 72, 458, "12px sans-serif", "#6d28d9", "right");

    // ─── FOOTER ───
    const now = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Douala" });
    drawText(`Généré le ${now}  |  Master Charbel Bot`, W / 2, 500,
      "12px sans-serif", "#3b1f6e", "center");

    // ─── Export ───
    const outPath = path.join(__dirname, "cache", "uptime.png");
    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, canvas.toBuffer("image/png"));

    return message.reply({
      body: "",
      attachment: fs.createReadStream(outPath)
    });
  }
};
