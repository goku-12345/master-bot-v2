const { commands, aliases } = global.GoatBot;
const { getPrefix } = global.utils;
const os = require("os");
const fs = require("fs-extra");
const path = require("path");

// Style NEXUS Bold
function toNexusBold(text) {
    const boldMap = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆',
        'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍',
        'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔',
        'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠',
        'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧',
        'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮',
        'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
        '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
    };
    return text.split('').map(c => boldMap[c] || c).join('');
}

function getCategoryEmoji(category) {
    const emojis = {
        "admin": "⚔️",
        "ai": "🧠",
        "box": "📦",
        "config": "⚙️",
        "contacts admin": "📞",
        "developer": "💻",
        "economy": "💰",
        "editor": "✏️",
        "fun": "🎮",
        "game": "🎲",
        "group": "👥",
        "image": "🖼️",
        "info": "📊",
        "media": "🎵",
        "owner": "👑",
        "rank": "🏅",
        "social": "🌐",
        "system": "🖥️",
        "text": "📝",
        "tools": "🔧",
        "utility": "🛠️",
        "vip": "💎",
        "gpt": "🤖",
        "game": "🎮"
    };
    return emojis[category.toLowerCase()] || "📁";
}

module.exports = {
    config: {
        name: "help",
        aliases: ["menu", "cmds", "commands", "h", "?"],
        version: "4.0",
        author: "Master Charbel • 𝐍𝐄𝐗𝐔𝐒",
        countDown: 5,
        role: 0,
        shortDescription: { en: "⚡ 𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐌𝐄𝐍𝐔" },
        category: "info",
        guide: { en: "{pn} → Menu complet\n{pn} <cmd> → Détails d'une commande\n{pn} categories → Liste des catégories" }
    },

    onStart: async function ({ message, args, event, usersData, api }) {
        const { threadID, senderID, messageID } = event;
        const prefix = getPrefix(threadID);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const user = await usersData.get(senderID);
        const userName = user?.name || "Ninja";

        // === CATÉGORIES ===
        if (args[0] && args[0].toLowerCase() === "categories") {
            const categories = new Set();
            for (const [_, cmd] of commands) {
                const cat = cmd.config.category || "Autre";
                categories.add(cat);
            }

            let msg = `📂 ${toNexusBold('CATÉGORIES DISPONIBLES')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            for (const cat of categories) {
                const emoji = getCategoryEmoji(cat);
                const count = Array.from(commands.values()).filter(cmd => (cmd.config.category || "Autre") === cat).length;
                msg += `${emoji} ${toNexusBold(cat)} (${count})\n`;
            }

            msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Utilise help <catégorie> pour voir les commandes\n⚡ ${toNexusBold('𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄')} 🚀`;
            
            return message.reply(msg);
        }

        // === DÉTAILS D'UNE COMMANDE ===
        if (args[0]) {
            const cmdName = args[0].toLowerCase();
            const command = commands.get(cmdName) || commands.get(aliases.get(cmdName));

            if (!command) {
                return message.reply(
                    `❌ ${toNexusBold('COMMANDE INCONNUE')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
"${cmdName}" n'existe pas
💡 Tape ${prefix}help categories pour voir les catégories
━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ${toNexusBold('𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄')} 🚀`
                );
            }

            const config = command.config;
            const roleText = config.role === 0 ? "👤 Tous" : config.role === 1 ? "🛡️ Admin Groupe" : "👑 Admin Bot";
            const emoji = getCategoryEmoji(config.category || "Autre");

            return message.reply(
                `📋 ${toNexusBold(config.name.toUpperCase())}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${config.description?.en ? `📝 ${config.description.en}\n` : ''}
📌 ${toNexusBold('Infos :')}
├─ Version : ${config.version || "1.0"}
├─ Auteur  : ${config.author || "Inconnu"}
├─ Rôle    : ${roleText}
├─ Catégorie : ${emoji} ${config.category || "Autre"}
└─ Alias   : ${config.aliases?.join(", ") || "Aucun"}

💡 ${toNexusBold('Utilisation :')}
└─ ${config.guide?.en?.replace(/{pn}/g, prefix) || "Pas de guide"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ${toNexusBold('𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄')} 🚀`
            );
        }

        // === MENU PRINCIPAL ===
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

        let msg = `⚡ ${toNexusBold('𝐍𝐄𝐗𝐔𝐒 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄')} ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ${userName} | 🕐 ${timeStr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const sortedCategories = Object.keys(categories).sort();
        
        for (const category of sortedCategories) {
            const cmds = categories[category].sort();
            if (cmds.length === 0) continue;

            const emoji = getCategoryEmoji(category);
            msg += `${emoji} ${toNexusBold(category.toUpperCase())}\n`;

            // Afficher les commandes en lignes de 3
            const chunks = [];
            for (let i = 0; i < cmds.length; i += 3) {
                const chunk = cmds.slice(i, i + 3);
                const line = chunk.map(cmd => `⌬ ${cmd}`).join('  ');
                msg += `└─ ${line}\n`;
            }
            msg += '\n';
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ${toNexusBold('STATS')}  🎯 ${totalCmds}  💾 ${ramUsed}MB  ⏱️ ${uptimeStr}
📌 Prefix: ${prefix}  |  🔗 help <cmd> pour détails
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌸 ${toNexusBold('𝐍𝐄𝐗𝐔𝐒 - 𝐓𝐡𝐞 𝐆𝐚𝐭𝐞𝐰𝐚𝐲 𝐭𝐨 𝐏𝐨𝐰𝐞𝐫')} 🚀`;

        return message.reply({
            body: msg,
            mentions: [{ tag: `@${userName}`, id: senderID }]
        });
    }
};
