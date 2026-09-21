const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// ═══════════════════════════════════════════════════════════
// ⚙️ IDENTITÉ DU BOT
// ═══════════════════════════════════════════════════════════
const BOT_NAME = "𝐒𝐡𝐚𝐝𝐨𝐰 𝐆𝐡𝐨𝐮𝐥";
const OWNER = "Master Charbel";
const MAX_MSG = 1800;
const PER_LINE = 2;

const CATEGORY_THEME = {
	info:       { icon: "📖", name: "ARCHIVES DE L'ANTEIKU" },
	fun:        { icon: "🎭", name: "MASQUES & JEUX" },
	game:       { icon: "🩸", name: "COMBATS DE GHOULS" },
	games:      { icon: "🩸", name: "COMBATS DE GHOULS" },
	economy:    { icon: "☕", name: "CAISSE DU CAFÉ" },
	admin:      { icon: "👑", name: "CONSEIL DES GHOULS" },
	owner:      { icon: "🩸", name: "LE ROI BORGNE" },
	ai:         { icon: "👁️", name: "KAKUGAN" },
	image:      { icon: "🖼️", name: "GALERIE DU MASQUE" },
	media:      { icon: "🎬", name: "GALERIE DU MASQUE" },
	video:      { icon: "🎬", name: "GALERIE DU MASQUE" },
	music:      { icon: "🎻", name: "MÉLODIE DE TOKYO" },
	utility:    { icon: "🕸️", name: "OUTILS DU CAFÉ" },
	tools:      { icon: "🕸️", name: "OUTILS DU CAFÉ" },
	system:     { icon: "⚙️", name: "CELLULES RC" },
	config:     { icon: "⚙️", name: "CELLULES RC" },
	group:      { icon: "🏚️", name: "REPAIRE DES GHOULS" },
	box:        { icon: "🏚️", name: "REPAIRE DES GHOULS" },
	social:     { icon: "🏚️", name: "REPAIRE DES GHOULS" },
	anime:      { icon: "🎌", name: "MONDE DES ANIMES" },
	download:   { icon: "📥", name: "CHASSE AUX FICHIERS" },
	search:     { icon: "🔍", name: "TRAQUE DES CCG" },
	education:  { icon: "📚", name: "ÉCOLE DES GHOULS" },
	moderation: { icon: "🔨", name: "PATROUILLE DE LA CCG" },
	love:       { icon: "🖤", name: "CŒURS BRISÉS" },
	rank:       { icon: "🏆", name: "RANGS DE LA CCG" }
};

const ROLE_TEXT = {
	0: "👤 Humains (tout le monde)",
	1: "🛡️ Gardiens du groupe",
	2: "👑 Conseil des ghouls (admins du bot)",
	3: "🩸 Le Roi Borgne (propriétaire)"
};

const QUOTES = [
	"« Je préfère être blessé que de blesser les autres. »",
	"« Même cassé, je continuerai à avancer. »",
	"« Un café chaud suffit parfois à réparer une âme. »",
	"« Le masque ne cache pas qui je suis, il révèle ce que je protège. »",
	"« Tant que j'ai des amis à défendre, je ne tomberai pas. »",
	"« La douleur m'a appris à être fort, pas à être cruel. »"
];

const NOT_FOUND = [
	"Cette commande a disparu dans le brouillard de Tokyo...",
	"Même mon kakugan ne la voit pas.",
	"Elle n'existe pas dans les archives de l'Anteiku."
];

