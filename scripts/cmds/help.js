const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// ═══════════════════════════════════════════════════════════
// ⚙️ IDENTITÉ DU BOT (modifie ici pour tout changer d'un coup)
// ═══════════════════════════════════════════════════════════
const BOT_NAME = "𝐒𝐡𝐚𝐝𝐨𝐰 𝐆𝐡𝐨𝐮𝐥";
const OWNER = "Master Charbel";
const MAX_MSG = 1800;
const PER_LINE = 3;

// Les catégories prennent des noms de l'univers Tokyo Ghoul
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
	music:      { icon: "🎻", name: "MÉLODIE DE TOKYO" },
	utility:    { icon: "🕸️", name: "OUTILS DU CAFÉ" },
	tools:      { icon: "🕸️", name: "OUTILS DU CAFÉ" },
	system:     { icon: "⚙️", name: "CELLULES RC" },
	group:      { icon: "🏚️", name: "REPAIRE DES GHOULS" },
	box:        { icon: "🏚️", name: "REPAIRE DES GHOULS" },
	anime:      { icon: "🎌", name: "MONDE DES ANIMES" },
	download:   { icon: "📥", name: "CHASSE AUX FICHIERS" },
	love:       { icon: "🖤", name: "CŒURS BRISÉS" },
	rank:       { icon: "🏆", name: "RANGS DE LA CCG" }
};

const ROLE_TEXT = {
	0: "👤 Humains (tout le monde)",
	1: "🛡️ Gardiens du groupe",
	2: "👑 Conseil des ghouls (admins du bot)",
	3: "🩸 Le Roi Borgne (propriétaire)"
};

// Le rang du bot évolue avec son nombre de commandes
const BOT_RANKS = [
	{ min: 0,   title: "🌱 Humain ordinaire" },
	{ min: 15,  title: "☕ Serveur de l'Anteiku" },
	{ min: 30,  title: "👁️ Ghoul Borgne" },
	{ min: 60,  title: "🎭 Masque Noir" },
	{ min: 100, title: "🖤 Ghoul aux Cheveux Blancs" },
	{ min: 150, title: "👑 Le Roi Borgne" }
];

const QUOTES = [
	"« Je préfère être blessé que de blesser les autres. »",
	"« Même cassé, je continuerai à avancer. »",
	"« Un café chaud suffit parfois à réparer une âme. »",
	"« Le masque ne cache pas qui je suis, il révèle ce que je protège. »",
	"« Tant que j'ai des amis à défendre, je ne tomberai pas. »",
	"« La douleur m'a appris à être fort, pas à être cruel. »",
	"« Ce monde est tordu... et c'est nous qui l'avons tordu. »"
];

