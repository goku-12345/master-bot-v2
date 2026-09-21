const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const OWNER = "Master Charbel";
const BOT_NAME = "SHADOW GHOUL";
const BACKGROUND_URL = "https://i.ibb.co/9HXZbYYm/fe46a1c7e37a.jpg";
const PER_PAGE = 5;            // catégories par page
const MAX_CMDS_SHOWN = 12;     // commandes affichées par catégorie
const SESSION_TTL = 30 * 60 * 1000; // une session de navigation dure 30 min

const W = 900;
const H = 1000;

const CATEGORY_THEME = {
	info: "ARCHIVES DE L'ANTEIKU", fun: "MASQUES & JEUX", game: "COMBATS DE GHOULS",
	games: "COMBATS DE GHOULS", economy: "CAISSE DU CAFÉ", admin: "CONSEIL DES GHOULS",
	owner: "LE ROI BORGNE", ai: "KAKUGAN", image: "GALERIE DU MASQUE",
	media: "GALERIE DU MASQUE", video: "GALERIE DU MASQUE", music: "MÉLODIE DE TOKYO",
	utility: "OUTILS DU CAFÉ", tools: "OUTILS DU CAFÉ", system: "CELLULES RC",
	config: "CELLULES RC", group: "REPAIRE DES GHOULS", box: "REPAIRE DES GHOULS",
	social: "REPAIRE DES GHOULS", anime: "MONDE DES ANIMES", download: "CHASSE AUX FICHIERS",
	search: "TRAQUE DES CCG", education: "ÉCOLE DES GHOULS", moderation: "PATROUILLE DE LA CCG",
	love: "CŒURS BRISÉS", rank: "RANGS DE LA CCG"
};

function themeName(cat) {
	return CATEGORY_THEME[String(cat).toLowerCase()] || String(cat).toUpperCase();
}

// Chargement de canvas : si la bibliothèque manque ou échoue, on le dit clairement
let canvasLib = null;
function loadCanvas() {
	if (canvasLib) return canvasLib;
	try {
		canvasLib = require("canvas");
		return canvasLib;
	} catch (e) {
		console.error("[HELPCANVAS] canvas indisponible :", e.message);
		return null;
	}
}

// Sessions de navigation : { messageID: { author, page, expires } }
if (!global.helpCanvasSessions) global.helpCanvasSessions = {};
const sessions = global.helpCanvasSessions;

function purgeSessions() {
	const now = Date.now();
	for (const id of Object.keys(sessions)) {
		if (sessions[id].expires < now) delete sessions[id];
	}
}

// L'image de fond est téléchargée une seule fois puis gardée en mémoire
let backgroundImage = null;
let backgroundTried = false;
async function getBackground(lib) {
	if (backgroundImage || backgroundTried) return backgroundImage;
	backgroundTried = true;
	try {
		const res = await axios.get(BACKGROUND_URL, { responseType: "arraybuffer", timeout: 15000, maxContentLength: 8 * 1024 * 1024 });
		backgroundImage = await lib.loadImage(Buffer.from(res.data));
	} catch (e) {
		console.error("[HELPCANVAS] Fond indisponible, dégradé utilisé :", e.message);
	}
	return backgroundImage;
}

// Catégories accessibles au rôle de l'utilisateur
function buildCategories(role) {
	const cats = {};
	for (const [name, cmd] of global.GoatBot.commands) {
		if (!cmd || !cmd.config) continue;
		if ((cmd.config.role || 0) > role) continue;
		const cat = cmd.config.category || "Autres";
		if (!cats[cat]) cats[cat] = [];
		cats[cat].push(name);
	}
	for (const c of Object.keys(cats)) cats[c].sort();
	return cats;
}

function roundRect(ctx, x, y, w, h, r) {
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
}

// Retourne des lignes de commandes qui tiennent dans la largeur donnée
function wrapCommands(ctx, names, maxWidth) {
	const lines = [];
	let line = "";
	for (const n of names) {
		const piece = "• " + n + "   ";
		if (ctx.measureText(line + piece).width > maxWidth && line) {
			lines.push(line.trimEnd());
			line = piece;
		} else {
			line += piece;
		}
	}
	if (line) lines.push(line.trimEnd());
	return lines;
}