// ═══════════════════════════════════════════════════════════
// 🔧 UTILITAIRES
// ═══════════════════════════════════════════════════════════
function theme(cat) {
	return CATEGORY_THEME[String(cat).toLowerCase()] || { icon: "🩸", name: String(cat).toUpperCase() };
}

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function cut(str, n) {
	str = String(str || "").replace(/\s+/g, " ").trim();
	return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function pick(x) {
	if (!x) return "";
	if (typeof x === "string") return x;
	return x.fr || x.en || Object.values(x)[0] || "";
}

function getDesc(c) {
	return pick(c.longDescription) || pick(c.description) || pick(c.shortDescription) || "Aucune description dans les archives.";
}

function bar(percent, size) {
	const total = size || 12;
	const p = Math.max(0, Math.min(100, percent));
	const filled = Math.round((p / 100) * total);
	return "█".repeat(filled) + "░".repeat(total - filled);
}

function buildCategories(role) {
	const cats = {};
	for (const [name, value] of commands) {
		if (!value || !value.config) continue;
		if ((value.config.role || 0) > role) continue;
		const cat = value.config.category || "Autres";
		if (!cats[cat]) cats[cat] = [];
		cats[cat].push(name);
	}
	for (const c of Object.keys(cats)) cats[c].sort();
	return cats;
}

function header(title) {
	return (
		"╭─────── ☕ ───────╮\n" +
		"   👁️ " + BOT_NAME + " 👁️\n" +
		"   " + title + "\n" +
		"╰─────── ☕ ───────╯\n"
	);
}

function footer(prefix) {
	const now = new Date();
	const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
	const date = now.toLocaleDateString("fr-FR");
	return (
		"\n\n━━━━━━━━━━━━━━━━━━━\n" +
		"🕐 " + time + "  •  📅 " + date + "\n" +
		"💡 " + prefix + "help2 <commande> pour les détails\n" +
		"☕ " + BOT_NAME + " • " + OWNER
	);
}

function split(text, max) {
	if (text.length <= max) return [text];
	const parts = [];
	let cur = "";
	for (const line of text.split("\n")) {
		if ((cur + "\n" + line).length > max) {
			parts.push(cur);
			cur = line;
		} else {
			cur = cur ? cur + "\n" + line : line;
		}
	}
	if (cur) parts.push(cur);
	return parts;
}

async function send(message, text) {
	const parts = split(text, MAX_MSG);
	for (let i = 0; i < parts.length; i++) {
		await message.reply(parts[i] + (parts.length > 1 ? "\n\n📨 Partie " + (i + 1) + "/" + parts.length : ""));
	}
}

// ═══════════════════════════════════════════════════════════
// 📤 MODULE
// ═══════════════════════════════════════════════════════════
module.exports = {
	config: {
		name: "help2",
		aliases: ["menu2", "repaires", "cmds2"],
		version: "4.0",
		author: OWNER,
		countDown: 5,
		role: 0,
		shortDescription: { en: "🌀 Menu de l'Anteiku avec statistiques par repaire" },
		longDescription: { en: "Liste des commandes par repaire, avec la part de chaque repaire, ton niveau d'accès, l'heure et la date." },
		category: "info",
		guide: {
			en:
				"{pn} → menu avec statistiques par repaire\n" +
				"{pn} <commande> → détails d'une commande"
		},
		priority: 1
	},

	onStart: async function ({ message, args, event, role }) {
		const prefix = getPrefix(event.threadID);
		const input = (args[0] || "").toLowerCase();

		// ═════════════════════════════════════════
		// 🏚️ MENU PRINCIPAL
		// ═════════════════════════════════════════
		if (!input) {
			const cats = buildCategories(role);
			const catNames = Object.keys(cats).sort();
			const accessible = catNames.reduce(function (sum, c) { return sum + cats[c].length; }, 0);
			const totalAll = commands.size;
			const accessPercent = totalAll ? Math.round((accessible / totalAll) * 100) : 100;

			let msg = header("🌀 𝐋𝐄𝐒 𝐑𝐄𝐏𝐀𝐈𝐑𝐄𝐒 𝐃𝐄 𝐓𝐎𝐊𝐘𝐎");
			msg += "\n" + rand(QUOTES) + "\n";

			for (const c of catNames) {
				const t = theme(c);
				const share = accessible ? Math.round((cats[c].length / accessible) * 100) : 0;
				msg += "\n" + t.icon + " 『 " + t.name + " 』";
				msg += "\n┃ " + bar(share) + " " + share + "% • " + cats[c].length + " cmd";
				for (let i = 0; i < cats[c].length; i += PER_LINE) {
					msg += "\n┃ " + cats[c].slice(i, i + PER_LINE).map(function (n) { return "🔹 " + n; }).join("    ");
				}
				msg += "\n";
			}

			msg += "\n📊 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗤𝗨𝗘𝗦";
			msg += "\n┃ 🔢 Commandes : " + totalAll;
			msg += "\n┃ 🏚️ Repaires : " + catNames.length;
			msg += "\n┃ 🔓 Ton accès : " + accessible + "/" + totalAll;
			msg += "\n┃ " + bar(accessPercent) + " " + accessPercent + "%";
			msg += "\n┃ 🔑 Préfixe : " + prefix;
			msg += "\n┃ 🟢 Statut : EN LIGNE";
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 📜 DÉTAILS D'UNE COMMANDE
		// ═════════════════════════════════════════
		const command = commands.get(input) || commands.get(aliases.get(input));

		if (!command) {
			const similar = [];
			for (const [n] of commands) {
				if (n.includes(input) || input.includes(n)) similar.push(n);
			}
			let msg = "❌ « " + input + " » : " + rand(NOT_FOUND);
			if (similar.length) msg += "\n\n👁️ Tu cherchais peut-être :\n" + similar.slice(0, 5).map(function (n) { return "┃ 🔹 " + prefix + n; }).join("\n");
			msg += "\n\n💡 " + prefix + "help2 pour voir tous les repaires.";
			return message.reply(msg);
		}

		const c = command.config;
		const t = theme(c.category);
		const guide = (pick(c.guide) || prefix + c.name)
			.replace(/\{pn\}/g, prefix + c.name)
			.replace(/\{p\}/g, prefix)
			.replace(/\{n\}/g, c.name);

		let msg = header("📜 𝐃𝐄́𝐓𝐀𝐈𝐋𝐒 𝐃𝐄 𝐋𝐀 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄");
		msg += "\n┌── " + t.icon + " ── 『 " + c.name.toUpperCase() + " 』";
		msg += "\n│ 📝 " + getDesc(c);
		msg += "\n├── 📌 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡𝗦";
		msg += "\n│ 🏚️ Repaire : " + t.name;
		msg += "\n│ 🔄 Alias : " + (c.aliases && c.aliases.length ? c.aliases.join(", ") : "Aucun");
		msg += "\n│ 📌 Version : " + (c.version || "1.0");
		msg += "\n│ 🔒 Accès : " + (ROLE_TEXT[c.role || 0] || ROLE_TEXT[0]);
		msg += "\n│ ⏱️ Attente : " + (c.countDown || 1) + "s";
		msg += "\n│ ✍️ Auteur : " + (c.author || "Inconnu");
		msg += "\n├── ⚙️ 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡";
		guide.split("\n").forEach(function (l) { msg += "\n│ " + l; });
		msg += "\n└──────────── 🕸";
		msg += footer(prefix);
		return send(message, msg);
	}
};
