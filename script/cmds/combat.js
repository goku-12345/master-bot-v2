const axios = require('axios');

// --- LISTE DES PERSONNAGES ET LEURS POUVOIRS ---
const characters = {
    naruto: {
        name: "Naruto Uzumaki",
        emoji: "🍥",
        clan: "Uzumaki",
        jutsu: [
            { name: "Rasengan", damage: 25, emoji: "🌀" },
            { name: "Rasenshuriken", damage: 40, emoji: "⚡" },
            { name: "Multi Shadow Clone", damage: 30, emoji: "👥" },
            { name: "Sage Mode", damage: 35, emoji: "🐸" },
            { name: "Baryon Mode", damage: 50, emoji: "🔥" },
            { name: "Tailed Beast Bomb", damage: 45, emoji: "💥" }
        ],
        health: 200,
        defense: 20
    },
    sasuke: {
        name: "Sasuke Uchiha",
        emoji: "⚫",
        clan: "Uchiha",
        jutsu: [
            { name: "Chidori", damage: 30, emoji: "⚡" },
            { name: "Amaterasu", damage: 45, emoji: "🔥" },
            { name: "Susano'o", damage: 50, emoji: "👹" },
            { name: "Sharingan Genjutsu", damage: 20, emoji: "👁️" },
            { name: "Indra's Arrow", damage: 55, emoji: "🏹" },
            { name: "Chidori Stream", damage: 35, emoji: "🌩️" }
        ],
        health: 190,
        defense: 25
    },
    madara: {
        name: "Madara Uchiha",
        emoji: "👁️",
        clan: "Uchiha",
        jutsu: [
            { name: "Perfect Susano'o", damage: 60, emoji: "🗡️" },
            { name: "Fire Style: Majestic Destroyer", damage: 45, emoji: "🔥" },
            { name: "Wood Style", damage: 35, emoji: "🌳" },
            { name: "Rinnegan Powers", damage: 50, emoji: "🌙" },
            { name: "Limbo", damage: 55, emoji: "👻" },
            { name: "Truth Seeking Orbs", damage: 40, emoji: "⚫" }
        ],
        health: 250,
        defense: 35
    },
    itachi: {
        name: "Itachi Uchiha",
        emoji: "🩸",
        clan: "Uchiha",
        jutsu: [
            { name: "Tsukuyomi", damage: 50, emoji: "🌙" },
            { name: "Amaterasu", damage: 45, emoji: "🔥" },
            { name: "Susano'o (Yata Mirror)", damage: 40, emoji: "🛡️" },
            { name: "Sharingan", damage: 25, emoji: "👁️" },
            { name: "Fireball Jutsu", damage: 30, emoji: "🔥" }
        ],
        health: 170,
        defense: 30
    },
    minato: {
        name: "Minato Namikaze",
        emoji: "💛",
        clan: "Namikaze",
        jutsu: [
            { name: "Flying Thunder God", damage: 45, emoji: "⚡" },
            { name: "Rasengan", damage: 30, emoji: "🌀" },
            { name: "Reaper Death Seal", damage: 60, emoji: "💀" },
            { name: "Sage Mode", damage: 35, emoji: "🐸" }
        ],
        health: 180,
        defense: 25
    },
    kakashi: {
        name: "Kakashi Hatake",
        emoji: "📖",
        clan: "Hatake",
        jutsu: [
            { name: "Chidori", damage: 30, emoji: "⚡" },
            { name: "Kamui", damage: 55, emoji: "🌀" },
            { name: "Raikiri", damage: 40, emoji: "⚡" },
            { name: "Shadow Clone", damage: 20, emoji: "👥" },
            { name: "Earth Style Mud Wall", damage: 15, emoji: "🧱" }
        ],
        health: 160,
        defense: 30
    },
    hashirama: {
        name: "Hashirama Senju",
        emoji: "🌿",
        clan: "Senju",
        jutsu: [
            { name: "Wood Style: Deep Forest", damage: 40, emoji: "🌳" },
            { name: "Sage Mode", damage: 45, emoji: "🐸" },
            { name: "Thousand Hands", damage: 55, emoji: "🙏" },
            { name: "Wood Dragon", damage: 35, emoji: "🐉" }
        ],
        health: 230,
        defense: 40
    },
    pain: {
        name: "Pain (Nagato)",
        emoji: "🌧️",
        clan: "Uzumaki",
        jutsu: [
            { name: "Shinra Tensei", damage: 50, emoji: "💫" },
            { name: "Chibaku Tensei", damage: 60, emoji: "🌕" },
            { name: "Bansho Tenin", damage: 30, emoji: "🔄" },
            { name: "Summoning", damage: 25, emoji: "🐉" }
        ],
        health: 220,
        defense: 30
    },
    obito: {
        name: "Obito Uchiha",
        emoji: "🎭",
        clan: "Uchiha",
        jutsu: [
            { name: "Kamui", damage: 50, emoji: "🌀" },
            { name: "Fire Style", damage: 35, emoji: "🔥" },
            { name: "Wood Style", damage: 30, emoji: "🌳" },
            { name: "Six Paths Powers", damage: 55, emoji: "🌙" }
        ],
        health: 200,
        defense: 30
    },
    guy: {
        name: "Might Guy",
        emoji: "💪",
        clan: "Guy",
        jutsu: [
            { name: "Dynamic Entry", damage: 25, emoji: "🦵" },
            { name: "Hirudora", damage: 45, emoji: "🔥" },
            { name: "Daytime Tiger", damage: 55, emoji: "🐯" },
            { name: "Night Guy", damage: 70, emoji: "💀" }
        ],
        health: 200,
        defense: 15
    }
};