// Dessine l'image et retourne un Buffer PNG. Aucune emoji : les serveurs n'ont pas la police.
async function renderPage(lib, page, totalPages, cats, catNames, totalCmds) {
	const canvas = lib.createCanvas(W, H);
	const ctx = canvas.getContext("2d");

	// ─── Fond : ton image assombrie, sinon dégradé ───
	const bg = await getBackground(lib);
	if (bg) {
		const ratio = Math.max(W / bg.width, H / bg.height);
		const bw = bg.width * ratio;
		const bh = bg.height * ratio;
		ctx.drawImage(bg, (W - bw) / 2, (H - bh) / 2, bw, bh);
		ctx.fillStyle = "rgba(5, 3, 10, 0.72)"; // voile sombre pour la lisibilité
		ctx.fillRect(0, 0, W, H);
	} else {
		const g = ctx.createLinearGradient(0, 0, 0, H);
		g.addColorStop(0, "#0a0a12");
		g.addColorStop(0.5, "#1a0a14");
		g.addColorStop(1, "#0a0a12");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
	}

	// ─── En-tête ───
	ctx.fillStyle = "rgba(0,0,0,0.55)";
	ctx.fillRect(0, 0, W, 130);
	ctx.fillStyle = "#c0142c";
	ctx.fillRect(0, 0, 8, 130);

	ctx.textAlign = "left";
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 42px sans-serif";
	ctx.fillText(BOT_NAME, 36, 62);
	ctx.fillStyle = "#e8a0a8";
	ctx.font = "20px sans-serif";
	ctx.fillText("MENU DE L'ANTEIKU  |  " + totalCmds + " commandes  |  Page " + page + "/" + totalPages, 36, 100);

	ctx.strokeStyle = "rgba(192,20,44,0.6)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, 130);
	ctx.lineTo(W, 130);
	ctx.stroke();

	// ─── Catégories de la page ───
	const start = (page - 1) * PER_PAGE;
	const pageCats = catNames.slice(start, start + PER_PAGE);
	let y = 160;
	const boxX = 30;
	const boxW = W - 60;
	const textMax = boxW - 50;

	for (const cat of pageCats) {
		const names = cats[cat];
		const shown = names.slice(0, MAX_CMDS_SHOWN);
		ctx.font = "17px sans-serif";
		const lines = wrapCommands(ctx, shown, textMax);
		const extra = names.length > MAX_CMDS_SHOWN ? 1 : 0;
		const boxH = 56 + (lines.length + extra) * 26 + 10;

		roundRect(ctx, boxX, y, boxW, boxH, 12);
		ctx.fillStyle = "rgba(0,0,0,0.55)";
		ctx.fill();
		ctx.strokeStyle = "rgba(192,20,44,0.55)";
		ctx.lineWidth = 1.5;
		ctx.stroke();

		ctx.fillStyle = "#ff4d63";
		ctx.font = "bold 21px sans-serif";
		ctx.fillText(themeName(cat) + "  (" + names.length + ")", boxX + 22, y + 34);

		ctx.fillStyle = "#f1e6e8";
		ctx.font = "17px sans-serif";
		let ly = y + 66;
		for (const l of lines) {
			ctx.fillText(l, boxX + 25, ly);
			ly += 26;
		}
		if (extra) {
			ctx.fillStyle = "#b07a82";
			ctx.fillText("... et " + (names.length - MAX_CMDS_SHOWN) + " autres (help <catégorie>)", boxX + 25, ly);
		}
		y += boxH + 16;
	}

	// ─── Pagination ───
	if (totalPages > 1) {
		ctx.textAlign = "center";
		ctx.font = "bold 20px sans-serif";
		let x = W / 2 - (totalPages * 44) / 2 + 22;
		for (let i = 1; i <= totalPages; i++) {
			ctx.fillStyle = i === page ? "#ff4d63" : "#7a5a60";
			ctx.fillText(i === page ? "[" + i + "]" : String(i), x, H - 62);
			x += 44;
		}
	}

	// ─── Pied de page ───
	ctx.textAlign = "center";
	ctx.fillStyle = "#9a7f84";
	ctx.font = "15px sans-serif";
	const now = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Douala" });
	ctx.fillText(BOT_NAME + "  |  " + OWNER + "  |  " + now, W / 2, H - 24);

	return canvas.toBuffer("image/png");
}

