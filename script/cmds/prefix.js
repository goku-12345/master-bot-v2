const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.5",
		author: "Master Charbel",
		countDown: 5,
		role: 0,
		description: "Modifier le préfixe de commande (Thème Tokyo Ghoul)",
		category: "config",
		guide: "{pn} <nouveau_préfixe> ou {pn} reset"
	},

	langs: {
		en: {
			reset: "╭─────── ☕ ───────╮\n   🩸 𝐀𝐍𝐓𝐄𝐈𝐊𝐔 𝐒𝐘𝐒𝐓𝐄𝐌\n╰─────── ☕ ───────╯\n\n Préfixe réinitialisé au signal d'origine : %1\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			onlyAdmin: "╭─────── ⚔️ ───────╮\n   ❌ 𝐀𝐂𝐂È𝐒 𝐑𝐄𝐒𝐓𝐑𝐄𝐈𝐍𝐓 𝐂𝐂𝐆\n╰─────── ⚔️ ───────╯\n\n Seuls les Inspecteurs en chef (Admins) ont l'autorisation de modifier le préfixe global.\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			confirmGlobal: "╭─────── 🩸 ───────╮\n   ⚡ 𝐌𝐔𝐓𝐀𝐓𝐈𝐎𝐍 𝐆𝐋𝐎𝐁𝐀𝐋𝐄\n╰─────── 🩸 ───────╯\n\n Réagis avec une émotion à ce message pour valider le nouveau préfixe GLOBAL.\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			confirmThisThread: "╭─────── ☕ ───────╮\n   ⚡ 𝐌𝐀𝐑𝐐𝐔𝐀𝐆𝐄 𝐃𝐔 𝐓𝐄𝐑𝐑𝐈𝐓𝐎𝐈𝐑𝐄\n╰─────── ☕ ───────╯\n\n Réagis avec une émotion à ce message pour modifier le préfixe de ce SERVEUR.\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			successGlobal: "╭─────── 👹 ───────╮\n   ✅ 𝐊𝐀𝐊𝐔𝐉𝐀 𝐀𝐂𝐓𝐈𝐕É\n╰─────── 👹 ───────╯\n\n Le préfixe global a muté avec succès vers : %1\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			successThisThread: "╭─────── 🎭 ───────╮\n   ✅ 𝐌𝐀𝐒𝐐𝐔𝐄 𝐀𝐉𝐔𝐒𝐓É\n╰─────── 🎭 ───────╯\n\n Nouveau préfixe local établi sur ce territoire : %1\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel",
			myPrefix: "╭─────── ☕ ───────╮\n   🩸 𝐆𝐇𝐎𝐔𝐋 𝐏𝐑𝐄𝐅𝐈𝐗 𝐒𝐓𝐀𝐓𝐔𝐒\n╰─────── ☕ ───────╯\n\n 🌐 Préfixe Global : %1\n 📍 Préfixe Local  : %2\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔🇱 • Master Charbel"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = { commandName, author: event.senderID, newPrefix };

		if (args[1] === "-g") {
			if (role < 2) return message.reply(getLang("onlyAdmin"));
			formSet.setGlobal = true;
		} else {
			formSet.setGlobal = false;
		}

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;
        
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)));
	}
};