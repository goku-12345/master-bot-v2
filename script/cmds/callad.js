const { getStreamsFromAttachment } = global.utils;

const OWNER = "Master Charbel";

// ═══════════════════════════════════════════════════════════
// ⚙️ CONFIGURATION
// ═══════════════════════════════════════════════════════════
const ADMIN_GROUP_ID = "27019957291032217";   // groupe où arrivent les messages
const ADMIN_IDS = ["61594170716211"];          // secours : envoi en privé à ces admins

const MAX_LENGTH = 1000;         // taille max d'un message
const COOLDOWN_MS = 60 * 1000;   // délai entre deux messages du même utilisateur
const MAX_PER_DAY = 10;          // messages max par utilisateur et par jour
const MAX_ATTACHMENTS = 5;

const mediaTypes = ["photo", "png", "animated_image", "video", "audio", "file"];

// ═══════════════════════════════════════════════════════════
// 🗃️ MÉMOIRE (en RAM, remise à zéro au redémarrage)
// ═══════════════════════════════════════════════════════════
if (!global.calladState) {
	global.calladState = {
		lastSent: {},      // { userID: timestamp }
		daily: {},         // { userID: { day: "2026-09-20", count: 3 } }
		tickets: {},       // { numéro: { userID, threadID, messageID, name } }
		counter: 0
	};
}
const S = global.calladState;

const FOOTER = "\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\u2615 𝐊𝐄𝐍 𝐊𝐀𝐍𝐄𝐊𝐈 • " + OWNER;

function header(title) {
	return "\u256D\u2500\u2500\u2500\u2500 \u2615 \u2500\u2500\u2500\u2500\u256E\n   " + title + "\n\u2570\u2500\u2500\u2500\u2500 \u2615 \u2500\u2500\u2500\u2500\u256F\n\n";
}

function today() {
	return new Date().toISOString().slice(0, 10);
}

function ticketNumber() {
	S.counter += 1;
	return "#" + String(S.counter).padStart(3, "0");
}

function isAdmin(senderID) {
	const id = String(senderID);
	if (ADMIN_IDS.map(String).includes(id)) return true;
	const admins = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.adminBot) || [];
	return admins.map(String).includes(id);
}

function clean(text) {
	return String(text || "").replace(/\s+/g, " ").trim();
}

// Petite pause pour ne pas envoyer plusieurs messages d'affilée
function sleep(ms) {
	return new Promise(function (r) { setTimeout(r, ms); });
}

async function sendTo(api, target, payload) {
	return new Promise(function (resolve, reject) {
		api.sendMessage(payload, target, function (err, info) {
			if (err) reject(err);
			else resolve(info);
		});
	});
}

