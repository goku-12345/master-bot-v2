
const fs = require("fs-extra");

const CHARVEX = {
  name: "CHARVEX SYSTEM",
  line: "━━━━━━━━━━━━━━━━━━━━",
  icon: "⚡"
};

function panel(title, lines = []) {
  return [
    "╭━━━〔 ⚡ CHARVEX ⚡ 〕━━━╮",
    `┃ ${title}`,
    "┣━━━━━━━━━━━━━━━━━━━━",
    ...lines.map(line => `┃ ${line}`),
    "╰━━━━━━━━━━━━━━━━━━━━╯"
  ].join("\n");
}

module.exports = {
  config: {
    name: "prefix",
    aliases: ["setprefix", "pre"],
    version: "2.0.0",
    author: "Master Charbel",
    countDown: 3,
    role: 0,
    description: "Gestion du système de préfixe CHARVEX",
    category: "SYSTEM",
    guide: {
      en:
        "{pn} <préfixe> — Changer le préfixe local\n" +
        "{pn} <préfixe> -g — Changer le préfixe global\n" +
        "{pn} reset — Réinitialiser le préfixe local"
    }
  },

  langs: {
    en: {
      help: panel("PREFIX CONTROL", [
        "Usage :",
        "prefix !       → Préfixe local",
        "prefix ! -g    → Préfixe global",
        "prefix reset  → Réinitialiser",
        "",
        "Created by Master Charbel"
      ]),

      admin: panel("ACCESS DENIED", [
        "⛔ Autorisation insuffisante.",
        "Le changement global est réservé",
        "aux administrateurs autorisés."
      ]),

      invalid: panel("INVALID PREFIX", [
        "❌ Préfixe invalide.",
        "Choisis entre 1 et 10 caractères.",
        "Évite les espaces et les retours ligne."
      ]),

      confirmLocal: panel("LOCAL CONFIGURATION", [
        "Nouvelle configuration détectée.",
        "Réagis à ce message pour confirmer.",
        "🌐 Portée : cette conversation",
        "Créateur : Master Charbel"
      ]),

      confirmGlobal: panel("GLOBAL CONFIGURATION", [
        "⚠️ Modification globale demandée.",
        "Réagis pour confirmer le changement.",
        "🌐 Portée : tout le bot",
        "Créateur : Master Charbel"
      ]),

      successLocal: panel("LOCAL SYSTEM UPDATED", [
        "✅ Préfixe de cette conversation : %1",
        "CHARVEX est prêt."
      ]),

      successGlobal: panel("GLOBAL SYSTEM UPDATED", [
        "✅ Nouveau préfixe global : %1",
        "Configuration mise à jour."
      ]),

      reset: panel("SYSTEM RESTORED", [
        "🔄 Préfixe local réinitialisé.",
        "Préfixe actuel : %1"
      ]),

      status: panel("SYSTEM STATUS", [
        "🌐 Global : %1",
        "📍 Local : %2",
        "👑 Créateur : Master Charbel"
      ]),

      cancelled: panel("REQUEST EXPIRED", [
        "Cette demande n'est plus disponible."
      ])
    }
  },

  onStart: async function ({
    message,
    args,
    role,
    commandName,
    event,
    threadsData,
    getLang
  }) {
    const threadID = event.threadID;

    // Afficher l'état actuel
    if (!args[0]) {
      return message.reply(
        getLang(
          "status",
          global.GoatBot.config.prefix,
          require("../../../utils").getPrefix
            ? require("../../../utils").getPrefix(threadID)
            : global.GoatBot.config.prefix
        )
      );
    }

    // Réinitialisation locale
    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(threadID, null, "data.prefix");

      const localPrefix = global.GoatBot.config.prefix;

      return message.reply(getLang("reset", localPrefix));
    }

    const newPrefix = args[0];

    // Vérification du format
    if (
      newPrefix.length > 10 ||
      /\s/.test(newPrefix) ||
      /[\r\n]/.test(newPrefix)
    ) {
      return message.reply(getLang("invalid"));
    }

    const setGlobal = args[1] === "-g";

    // Seuls les rôles autorisés peuvent changer le préfixe global
    if (setGlobal && role < 2) {
      return message.reply(getLang("admin"));
    }

    const request = {
      commandName,
      author: event.senderID,
      threadID,
      newPrefix,
      setGlobal
    };

    const text = setGlobal
      ? getLang("confirmGlobal")
      : getLang("confirmLocal");

    return message.reply(text, (err, info) => {
      if (err || !info) {
        console.error("[CHARVEX PREFIX] Confirmation error:", err);
        return;
      }

      request.messageID = info.messageID;

      global.GoatBot.onReaction.set(info.messageID, request);
    });
  },

  onReaction: async function ({
    message,
    threadsData,
    event,
    Reaction,
    getLang
  }) {
    if (!Reaction) return;

    const {
      author,
      newPrefix,
      setGlobal,
      threadID,
      messageID
    } = Reaction;

    // Seul l'auteur de la demande peut confirmer
    if (String(event.userID) !== String(author)) return;

    // Empêche une confirmation depuis une autre conversation
    if (String(event.threadID) !== String(threadID)) return;

    try {
      if (setGlobal) {
        global.GoatBot.config.prefix = newPrefix;

        fs.writeFileSync(
          global.client.dirConfig,
          JSON.stringify(global.GoatBot.config, null, 2),
          "utf8"
        );

        global.GoatBot.onReaction.delete(messageID);

        return message.reply(getLang("successGlobal", newPrefix));
      }

      await threadsData.set(threadID, newPrefix, "data.prefix");

      global.GoatBot.onReaction.delete(messageID);

      return message.reply(getLang("successLocal", newPrefix));
    } catch (error) {
      console.error("[CHARVEX PREFIX] Update error:", error);

      global.GoatBot.onReaction.delete(messageID);

      return message.reply(
        panel("SYSTEM ERROR", [
          "❌ Impossible d'enregistrer le préfixe.",
          "Vérifie la configuration du bot."
        ])
      );
    }
  },

  onChat: async function ({ event, message, getLang, utils }) {
    if (
      event.body &&
      event.body.trim().toLowerCase() === "prefix"
    ) {
      const globalPrefix = global.GoatBot.config.prefix;
      const localPrefix =
        utils && typeof utils.getPrefix === "function"
          ? utils.getPrefix(event.threadID)
          : globalPrefix;

      return message.reply(
        getLang("status", globalPrefix, localPrefix)
      );
    }
  }
};
		