// --- FONCTIONS DE COMBAT ---
function getRandomJutsu(char) {
    const charData = characters[char];
    if (!charData) return null;
    return charData.jutsu[Math.floor(Math.random() * charData.jutsu.length)];
}

function calculateDamage(attacker, defender, jutsu) {
    const attackerData = characters[attacker];
    const defenderData = characters[defender];
    if (!attackerData || !defenderData) return 0;
    
    let damage = jutsu.damage;
    // Bonus de défense
    damage = Math.max(5, damage - Math.floor(defenderData.defense / 4));
    // Variation aléatoire
    damage += Math.floor(Math.random() * 15) - 7;
    damage = Math.max(5, damage);
    
    return damage;
}

function getBattleMessage(attacker, defender, jutsu, damage, defenderHealth) {
    const attackerName = characters[attacker].name;
    const defenderName = characters[defender].name;
    const attackerEmoji = characters[attacker].emoji;
    const defenderEmoji = characters[defender].emoji;
    const messages = [
        `**${attackerName}** ${attackerEmoji} utilise **${jutsu.name}** ${jutsu.emoji} sur **${defenderName}** ${defenderEmoji} ! 💥`,
        `**${attackerName}** ${attackerEmoji} attaque avec **${jutsu.name}** ${jutsu.emoji} ! **${defenderName}** subit **${damage}** dégâts ! 😱`,
        `**${attackerName}** ${attackerEmoji} déchaîne **${jutsu.name}** ${jutsu.emoji} sur **${defenderName}** ! -${damage} HP ! ⚔️`,
        `**${attackerName}** ${attackerEmoji} utilise son jutsu signature **${jutsu.name}** ${jutsu.emoji} ! **${defenderName}** perd **${damage}** PV ! 💢`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getDefeatMessage(winner, loser) {
    const winnerName = characters[winner].name;
    const loserName = characters[loser].name;
    const messages = [
        `🏆 **${winnerName}** a vaincu **${loserName}** ! Quel combat épique ! 🎉`,
        `💀 **${loserName}** est tombé face à **${winnerName}** ! La légende continue ! ⚔️`,
        `🔥 **${winnerName}** remporte le combat ! **${loserName}** est vaincu ! 🙌`,
        `🌟 **${winnerName}** s'impose face à **${loserName}** ! Un véritable héros ! 🥇`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getCharacterList() {
    let list = "";
    for (const [key, value] of Object.entries(characters)) {
        list += `│  ${value.emoji} ${key} - ${value.name}\n`;
    }
    return list;
}

// --- MODULE EXPORT ---
module.exports = {
    config: {
        name: "combat",
        aliases: ["fight", "battle", "naruto", "shinobi"],
        version: "2.0",
        author: "Master Charbel",
        countDown: 10,
        role: 0,
        category: "game",
        shortDescription: "⚔️ Combat Naruto Ultimate",
        guide: {
            en: `╭─── ⚔️ 𝐂𝐎𝐌𝐁𝐀𝐓 𝐍𝐀𝐑𝐔𝐓𝐎 ⚔️ ───⭓
│
│  📌 {pn} <personnage> <@|id>
│  → Défie un joueur
│
│  📌 {pn} <personnage> reply
│  → Répondre au message
│
│  📌 {pn} characters
│  → Liste des personnages
│
│  📌 {pn} info <personnage>
│  → Infos d'un perso
│
╰━━━━━━━ 🍥 ━━━❖`
        }
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, mentions, messageReply } = event;
        const input = args.join(' ').trim();

        // --- LISTE DES PERSONNAGES ---
        if (args[0] === 'characters' || args[0] === 'chars') {
            let list = "╭─── 🍥 𝐏𝐄𝐑𝐒𝐎𝐍𝐍𝐀𝐆𝐄𝐒 🍥 ───⭓\n│\n";
            for (const [key, value] of Object.entries(characters)) {
                list += `│  ${value.emoji} ${key} - ${value.name}\n`;
                list += `│  ❤️ ${value.health} HP | 🛡️ ${value.defense} Def | 🌀 ${value.jutsu.length} Jutsu\n│\n`;
            }
            list += "╰━━━━━━━ 🍥 ━━━❖";
            return api.sendMessage(list, threadID, messageID);
        }

        // --- INFO PERSONNAGE ---
        if (args[0] === 'info' && args[1]) {
            const char = args[1].toLowerCase();
            if (!characters[char]) {
                return api.sendMessage(`❌ Personnage "${args[1]}" introuvable.`, threadID, messageID);
            }
            const data = characters[char];
            let info = `╭─── 🍥 ${data.emoji} ${data.name} 🍥 ───⭓\n│\n`;
            info += `│  🏷️ Clan : ${data.clan}\n`;
            info += `│  ❤️ PV : ${data. : ${data.health}\n`;
health}\n`;
            info += `│             info += `│  🛡️ Déf 🛡️ Défense : ${dataense : ${data.defense}\.defense}\n│n│\n`;
            info += `\n`;
            info += `│ │  📜 J 📜 Jutsuut :\n`;
            for (su :\n`;
            for (const j of dataconst j of data.jutsu) {
               .jutsu) {
                info += `│ info += `│  ${j.emoji} ${  ${j.emoji} ${j.name} (j.name} (${j.damage}${j.damage} dmg)\ dmg)\n`;
            }
            info += `n`;
            }
            info += `\n╰\n╰━━━━━━━ 🍥━━━━━━━ 🍥 ━━━ ━━━❖`;
            return api.sendMessage(info❖`;
            return api.sendMessage(info, thread, threadID, messageIDID, messageID);
        }

);
        }

        // --- VÉRIFICATION DES        // --- VÉRIFICATION DES AR ARGGUMENTS ---
        ifUMENTS ---
        if (! (!argsargs[0]) {
            return api.sendMessage(
[0]) {
            return api.sendMessage(
                `                `╭──╭─── ⚔️ 𝐂─ ⚔️ 𝐂𝐎𝐌𝐎𝐌𝐁𝐀𝐁𝐀𝐓 𝐍𝐀𝐑𝐓 𝐍𝐀𝐑𝐔𝐓𝐎 ⚔𝐔𝐓𝐎 ⚔️ ───️ ───⭓
⭓
││
│  📌 {pn
│  📌 {pn}} <personnage <personnage> <@> <@|id>
│ |id>
│  → Défie un joueur → Défie un joueur
│
│  📌 {
│
│  📌 {pn} <personpn} <personnage> reply
│  → Rénage> reply
│  → Répondre au messagepondre au message
│
│
│
│  📌 {  📌 {pn} characterspn} characters
│  → Liste
│  → Liste des personnages
│
 des personnages
│
│  📌 {│  📌 {pn} infopn} info <personnage>
│  → Infos <personnage>
│  → Infos d'un perso d'un perso
│
╰━━━━
│
╰━━━━━━━━━ 🍥━ 🍥 ━━━❖`, ━━━❖`, threadID, threadID, messageID);
        }

        const messageID);
        }

        const player playerCharChar = args[0 = args[0].toLowerCase();
].toLowerCase();
        if (!        if (!charcharacters[playerCharacters[playerChar]) {
            return]) {
            return api.sendMessage(`❌ Person api.sendMessage(`❌ Personnage "${argsnage "${args[0][0]}" introuvable.\n}" introuvable.\n📌 Util📌 Utilise **ise **combat characterscombat characters** pour voir la liste.`, thread** pour voir la liste.`, threadID, messageIDID, messageID);
        }

        let opponent);
        }

        let opponentID = nullID = null;

        // ---;

        // --- RÉP RÉPONDRE À UN MONDRE À UN MESSAGE ---
        if (ESSAGE ---
        if (args.includes('reply') &&args.includes('reply') && messageReply) {
            opponent messageReply) {
            opponentID = messageReply.senderID = messageReply.senderID;
        }
       ID;
        }
        // --- DÉFI // --- DÉFIER UN JOER UN JOUEUR ---
        elseUEUR ---
        else if (Object.keys if (Object.keys(mentions).length > 0) {
            opponent(mentions).length > 0) {
            opponentIDID = Object.keys(mentions)[0];
        }
 = Object.keys(mentions)[0];
        }
        // --- DÉFIER UN        // --- DÉ JOUEURFIER UN JOUEUR PAR PAR ID ---
        else if (args ID ---
        else if (args[1] &&[1] && !isNaN(args[1])) {
 !isNaN(args[1])) {
            opponentID =            opponentID = args[1];
 args[1];
        }

        if        }

        if (!opponentID) {
            return (!opponentID api.sendMessage(
) {
            return api.sendMessage(
                `                `❌ Tu dois déf❌ Tu dois défier quelqu'un !ier quelqu'un !\n`\n` +
                ` +
                `📌 Utilise :📌 Utilise : ** **combat ${playerCharcombat ${playerChar} @} @utilisateur**utilisateur**\n` +
\n` +
                `📌 Ou répond                `📌 Ou réponds às à son son message avec : **combat ${ message avec : **combat ${playerChar} replyplayerChar} reply**`,
                threadID**`,
                threadID, messageID);
, messageID);
        }

        if        }

        if (opponentID === senderID) (opponentID === senderID) {
            return api.sendMessage(" {
            return api.sendMessage("❌ Tu ne pe❌ Tu ne peux pas te battre contreux pas te batt toi-mêmere contre toi-même !", !", threadID, message threadID, messageID);
        }

        // --- RÉCUPÉID);
        }

        // --- RÉCUPÉRERRER LES INFOS DU JO LES INFOS DU JOUEUR ADUEUR ADVERVERSE ---
       SE ---
        const opponentInfo const opponentInfo = await users = await usersData.get(opponentID);
        const opponentNameData.get(opponentID);
        const opponentName = opponentInfo?.name || "Sh = opponentInfo?.name || "Shinobi ininobi inconnconnu";

        // --- CHOu";

        // --- CHOISISIR UN PERSONIR UN PERSONNAGE ALNAGE ALÉATOIRE POUR L'ÉATOIRE POUR L'ADVERSAADVERSAIRE ---
        const opponentKeys =IRE ---
        const opponentKeys = Object.keys(characters);
        const random Object.keys(characters);
        const randomChar = opponentKeys[Math.floor(Math.randomChar = opponentKeys[Math.floor() * opponentKeys.length)];
        // É(Math.random() * opponentKeys.length)];
        // Éviter le même personnage
        let opponentChar = randomChar;
        while (opponentChar === playerChar) {
            opponentChar = opponentKeys[Math.floor(Math.random() * opponentKeys.length)];
viter le même personnage
        let opponentChar = randomChar;
        while (opponentChar === playerChar) {
            opponentChar = opponentKeys[Math.floor(Math.random() * opponentKeys.length)];
        }

        // --- COMBAT ---
        let player        }

        // --- COMBAT ---
        let playerHPHP = characters[playerChar].health = characters[playerChar].health;
        let opponentHP = characters;
        let opponentHP = characters[opponentChar].[opponentChar].health;
        consthealth;
        const maxPlayer maxPlayerHP = playerHP = playerHP;
        const maxOpponentHPHP;
        const maxOpponentHP = opponentHP;

        let round = 1;
 = opponentHP;

        let round = 1;
        let battleLog = `╭─── ⚔️ ${characters[playerChar].emoji} ${        let battleLog = `╭─── ⚔️ ${characters[playerChar].emoji} ${characters[playerChar].name}characters[playerChar].name} VS ${ VS ${characters[opponentCharcharacters[opponentChar].emoji} ${char].emoji} ${characters[opponentacters[opponentChar].name} ⚔️Char].name} ⚔️ ─── ───⭓\n│\n`;
⭓\n│\n`;
        battleLog        battleLog += `│  👤 ${ += `│  👤 ${charcharacters[playerChar].nameacters[playerChar].name} (${player} (${playerChar})Char}) ❤️ ${ ❤️ ${playerHPplayerHP} HP\n`;
}        battleLog += `│  HP\n`;
        battleLog += 👤 ${opp `│  👤 ${opponentName} (onentName} (${opp${opponentCharonentChar}) ❤️ ${opponentHP} HP}) ❤️ ${opponentHP} HP\n│\n│\n`;
        battleLog += `│\n`;
        battleLog += `│   🌀 🌀 ${char ${characters[playeracters[playerChar].emoji} ${Char].emoji} ${characters[playercharacters[playerChar].clChar].clanan} VS ${char} VS ${characters[opponentChar].acters[opponentChar].emoji} ${characters[opponentChar].clemoji} ${characters[opponentChar].clan}\n│an}\n│\n`;

        let messages\n`;

        let messages = [];
 = [];
        let winner        let winner = null;

 = null;

        while (playerHP > 0 && opponentHP        while (playerHP >  > 0 &&0 && opponentHP > 0 && round <= round <= 10) {
            // 10) {
            // --- TOUR DU JO --- TOUR DU JOUEUR ---
UEUR ---
            const playerJutsu = get            const playerJutsu = getRandomJutsuRandomJutsu(playerChar);
(playerChar);
            const playerDamage = calculateDamage(playerChar, opponent            const playerDamage = calculateDamageChar, playerJutsu);
           (playerChar, opponentChar, playerJ opponentHP = Math.max(0, opponentutsu);
            opponentHP = Math.max(0, opponentHP - playerDamageHP - playerDamage);
            const player);
            constMsg = playerMsg = getBattleMessage(player getBattleMessage(playerChar, opponentChar, playerJutsuChar, opponentChar, playerJ, playerDamage, opponentHP);
            messages.push(`│utsu, playerDamage, opponentHP);
            messages.push  Round(`│  Round ${round} : ${round} : ${playerMsg}` ${playerMsg}`);

            if (opponent);

            if (opponentHP <= 0)HP <= 0) {
                winner = playerChar;
                {
                winner = playerChar;
                break;
            }

 break;
            }

            // --- TO            // --- TOUR DE L'ADVERSAUR DE L'ADVERSAIRE ---
           IRE ---
            const opponentJut const opponentJutsu = getRandomJutsu(su = getRandomJutsu(opponentChar);
opponentChar);
            const opponentDamage            const opponentDamage = calculateDamage(opponentChar, = calculateDamage(opponentChar, playerChar, playerChar, opponentJutsu);
            playerHP = opponentJutsu);
            playerHP = Math.max Math.max(0(0, playerHP -, playerHP - opponentDamage);
            const opponentMsg = opponentDamage);
            const opponentMsg = getBattleMessage( getBattleMessage(opponentChar,opponentChar, playerChar, opponentJutsu, opponentDamage, playerChar, opponentJutsu, opponentDamage, playerHP);
            messages.push(`│  playerHP);
            messages.push(`│  Round ${round} : ${opp Round ${round} : ${opponentMsg}`onentMsg}`);

            if (player);

            if (playerHP <= 0) {
                winner = opponentChar;
HP <= 0) {
                winner = opponentChar;
                break;
                           break;
            }

            round++;
        }

        // }

            round++;
        }

        // --- D --- DÉTERMINERÉTERMINER LE GAGNANT LE GAGNANT SI ÉG SI ÉGALITÉ ---
        ifALITÉ ---
        if (!winner) {
 (!winner) {
            if (playerHP > opponentHP            if (playerHP > opponentHP) winner = player) winner = playerChar;
            else if (Char;
            else if (opponentHP > playerHPopponentHP > playerHP) winner = opponentChar;
) winner = opponentChar;
            else winner = null            else winner = null; // Égalité
        }

        // ---; // Égalité
        }

        // --- MESSAGE FIN MESSAGE FINAL ---
       AL ---
        if ( if (winner === playerwinner === playerChar) {
            messages.push(`Char) {
           │\ messages.push(`│\n│n│  ${getDefeatMessage  ${get(playerChar, opponentChar)}`);
DefeatMessage(playerChar, opponentChar)}`);
            messages.push(`│\n│            messages.push(`│\  🏆n│  🏆 ${ ${characters[playerChar].characters[playerChar].name} remporte lename} remporte le combat !`);
 combat !`);
        } else if (winner        } else if (winner === opponentChar) === opponentChar) {
            messages.push(`│\n│  ${getDefeat {
            messages.push(`│\n│  ${getDefeatMessage(opponentChar,Message(opponentChar, playerChar)}`);
            playerChar)}`);
            messages.push(`│\n│ messages.push(`│\n│  🏆 ${opp  🏆 ${opponentName} remonentName} remporte le combat avec ${charporte le combat avec ${characters[opponentChar].name} !`);
        }acters[opponentChar].name} !`);
        else } else {
            messages.push(`│\n│  {
            messages.push(`│\n│  🤝 Combat 🤝 Combat nul ! Les deux comb nul ! Les deux combattants sont épuisés !`);
attants sont épuisés !`);
        }

        //        }

        // --- STATISTIQU --- STATISTIQUES FINALES ---ES FINALES ---
        messages.push(`│\n
        messages.push(`│\│  📊 Statistn│  📊 Statistiques finaliques finales :`);
       es :`);
 messages.push(`│  ${characters[playerChar        messages.push(`│  ${characters[playerChar].].emoji} ${charemoji} ${characters[playerChar].name} :acters[playerChar].name} : ${playerHP}/${ ${playermaxHP}/${maxPlayerHP} HP`);
        messages.push(`│  ${characters[oppPlayerHP} HP`);
        messages.push(`│  ${characters[opponentChar].emoji} ${opponentName} :onentChar].emoji} ${opponentName} : ${opponentHP ${opponentHP}/${maxOpponentHP} HP`);
        messages.push}/${maxOpponentHP} HP`);
        messages.push(`(`│ │  🔄 R 🔄 Rounds : ${round}`);

        // --- CONSTRUCTION DU MESSAGE FINAL ---
        let finalMsg = battleLog + messages.join('\n') + '\n╰ounds : ${round}`);

        // --- CONSTRUCTION DU MESSAGE FINAL ---
        let finalMsg = battleLog + messages.join('\n') + '\n╰━━━━━━━ 🍥 ━━━❖';
        
        // Tronquer si trop long
        if (finalMsg.length > 2000) {
            finalMsg = finalMsg.slice(0, 1900) + '\n...\n╰━━━━━━━ 🍥 ━━━❖';
        }

        // Envoyer le message
        api.sendMessage(finalMsg, threadID, messageID);

        // --- MENTIONNER L'ADVERSAIRE POUR LE NOTIFIER ---
        if (opponentID) {
            api.sendMessage(`⚔️ ${opponentName}, tu as été défié par ${characters[playerChar].name} !`, opponentID);
        }
    }
};