module.exports = {
	config: {
		name: "callad",
		aliases: ["contact", "support", "admincall", "signaler"],
		version: "4.0",
		author: OWNER,
		countDown: 5,
		role: 0,
		description: { en: "📞 Contacter les administrateurs du bot" },
		category: "utility",
		guide: {
			en:
				"{pn} <message> → envoyer un message aux admins\n" +
				"{pn} bug <message> → signaler un bug\n" +
				"{pn} idee <message> → proposer une idée\n" +
				"{pn} statut → voir ton quota du jour\n\n" +
				"Tu peux joindre une image, une vidéo ou un fichier.\n" +
				"Marche en groupe et en privé."
		}
	},

	// ═════════════════════════════════════════════════════════
	// 📞 ENVOI D'UN MESSAGE
	// ═════════════════════════════════════════════════════════
	onStart: async function ({ args, message, event, usersData, api }) {
		const { senderID, threadID, isGroup, messageID } = event;
		const senderId = String(senderID);
		const first = (args[0] || "").toLowerCase();

		// ─── Aide ───
		if (!args.length || first === "help" || first === "aide") {
			return message.reply(
				header("📞 𝐂𝐀𝐋𝐋 𝐀𝐃𝐌𝐈𝐍") +
				"┃ 💬 callad <message>\n" +
				"┃ 🐞 callad bug <message>\n" +
				"┃ 💡 callad idee <message>\n" +
				"┃ 📊 callad statut\n\n" +
				"📎 Tu peux joindre une image ou une vidéo.\n" +
				"⏳ Un message par minute, " + MAX_PER_DAY + " par jour." +
				FOOTER
			);
		}

		// ─── Statut du quota ───
		if (first === "statut" || first === "status" || first === "quota") {
			const d = S.daily[senderId];
			const used = d && d.day === today() ? d.count : 0;
			return message.reply(
				header("📊 𝐐𝐔𝐎𝐓𝐀") +
				"┃ ✉️ Aujourd'hui : " + used + "/" + MAX_PER_DAY + "\n" +
				"┃ ⏳ Délai entre deux messages : " + Math.round(COOLDOWN_MS / 1000) + "s" +
				FOOTER
			);
		}

		// ─── Type de message (bug / idée / normal) ───
		let type = "message";
		let icon = "📝";
		let body = args;
		if (first === "bug" || first === "bogue") { type = "bug"; icon = "🐞"; body = args.slice(1); }
		else if (first === "idee" || first === "idée" || first === "idea") { type = "idée"; icon = "💡"; body = args.slice(1); }

		const content = clean(body.join(" "));

		if (!content && !(event.attachments && event.attachments.length)) {
			return message.reply("👁️ Écris ton message après la commande.\nExemple : callad bug le casino ne répond plus");
		}
		if (content.length > MAX_LENGTH) {
			return message.reply("✂️ Message trop long (" + content.length + " caractères). Maximum : " + MAX_LENGTH + ".");
		}

		// ─── Anti-spam (les admins sont exemptés) ───
		if (!isAdmin(senderId)) {
			const now = Date.now();
			const last = S.lastSent[senderId] || 0;
			if (now - last < COOLDOWN_MS) {
				const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
				return message.reply("⏳ Doucement, attends encore " + wait + "s avant d'envoyer un autre message.");
			}
			const d = S.daily[senderId];
			if (d && d.day === today() && d.count >= MAX_PER_DAY) {
				return message.reply("🚫 Tu as atteint la limite de " + MAX_PER_DAY + " messages aujourd'hui. Reviens demain.");
			}
		}

		try { api.setMessageReaction("⏳", messageID, function () {}, true); } catch (e) {}

		// ─── Infos de l'expéditeur ───
		let senderName = "Inconnu";
		try { senderName = (await usersData.getName(senderID)) || "Inconnu"; } catch (e) {}

		let where = "💬 Message privé";
		let whereId = "—";
		if (isGroup) {
			where = "👥 Groupe";
			whereId = String(threadID);
			try {
				const info = await new Promise(function (resolve, reject) {
					api.getThreadInfo(threadID, function (err, ret) { if (err) reject(err); else resolve(ret); });
				});
				where = "👥 " + (info.threadName || "Groupe sans nom");
			} catch (e) {}
		}

		// ─── Numéro de ticket ───
		const ticket = ticketNumber();
		const time = new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

		const adminMsg =
			header(icon + " 𝐍𝐎𝐔𝐕𝐄𝐀𝐔 " + type.toUpperCase() + " " + ticket) +
			"┃ 👤 " + senderName + "\n" +
			"┃ 🆔 " + senderId + "\n" +
			"┃ " + where + "\n" +
			(isGroup ? "┃ 🔗 " + whereId + "\n" : "") +
			"┃ 🕐 " + time + "\n\n" +
			(content ? "💬 " + content + "\n\n" : "📎 (pièce jointe sans texte)\n\n") +
			"↩️ Réponds à CE message pour écrire à l'utilisateur.";

		// ─── Pièces jointes ───
		let attachments = [];
		let attachmentNote = "";
		try {
			const source = (event.attachments || []).filter(function (a) { return mediaTypes.includes(a.type); });
			if (source.length > MAX_ATTACHMENTS) attachmentNote = " (" + MAX_ATTACHMENTS + " premières pièces jointes seulement)";
			attachments = await getStreamsFromAttachment(source.slice(0, MAX_ATTACHMENTS));
		} catch (e) {
			attachmentNote = " (pièce jointe non transmise)";
		}

		const payload = attachments.length ? { body: adminMsg, attachment: attachments } : { body: adminMsg };

		// ─── Envoi : groupe admin d'abord, sinon en privé à chaque admin ───
		let sentInfo = null;
		let sentWhere = "";

		try {
			sentInfo = await sendTo(api, ADMIN_GROUP_ID, payload);
			sentWhere = "groupe admin";
		} catch (err) {
			console.error("[CALLAD] Groupe admin injoignable :", err && err.message ? err.message : err);
		}

		if (!sentInfo) {
			for (const adminID of ADMIN_IDS) {
				try {
					// Les pièces jointes ont déjà été consommées : on renvoie un nouveau flux
					let retryPayload = { body: adminMsg };
					if (attachments.length) {
						try {
							retryPayload = { body: adminMsg, attachment: await getStreamsFromAttachment((event.attachments || []).filter(function (a) { return mediaTypes.includes(a.type); }).slice(0, MAX_ATTACHMENTS)) };
						} catch (e) {}
					}
					sentInfo = await sendTo(api, adminID, retryPayload);
					sentWhere = "message privé à l'admin";
					break;
				} catch (err) {
					console.error("[CALLAD] Envoi privé impossible (" + adminID + ") :", err && err.message ? err.message : err);
				}
			}
		}

		if (!sentInfo) {
			try { api.setMessageReaction("❌", messageID, function () {}, true); } catch (e) {}
			return message.reply(
				header("❌ 𝐄́𝐂𝐇𝐄𝐂") +
				"Ton message n'a pas pu être transmis aux admins.\n\n" +
				"┃ Réessaie dans quelques minutes.\n" +
				"┃ Si le problème continue, préviens un admin directement." +
				FOOTER
			);
		}

		// ─── Enregistre le ticket pour permettre la réponse ───
		S.tickets[ticket] = { userID: senderId, threadID: String(threadID), messageID: messageID, name: senderName };
		const adminMessageID = sentInfo && sentInfo.messageID;
		if (adminMessageID && global.GoatBot && global.GoatBot.onReply) {
			global.GoatBot.onReply.set(adminMessageID, {
				commandName: "callad",
				messageID: adminMessageID,
				ticket: ticket,
				type: "adminReply"
			});
		}

		// ─── Met à jour le quota ───
		S.lastSent[senderId] = Date.now();
		const d = S.daily[senderId];
		S.daily[senderId] = d && d.day === today() ? { day: d.day, count: d.count + 1 } : { day: today(), count: 1 };

		try { api.setMessageReaction("✅", messageID, function () {}, true); } catch (e) {}

		return message.reply(
			header("✅ 𝐄𝐍𝐕𝐎𝐘𝐄́") +
			"┃ 🎫 Ticket : " + ticket + "\n" +
			"┃ 📨 Transmis : " + sentWhere + "\n" +
			"┃ ✉️ Aujourd'hui : " + S.daily[senderId].count + "/" + MAX_PER_DAY + "\n\n" +
			"Tu recevras une réponse ici dès qu'un admin aura vu ton message." +
			attachmentNote +
			FOOTER
		);
	},

	// ═════════════════════════════════════════════════════════
	// ↩️ RÉPONSE DE L'ADMIN (en répondant au message reçu)
	// ═════════════════════════════════════════════════════════
	onReply: async function ({ event, message, Reply, api, usersData }) {
		const { senderID, body } = event;

		if (!isAdmin(senderID)) {
			return message.reply("🔒 Seuls les admins peuvent répondre à ce message.");
		}

		const ticket = S.tickets[Reply.ticket];
		if (!ticket) {
			return message.reply("⚠️ Ticket introuvable (le bot a été redémarré depuis). Écris directement à l'utilisateur.");
		}

		const text = clean(body);
		if (!text && !(event.attachments && event.attachments.length)) {
			return message.reply("👁️ Écris ta réponse.");
		}

		let adminName = "Un admin";
		try { adminName = (await usersData.getName(senderID)) || adminName; } catch (e) {}

		let attachments = [];
		try {
			attachments = await getStreamsFromAttachment((event.attachments || []).filter(function (a) { return mediaTypes.includes(a.type); }).slice(0, MAX_ATTACHMENTS));
		} catch (e) {}

		const reply =
			header("📩 𝐑𝐄́𝐏𝐎𝐍𝐒𝐄 𝐃𝐔 𝐒𝐔𝐏𝐏𝐎𝐑𝐓") +
			"┃ 🎫 Ticket : " + Reply.ticket + "\n" +
			"┃ 👑 " + adminName + "\n\n" +
			(text ? "💬 " + text : "📎 (pièce jointe)") +
			FOOTER;

		const payload = attachments.length ? { body: reply, attachment: attachments } : { body: reply };

		// On répond dans le fil d'origine ; si ça échoue (ex. privé indisponible), on tente le privé direct
		let delivered = false;
		try {
			await new Promise(function (resolve, reject) {
				api.sendMessage(payload, ticket.threadID, function (err) { if (err) reject(err); else resolve(); }, ticket.messageID);
			});
			delivered = true;
		} catch (e) {
			console.error("[CALLAD] Réponse dans le fil impossible :", e && e.message ? e.message : e);
		}

		if (!delivered) {
			try {
				await sendTo(api, ticket.userID, { body: reply });
				delivered = true;
			} catch (e) {
				console.error("[CALLAD] Réponse privée impossible :", e && e.message ? e.message : e);
			}
		}

		try { api.setMessageReaction(delivered ? "✅" : "❌", event.messageID, function () {}, true); } catch (e) {}

		return message.reply(
			delivered
				? "✅ Réponse envoyée à " + ticket.name + " (" + Reply.ticket + ")."
				: "❌ Impossible de joindre " + ticket.name + ". Il faudra lui écrire directement."
		);
	}
};
