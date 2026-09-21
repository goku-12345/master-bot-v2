// ─── PATCH ANTI-ERROR clearLine ───
if (typeof process.stderr.clearLine !== 'function') {
    process.stderr.clearLine = function() { return this; };
}
// ──────────────────────────────────

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const axios = require("axios");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["up2", "status2", "ping2"],
    version: "2.0",
    author: "Master Charbel",
    countDown: 5,
    role: 0,
    shortDescription: "📊 Statut du bot (Thème Tokyo Ghoul)",
    longDescription: "Affiche le temps de fonctionnement du bot et les infos système sous forme d'image thématisée Tokyo Ghoul.",
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
    const pingLabel = ping < 300 ? "Fluide (A+)" : ping < 700 ? "Moyen" : "Critique";
    const pingColor = ping < 300 ? "#ef4444" : ping < 700 ? "#f59e0b" : "#991b1b";

    const totalCmds = global.GoatBot?.commands?.size || 0;

    // ─── Canvas ───
    const W = 680;
    const H = 520;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Telechargement de l'image d'arriere-plan Tokyo Ghoul
    const bgUrl = "https://i.ibb.co/9HXZbYYm/fe46a1c7e37a.jpg";
    const bgPath = path.join(__dirname, "cache", "ghoul_uptime_bg.jpg");

    try {
      if (!fs.existsSync(bgPath)) {
        const response = await axios({
          url: bgUrl,
          responseType: 'arraybuffer'
        });
        await fs.ensureDir(path.dirname(bgPath));
        await fs.writeFile(bgPath, Buffer.from(response.data));
      }
      const bgImage = await loadImage(bgPath);
      ctx.drawImage(bgImage, 0, 0, W, H);
    } catch (e) {
      // Fond de secours si le telechargement echoue
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, W, H);
    }

    // Couche d'ombrage sombre transparent pour faire ressortir le texte
    ctx.fillStyle = "rgba(5, 5, 12, 0.78)";
    ctx.fillRect(0, 0, W, H);

    // Grille de points rouge sang
    ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
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
      roundRect(x, y, w, h, h / 2, "rgba(255,255,255,0.06)", "rgba(239,68,68,0.2)", 1);
      const filled = Math.max(h, (pct / 100) * w);
      roundRect(x, y, filled, h, h / 2, color, null);
      drawText(`${pct}%`, x + w + 10, y + h - 2, "bold 12px sans-serif", color);
    };

    // ─── HEADER ───
    const hGrad = ctx.createLinearGradient(0, 0, W, 110);
    hGrad.addColorStop(0, "rgba(30, 0, 0, 0.85)");
    hGrad.addColorStop(1, "rgba(10, 10, 15, 0.85)");
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, W, 110);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(0, 0, 5, 110);

    roundRect(W - 120, 32, 12, 12, 6, "#ef4444", null);
    drawText("KAKUJA ACTIF", W - 102, 43, "bold 12px sans-serif", "#ef4444");

    drawText("SHADOW GHOUL SYSTEM", 28, 48, "bold 24px sans-serif", "#fca5a5");
    drawText("Anteiku Network & Uptime Status", 28, 74, "14px sans-serif", "#ef4444");

    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(W, 110); ctx.stroke();

    // ─── UPTIME ───
    roundRect(24, 126, W - 48, 80, 12, "rgba(239, 68, 68, 0.12)", "#ef4444", 1);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(24, 126, 4, 80);

    drawText("TEMPS D'ACTIVITÉ (UPTIME)", 44, 154, "11px sans-serif", "#b91c1c");
    drawText(uptimeStr, 44, 186, "bold 28px monospace", "#fecdd3");

    const blocks = [
      { v: String(days).padStart(2,"0"),    l: "JOURS" },
      { v: String(hours).padStart(2,"0"),   l: "HEURES" },
      { v: String(minutes).padStart(2,"0"), l: "MIN" },
      { v: String(seconds).padStart(2,"0"), l: "SEC" },
    ];
    let bx = W - 48 - 4 * 74;
    for (const b of blocks) {
      roundRect(bx, 134, 68, 64, 8, "rgba(153, 27, 27, 0.25)", "rgba(239, 68, 68, 0.4)", 1);
      drawText(b.v, bx + 34, 168, "bold 22px monospace", "#fca5a5", "center");
      drawText(b.l, bx + 34, 188, "10px sans-serif", "#991b1b", "center");
      bx += 74;
    }

    // ─── PING ───
    roundRect(24, 220, 200, 80, 12, "rgba(0,0,0,0.4)", "rgba(239,68,68,0.25)", 1);
    drawText("LATENCE (PING)", 44, 246, "11px sans-serif", "#b91c1c");
    drawText(`${ping} ms`, 44, 276, "bold 24px monospace", pingColor);
    drawText(pingLabel, 44, 294, "12px sans-serif", pingColor);

    // ─── COMMANDES ───
    roundRect(236, 220, 200, 80, 12, "rgba(0,0,0,0.4)", "rgba(239,68,68,0.25)", 1);
    drawText("MODULES RC", 256, 246, "11px sans-serif", "#b91c1c");
    drawText(`${totalCmds}`, 256, 276, "bold 24px monospace", "#fca5a5");
    drawText("Commandes chargées", 256, 294, "12px sans-serif", "#b91c1c");

    // ─── NODE ───
    roundRect(448, 220, 208, 80, 12, "rgba(0,0,0,0.4)", "rgba(239,68,68,0.25)", 1);
    drawText("ENVIRONNEMENT", 468, 246, "11px sans-serif", "#b91c1c");
    drawText(nodeVer, 468, 276, "bold 24px monospace", "#ef4444");
    drawText(platform, 468, 294, "12px sans-serif", "#b91c1c");

    // ─── RAM ───
    roundRect(24, 316, W - 48, 80, 12, "rgba(0,0,0,0.4)", "rgba(239,68,68,0.25)", 1);
    drawText("CELLULES RC (MÉMOIRE RAM)", 44, 340, "11px sans-serif", "#b91c1c");
    drawText(`${ramUsed} GB / ${ramTotal} GB`, 44, 362, "bold 14px monospace", "#fca5a5");
    progressBar(44, 372, W - 48 - 88, 14,
      ramPct,
      ramPct < 60 ? "#ef4444" : ramPct < 80 ? "#f59e0b" : "#991b1b"
    );

    // ─── CPU ───
    roundRect(24, 410, W - 48, 68, 12, "rgba(0,0,0,0.4)", "rgba(239,68,68,0.25)", 1);
    drawText("NOYAU PROCESSEUR (CPU)", 44, 434, "11px sans-serif", "#b91c1c");
    drawText(cpuModel, 44, 458, "13px sans-serif", "#fca5a5", "left");
    drawText(`${cpuCount} Cœurs CCG`, W - 72, 458, "12px sans-serif", "#b91c1c", "right");

    // ─── FOOTER ───
    const now = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Douala" });
    drawText(`Généré le ${now}  |  Master Charbel • Shadow Ghoul`, W / 2, 500,
      "12px sans-serif", "#991b1b", "center");

    // ─── Export ───
    const outPath = path.join(__dirname, "cache", "uptime_output.png");
    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, canvas.toBuffer("image/png"));

    return message.reply({
      body: "☕ 𝗦𝗛𝗔𝗗𝗢𝗪 𝗚𝗛𝗢𝗨𝗟 • 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦",
      attachment: fs.createReadStream(outPath)
    });
  }
};