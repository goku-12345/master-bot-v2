const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

const OWNER = "Master Charbel";

// Admins protégés : personne ne peut les retirer avec "admin remove".
// Mets ici ton ID pour ne jamais te retrouver bloqué hors de ton propre bot.
const PROTECTED_IDS = ["61594170716211"];

const HEADER =
	"\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u2615 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E\n" +
	"   \uD83D\uDC51 𝐀𝐃𝐌𝐈𝐍 • 𝐀𝐍𝐓𝐄𝐈𝐊𝐔\n" +
	"\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u2615 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F\n\n";

const FOOTER = "\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\u2615 𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 • " + OWNER;

const QUOTES = [
	"« Ceux qui portent le masque protègent l'Anteiku. »",
	"« Un roi n'est fort que par ceux qui le suivent. »",
	"« Le pouvoir se partage, la confiance se mérite. »"
];

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Récupère les UID ciblés : mentions, réponse à un message, ou IDs tapés
function extractUids(event, args) {
	const { mentions, messageReply } = event;
	let uids = [];
	if (mentions && Object.keys(mentions).length > 0) uids = Object.keys(mentions);
	else if (messageReply) uids.push(String(messageReply.senderID));
	else uids = args.slice(1).filter(function (a) { return /^\d{5,20}$/.test(a); });
	// Supprime les doublons et force le texte (les IDs de config.json sont des chaînes)
	return Array.from(new Set(uids.map(String)));
}

// Sauvegarde la config : si l'écriture échoue, on le sait au lieu de faire semblant
function saveConfig() {
	try {
		writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
		return true;
	} catch (e) {
		console.error("[ADMIN] Écriture de config.json impossible :", e.message);
		return false;
	}
}

async function nameOf(usersData, uid) {
	try {
		return (await usersData.getName(uid)) || "Inconnu";
	} catch (e) {
		return "Inconnu";
	}
}

function line(icon, name, uid) {
	return "\u2503 " + icon + " " + name + "\n\u2503    \uD83C\uDD94 " + uid;
}