const TIPS = [
	"help <commande> : les secrets d'une commande",
	"help <catégorie> : explorer un repaire",
	"help search <mot> : traquer une commande",
	"help all : tout le menu de l'Anteiku",
	"help random : laisser le destin choisir"
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

function cap(s) {
	s = String(s || "");
	return s.charAt(0).toUpperCase() + s.slice(1);
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

function getShort(c) {
	return pick(c.shortDescription) || pick(c.description) || pick(c.longDescription) || "";
}

function botRank(count) {
	let title = BOT_RANKS[0].title;
	for (const r of BOT_RANKS) if (count >= r.min) title = r.title;
	return title;
}

function bar(percent, size) {
	const total = size || 10;
	const p = Math.max(0, Math.min(100, percent));
	const filled = Math.round((p / 100) * total);
	return "█".repeat(filled) + "░".repeat(total - filled);
}

function formatUptime() {
	const s = Math.floor(process.uptime());
	const d = Math.floor(s / 86400);
	const h = Math.floor((s % 86400) / 3600);
	const m = Math.floor((s % 3600) / 60);
	return d ? d + "j " + h + "h " + m + "m" : h + "h " + m + "m";
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
	return (
		"\n\n━━━━━━━━━━━━━━━━━━━\n" +
		"💡 " + prefix + rand(TIPS) + "\n" +
		"☕ " + BOT_NAME + " • " + OWNER
	);
}

// Bloc d'une catégorie, dans le style des repaires
function block(cat, names) {
	const t = theme(cat);
	let out = "\n┌── " + t.icon + " ── 『 " + t.name + " 』 ✦ " + names.length;
	for (let i = 0; i < names.length; i += PER_LINE) {
		out += "\n│ " + names.slice(i, i + PER_LINE).map(function (n) { return "•" + n; }).join(" | ");
	}
	out += "\n└──────────── 🕸";
	return out;
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
		name: "help",
		aliases: ["aide", "menu", "cmds", "commandes", "anteiku"],
		version: "5.0",
		author: OWNER,
		countDown: 5,
		role: 0,
		shortDescription: { en: "📖 Menu de l'Anteiku : toutes les commandes" },
		longDescription: { en: "Menu des commandes rangées par repaires, détails d'une commande, recherche et commande au hasard." },
		category: "info",
		guide: {
			en:
				"{pn} → accueil de l'Anteiku\n" +
				"{pn} all → toutes les commandes\n" +
				"{pn} <catégorie> → explorer un repaire\n" +
				"{pn} <commande> → détails d'une commande\n" +
				"{pn} search <mot> → traquer une commande\n" +
				"{pn} random → laisser le destin choisir"
		},
		priority: 1
	},

	onStart: async function ({ message, args, event, role }) {
		const prefix = getPrefix(event.threadID);
		const cats = buildCategories(role);
		const catNames = Object.keys(cats).sort();
		const allNames = [];
		for (const c of catNames) for (const n of cats[c]) allNames.push(n);
		const total = allNames.length;
		const input = (args[0] || "").toLowerCase();

		// ═════════════════════════════════════════
		// 🏚️ ACCUEIL : liste des repaires
		// ═════════════════════════════════════════
		if (!input) {
			const nextRank = BOT_RANKS.find(function (r) { return total < r.min; });
			const progress = nextRank ? Math.round((total / nextRank.min) * 100) : 100;

			let msg = header("📖 𝐌𝐄𝐍𝐔 𝐃𝐄 𝐋'𝐀𝐍𝐓𝐄𝐈𝐊𝐔");
			msg += "\n🌆 Bienvenue à l'Anteiku, voyageur.";
			msg += "\n" + rand(QUOTES) + "\n";

			msg += "\n📊 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗤𝗨𝗘𝗦 𝗗𝗨 𝗚𝗛𝗢𝗨𝗟";
			msg += "\n┃ 📦 Commandes : " + total;
			msg += "\n┃ 🏚️ Repaires : " + catNames.length;
			msg += "\n┃ 🔑 Préfixe : " + prefix;
			msg += "\n┃ ⏱️ Éveillé depuis : " + formatUptime();
			msg += "\n┃ 🎭 Rang : " + botRank(total);
			msg += "\n┃ " + bar(progress) + " " + progress + "%";
			if (nextRank) msg += "\n┃ ➜ Prochain : " + nextRank.title + " (" + nextRank.min + " cmd)";

			msg += "\n\n🏚️ 𝗟𝗘𝗦 𝗥𝗘𝗣𝗔𝗜𝗥𝗘𝗦";
			catNames.forEach(function (c, i) {
				const t = theme(c);
				const last = i === catNames.length - 1;
				msg += "\n" + (last ? "┗" : "┣") + " " + t.icon + " " + t.name + " (" + cats[c].length + ")";
			});

			msg += "\n\n➤ " + prefix + "help <catégorie> pour entrer dans un repaire";
			msg += "\n➤ " + prefix + "help all pour tout voir";
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 📚 TOUTES LES COMMANDES
		// ═════════════════════════════════════════
		if (input === "all" || input === "tout") {
			let msg = header("📚 𝐋𝐄𝐒 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄𝐒 𝐃𝐔 𝐆𝐇𝐎𝐔𝐋");
			for (const c of catNames) msg += block(c, cats[c]);
			msg += "\n\n📊 " + total + " commandes • " + catNames.length + " repaires";
			msg += "\n\n" + rand(QUOTES);
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 🎲 HASARD
		// ═════════════════════════════════════════
		if (input === "random" || input === "hasard") {
			const c = commands.get(rand(allNames)).config;
			const t = theme(c.category);
			let msg = header("🎲 𝐋𝐄 𝐃𝐄𝐒𝐓𝐈𝐍 𝐀 𝐂𝐇𝐎𝐈𝐒𝐈");
			msg += "\n🎯 " + prefix + c.name;
			msg += "\n┃ " + t.icon + " Repaire : " + t.name;
			msg += "\n┃ 📝 " + cut(getDesc(c), 120);
			msg += "\n┃ ➤ " + prefix + "help " + c.name + " pour les secrets";
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 🔍 RECHERCHE
		// ═════════════════════════════════════════
		if (input === "search" || input === "find" || input === "cherche") {
			const term = args.slice(1).join(" ").toLowerCase().trim();
			if (!term) return message.reply("🔍 Sur quelle piste dois-je te mettre ?\nExemple : " + prefix + "help search musique");

			const found = [];
			for (const n of allNames) {
				const c = commands.get(n).config;
				const hay = (n + " " + (c.aliases || []).join(" ") + " " + getDesc(c) + " " + (c.category || "")).toLowerCase();
				if (hay.includes(term)) found.push(c);
			}

			let msg = header("🔍 𝐓𝐑𝐀𝐐𝐔𝐄𝐑 𝐔𝐍𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄");
			msg += "\n🕵️ Piste : « " + term + " » • " + found.length + " trace(s)\n";
			if (!found.length) {
				msg += "\n👁️ Rien trouvé dans les archives de l'Anteiku...";
			} else {
				msg += "\n┌── 🔎 ── 『 TRACES 』";
				found.slice(0, 15).forEach(function (c) {
					msg += "\n│ " + theme(c.category).icon + " " + prefix + c.name + " — " + cut(getShort(c), 35);
				});
				if (found.length > 15) msg += "\n│ … et " + (found.length - 15) + " autres";
				msg += "\n└──────────── 🕸";
			}
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 🏚️ UN REPAIRE (catégorie)
		// ═════════════════════════════════════════
		const matchedCat = catNames.find(function (c) {
			return c.toLowerCase() === input || theme(c).name.toLowerCase() === input;
		});
		if (matchedCat) {
			const t = theme(matchedCat);
			let msg = header(t.icon + " " + t.name);
			msg += "\n📦 " + cats[matchedCat].length + " commande(s)\n";
			msg += "\n┌── " + t.icon + " ── 『 " + t.name + " 』";
			cats[matchedCat].forEach(function (n) {
				msg += "\n│ ✦ " + prefix + n + " — " + cut(getShort(commands.get(n).config), 38);
			});
			msg += "\n└──────────── 🕸";
			msg += footer(prefix);
			return send(message, msg);
		}

		// ═════════════════════════════════════════
		// 📜 DÉTAILS D'UNE COMMANDE
		// ═════════════════════════════════════════
		const command = commands.get(input) || commands.get(aliases.get(input));

		if (!command) {
			const similar = allNames.filter(function (n) { return n.includes(input) || input.includes(n); }).slice(0, 5);
			let msg = "❌ « " + input + " » : " + rand(NOT_FOUND);
			if (similar.length) msg += "\n\n👁️ Tu cherchais peut-être :\n" + similar.map(function (n) { return "┃ ✦ " + prefix + n; }).join("\n");
			msg += "\n\n💡 " + prefix + "help search " + input + " pour traquer cette commande.";
			return message.reply(msg);
		}

		const c = command.config;
		const t = theme(c.category);
		const guide = (pick(c.guide) || prefix + c.name)
			.replace(/\{pn\}/g, prefix + c.name)
			.replace(/\{p\}/g, prefix)
			.replace(/\{n\}/g, c.name);
		const sameCat = (cats[c.category || "Autres"] || []).filter(function (n) { return n !== c.name; }).slice(0, 4);

		let msg = header("📜 𝐒𝐄𝐂𝐑𝐄𝐓𝐒 𝐃'𝐔𝐍𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄");
		msg += "\n┌── " + t.icon + " ── 『 " + c.name.toUpperCase() + " 』";
		msg += "\n│ 📝 " + getDesc(c);
		msg += "\n├── 📌 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡𝗦";
		msg += "\n│ 🏚️ Repaire : " + t.name;
		msg += "\n│ 🔗 Alias : " + (c.aliases && c.aliases.length ? c.aliases.join(", ") : "Aucun");
		msg += "\n│ 🔐 Accès : " + (ROLE_TEXT[c.role || 0] || ROLE_TEXT[0]);
		msg += "\n│ ⏳ Attente : " + (c.countDown || 1) + "s";
		msg += "\n│ 🏷️ Version : " + (c.version || "1.0");
		msg += "\n│ ✍️ Auteur : " + (c.author || "Inconnu");
		msg += "\n├── 💡 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡";
		guide.split("\n").forEach(function (l) { msg += "\n│ " + l; });
		if (sameCat.length) {
			msg += "\n├── 🧭 𝗗𝗔𝗡𝗦 𝗟𝗘 𝗠𝗘̂𝗠𝗘 𝗥𝗘𝗣𝗔𝗜𝗥𝗘";
			msg += "\n│ " + sameCat.map(function (n) { return "•" + n; }).join(" | ");
		}
		msg += "\n└──────────── 🕸";
		msg += footer(prefix);
		return send(message, msg);
	}
};