async function buildAndSend(message, event, api, page, role, author) {
	const lib = loadCanvas();
	if (!lib) {
		return message.reply(
			"⚠️ La bibliothèque « canvas » n'est pas disponible sur ce serveur.\n" +
			"Utilise la commande help (version texte) à la place."
		);
	}

	const cats = buildCategories(role);
	const catNames = Object.keys(cats).sort();
	if (!catNames.length) return message.reply("👁️ Aucune commande accessible.");
	const totalCmds = catNames.reduce(function (s, c) { return s + cats[c].length; }, 0);
	const totalPages = Math.max(1, Math.ceil(catNames.length / PER_PAGE));
	const safePage = Math.min(Math.max(page, 1), totalPages);

	let buffer;
	try {
		buffer = await renderPage(lib, safePage, totalPages, cats, catNames, totalCmds);
	} catch (e) {
		console.error("[HELPCANVAS] Erreur de dessin :", e.message);
		return message.reply("❌ Impossible de générer l'image. Utilise la commande help (version texte).");
	}

	// Fichier temporaire unique par envoi (évite les collisions entre utilisateurs)
	const dir = path.join(process.cwd(), "tmp");
	await fs.ensureDir(dir);
	const file = path.join(dir, "helpcanvas_" + Date.now() + "_" + Math.floor(Math.random() * 1e6) + ".png");
	await fs.writeFile(file, buffer);

	let sent;
	try {
		sent = await message.reply({
			body: "📖 Page " + safePage + "/" + totalPages + (totalPages > 1 ? "\n💬 Réponds à ce message avec un numéro (1 à " + totalPages + ") pour changer de page." : ""),
			attachment: fs.createReadStream(file)
		});
	} finally {
		fs.remove(file).catch(function () {});
	}

	// Enregistre la session pour la navigation
	const messageID = sent && sent.messageID;
	if (messageID && totalPages > 1) {
		purgeSessions();
		sessions[messageID] = { author: String(author), role: role, expires: Date.now() + SESSION_TTL };
		global.GoatBot.onReply.set(messageID, { commandName: "helpcanvas", messageID: messageID, author: String(author) });
	}
	return sent;
}

module.exports = {
	config: {
		name: "helpcanvas",
		aliases: ["hcanvas", "aidecanvas", "helpimg"],
		version: "4.0",
		author: OWNER,
		countDown: 10,
		role: 0,
		shortDescription: { en: "Menu de l'Anteiku en image" },
		longDescription: { en: "Affiche l'aide en image (fond Tokyo Ghoul). Réponds avec un numéro pour changer de page." },
		category: "info",
		guide: { en: "{pn} [page]" }
	},

	onStart: async function ({ message, args, event, api, role }) {
		const page = parseInt(args[0], 10) || 1;
		return buildAndSend(message, event, api, page, role, event.senderID);
	},

	onReply: async function ({ message, event, api, Reply, role }) {
		if (String(event.senderID) !== String(Reply.author)) return;

		const session = sessions[Reply.messageID];
		if (!session || session.expires < Date.now()) {
			return message.reply("⏳ Cette navigation a expiré. Relance la commande helpcanvas.");
		}

		const num = parseInt(String(event.body || "").trim(), 10);
		if (isNaN(num) || num < 1) {
			return message.reply("❌ Réponds avec un numéro de page (par exemple 2).");
		}

		delete sessions[Reply.messageID];
		return buildAndSend(message, event, api, num, role, event.senderID);
	}
};
