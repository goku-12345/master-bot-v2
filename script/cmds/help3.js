const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;
const os = require("os");

// Style Alien 👽
function toAlien(text) {
    const alienMap = {
        'A': '∀', 'B': '𐌁', 'C': 'Ͼ', 'D': '𐌃', 'E': 'Ǝ', 'F': '𐌅', 'G': '⅁',
        'H': '𐋅', 'I': 'I', 'J': 'ſ', 'K': '𐌊', 'L': '⅂', 'M': 'W', 'N': 'N',
        'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'R', 'S': 'S', 'T': '⊥', 'U': '∩',
        'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
        'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
        'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
        'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
        'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
        '0': '0', '1': 'Ɩ', '2': 'Ƨ', '3': 'Ɛ', '4': '4', '5': 'Ƽ',
        '6': '9', '7': 'L', '8': '8', '9': '6'
    };
    return text.split('').map(c => alienMap[c] || c).join('');
}

function getCategoryEmoji(category) {
    const emojis = {
        "admin": "👾",
        "ai": "🤖",
        "box": "📡",
        "config": "⚡",
        "contacts admin": "🛸",
        "developer": "💻",
        "economy": "💰",
        "editor": "✏️",
        "fun": "🎮",
        "game": "🎲",
        "group": "👥",
        "image": "🖼️",
        "info": "👽",
        "media": "🎵",
        "owner": "👑",
        "rank": "🏅",
        "social": "🌐",
        "system": "🖥️",
        "text": "📝",
        "tools": "🔧",
        "utility": "🛠️",
        "vip": "💎"
    };
    return emojis[category.toLowerCase()] || "📁";
}

module.exports = {
    config: {
        name: "help",
        aliases: ["menu", "cmds", "commands", "h", "?"],
        version: "6.0",
        author: "Master Charbel • 👽 𝐍𝐄𝐗𝐔𝐒",
        countDown: 5,
        role: 0,
        shortDescription: { en: "👽 NEXUS ALIEN - Menu Extraterrestre" },
        category: "info",
        guide: { en: "{pn} → Menu Alien\n{pn} <cmd> → Détails d'une commande" }
    },

    onStart: async function ({ message, args, event, usersData, api }) {
        const { threadID, senderID, messageID } = event;
        const prefix = getPrefix(threadID);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

        const user = await usersData.get(senderID);
        const userName = user?.name || "Alien";

        // === DÉTAILS D'UNE COMMANDE ===
        if (args[0]) {
            const cmdName = args[0].toLowerCase();
            const command = commands.get(cmdName) || commands.get(aliases.get(cmdName));

            if (!command) {
                return message.reply(
                    `👽 ${toAlien('COMMANDE INCONNUE')} 👽
━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ "${cmdName}" n'existe pas

💡 Tape ${prefix}help pour voir la liste
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👽 ${toAlien('NEXUS ALIEN')} 🛸`
                );
            }

            const config = command.config;
            const roleText = config.role === 0 ? "👽 Tous" : config.role === 1 ? "🛸 Admin Groupe" : "👾 Admin Bot";
            const emoji = getCategoryEmoji(config.category || "Autre");

            return message.reply(
                `👽 ${toAlien(config.name.toUpperCase())} 👽
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${config.description?.en || ''}

📌 ${toAlien('Infos')} :
├─ Version : ${config.version || "1.0"}
├─ Auteur  : ${config.author || "Inconnu"}
├─ Rôle    : ${roleText}
├─ Catégorie : ${emoji} ${config.category || "Autre"}
└─ Alias   : ${config.aliases?.join(", ") || "Aucun"}

💡 ${toAlien('Utilisation')} :
└─ ${config.guide?.en?.replace(/{pn}/g, prefix) || "Pas de guide"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👽 ${toAlien('NEXUS ALIEN')} 🛸`
            );
        }

        // === MENU PRINCIPAL ALIEN ===
        const categories = {};
        const role = 0;

        for (const [name, cmd] of commands) {
            if (cmd.config.role > role) continue;
            const category = cmd.config.category || "Autre";
            if (!categories[category]) categories[category] = [];
            categories[category].push(name);
        }

        // Statistiques
        const totalCmds = Array.from(commands.values()).filter(cmd => cmd.config.role <= role).length;
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const uptime = process.uptime();
        const uptimeStr = `${Math.floor(uptime / 86400)}j ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

        let msg = `👽 ${toAlien('NEXUS ALIEN COMMANDS')} 👽
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛸 ${toAlien('Welcome')} ${userName} | 🕐 ${timeStr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const sortedCategories = Object.keys(categories).sort();
        
        for (const category of sortedCategories) {
            const cmds = categories[category].sort();
            if (cmds.length === 0) continue;

            const emoji = getCategoryEmoji(category);
            msg += `${emoji} ${toAlien(category.toUpperCase())} [${cmds.length}]\n`;
            msg += `┌─────────────────────────┐\n`;

            // Afficher les commandes en lignes de 4
            const chunks = [];
            for (let i = 0; i < cmds.length; i += 4) {
                const chunk = cmds.slice(i, i + 4);
                const line = chunk.map(cmd => `⌬ ${cmd.padEnd(12)}`).join('');
                msg += `│ ${line}│\n`;
            }
            msg += `└─────────────────────────┘\n\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━
👾 ${toAlien('Stats')}  │  🎯 ${totalCmds}  │  💾 ${ramUsed}MB  │  ⏱️ ${uptimeStr}
📌 ${toAlien('Prefix')} : ${prefix}  │  🔗 help <cmd> pour détails
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👽 "${toAlien('The Galaxy is Our Playground')}" 🛸`;

        return message.reply({
            body: msg,
            mentions: [{ tag: `@${userName}`, id: senderID }]
        });
    }
};