module.exports = {
	config: {
		name: "admin",
		aliases: ["admins", "adm"],
		version: "3.0",
		author: OWNER,
		countDown: 5,
		role: 2,
		description: {
			en: "👑 Gestion des administrateurs du bot"
		},
		category: "admin",
		guide: {
			en:
				"{pn} add <@|id|réponse> → ajouter un admin\n" +
				"{pn} remove <@|id|réponse> → retirer un admin\n" +
				"{pn} list → liste des admins\n" +
				"{pn} check [@|id] → vérifier un utilisateur\n" +
				"{pn} me → suis-je admin ?"
		}
	},

	onStart: async function ({ message, args, usersData, event }) {
		const senderID = String(event.senderID);
		const action = (args[0] || "").toLowerCase();

		// Sécurité : garantit que la liste existe
		if (!Array.isArray(config.adminBot)) config.adminBot = [];

		// ═════════════════════════════════════════
		// 📖 Aide
		// ═════════════════════════════════════════
		if (!action || action === "help" || action === "aide") {
			return message.reply(
				HEADER +
				"👑 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦\n" +
				"\u2503 ➕ admin add <@|id|réponse>\n" +
				"\u2503 ➖ admin remove <@|id|réponse>\n" +
				"\u2503 📋 admin list\n" +
				"\u2503 🔍 admin check [@|id]\n" +
				"\u2503 🙋 admin me\n\n" +
				"💡 Alias : -a  -r  -l  -c\n" +
				"🔒 Les admins protégés ne peuvent pas être retirés." +
				FOOTER
			);
		}

		// ═════════════════════════════════════════
		// ➕ AJOUTER
		// ═════════════════════════════════════════
		if (action === "add" || action === "-a") {
			const uids = extractUids(event, args);
			if (!uids.length) {
				return message.reply(
					HEADER + "❌ Indique un utilisateur : mention, réponse à un message, ou ID.\n\u2503 Exemple : admin add 100012345678901" + FOOTER
				);
			}

			const toAdd = [];
			const already = [];
			for (const uid of uids) {
				if (config.adminBot.map(String).includes(uid)) already.push(uid);
				else toAdd.push(uid);
			}

			if (toAdd.length) {
				config.adminBot.push(...toAdd);
				if (!saveConfig()) {
					// On annule en mémoire pour ne pas avoir un état différent du fichier
					config.adminBot = config.adminBot.filter(function (id) { return !toAdd.includes(String(id)); });
					return message.reply(HEADER + "❌ Impossible d'écrire config.json. Aucun changement effectué." + FOOTER);
				}
			}

			let msg = HEADER;
			if (toAdd.length) {
				msg += "✅ 𝗔𝗝𝗢𝗨𝗧𝗘́𝗦 (" + toAdd.length + ")\n";
				for (const uid of toAdd) msg += line("👑", await nameOf(usersData, uid), uid) + "\n";
				msg += "\n";
			}
			if (already.length) {
				msg += "⚠️ 𝗗𝗘́𝗝𝗔̀ 𝗔𝗗𝗠𝗜𝗡 (" + already.length + ")\n";
				for (const uid of already) msg += line("🔸", await nameOf(usersData, uid), uid) + "\n";
				msg += "\n";
			}
			msg += "📊 Total admins : " + config.adminBot.length;
			if (toAdd.length) msg += "\n💾 Enregistré dans config.json (sera perdu au redéploiement si non commité sur GitHub)";
			return message.reply(msg + FOOTER);
		}

		// ═════════════════════════════════════════
		// ➖ RETIRER
		// ═════════════════════════════════════════
		if (action === "remove" || action === "-r") {
			const uids = extractUids(event, args);
			if (!uids.length) {
				return message.reply(
					HEADER + "❌ Indique un utilisateur : mention, réponse à un message, ou ID." + FOOTER
				);
			}

			const toRemove = [];
			const notAdmin = [];
			const protectedIds = [];

			for (const uid of uids) {
				if (PROTECTED_IDS.map(String).includes(uid)) protectedIds.push(uid);
				else if (config.adminBot.map(String).includes(uid)) toRemove.push(uid);
				else notAdmin.push(uid);
			}

			// Empêche de retirer le dernier admin (le bot deviendrait inutilisable)
			if (toRemove.length && config.adminBot.length - toRemove.length < 1) {
				return message.reply(HEADER + "🚫 Impossible : il doit rester au moins un admin." + FOOTER);
			}

			if (toRemove.length) {
				const backup = config.adminBot.slice();
				config.adminBot = config.adminBot.filter(function (id) { return !toRemove.includes(String(id)); });
				if (!saveConfig()) {
					config.adminBot = backup;
					return message.reply(HEADER + "❌ Impossible d'écrire config.json. Aucun changement effectué." + FOOTER);
				}
			}

			let msg = HEADER;
			if (toRemove.length) {
				msg += "✅ 𝗥𝗘𝗧𝗜𝗥𝗘́𝗦 (" + toRemove.length + ")\n";
				for (const uid of toRemove) msg += line("🗑️", await nameOf(usersData, uid), uid) + "\n";
				msg += "\n";
			}
			if (protectedIds.length) {
				msg += "🔒 𝗣𝗥𝗢𝗧𝗘́𝗚𝗘́𝗦 (" + protectedIds.length + ")\n";
				for (const uid of protectedIds) msg += line("🛡️", await nameOf(usersData, uid), uid) + "\n";
				msg += "\u2503 Ces admins ne peuvent pas être retirés.\n\n";
			}
			if (notAdmin.length) {
				msg += "⚠️ 𝗣𝗔𝗦 𝗔𝗗𝗠𝗜𝗡 (" + notAdmin.length + ")\n";
				for (const uid of notAdmin) msg += line("🔸", await nameOf(usersData, uid), uid) + "\n";
				msg += "\n";
			}
			msg += "📊 Total admins : " + config.adminBot.length;
			return message.reply(msg + FOOTER);
		}

		// ═════════════════════════════════════════
		// 📋 LISTE
		// ═════════════════════════════════════════
		if (action === "list" || action === "-l" || action === "liste") {
			if (!config.adminBot.length) {
				return message.reply(HEADER + "📭 Aucun administrateur configuré." + FOOTER);
			}
			let msg = HEADER + "👑 𝗔𝗗𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗔𝗧𝗘𝗨𝗥𝗦 (" + config.adminBot.length + ")\n\n";
			let i = 1;
			for (const uid of config.adminBot) {
				const id = String(uid);
				const mark = PROTECTED_IDS.map(String).includes(id) ? "🛡️" : "👑";
				msg += i + ". " + line(mark, await nameOf(usersData, id), id) + "\n";
				i++;
			}
			msg += "\n🛡️ = protégé (ne peut pas être retiré)\n\n" + rand(QUOTES);
			return message.reply(msg + FOOTER);
		}

		// ═════════════════════════════════════════
		// 🔍 VÉRIFIER
		// ═════════════════════════════════════════
		if (action === "check" || action === "-c" || action === "me") {
			let targetID = senderID;
			if (action !== "me") {
				const uids = extractUids(event, args);
				if (uids.length) targetID = uids[0];
			}
			const name = await nameOf(usersData, targetID);
			const isAdmin = config.adminBot.map(String).includes(targetID);
			const isProtected = PROTECTED_IDS.map(String).includes(targetID);

			let status;
			if (isProtected) status = "🛡️ ADMIN PROTÉGÉ";
			else if (isAdmin) status = "✅ ADMIN DU BOT";
			else status = "🔴 PAS ADMIN";

			return message.reply(
				HEADER +
				"🔍 𝗩𝗘́𝗥𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡\n" +
				"\u2503 👤 " + name + "\n" +
				"\u2503 🆔 " + targetID + "\n" +
				"\u2503 📌 " + status +
				FOOTER
			);
		}

		return message.reply(HEADER + "👁️ Action inconnue. Tape admin pour voir l'aide." + FOOTER);
	}
};
