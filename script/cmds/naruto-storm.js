const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Chemin de sauvegarde
const DATA_PATH = path.join(__dirname, "../../data/narutostorm.json");

// Initialisation des données si inexistantes
function initData() {
  if (!fs.existsSync(path.dirname(DATA_PATH))) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ players: {} }, null, 2));
  }
}

// Lecture/Sauvegarde des données
function loadData() {
  initData();
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "~naruto-storm",
    version: "4.0.0",
    author: "master charbel",
    countDown: 5,
    role: 0,
    shortDescription: "🍥 Naruto Storm - 60+ Personnages RPG + Combat + Boutique",
    longDescription: "⚡ Naruto Shippuden Ultimate Ninja Storm avec 60+ personnages, 50+ articles, système de déblocage, mode RPG, combat PvE/PvP, boutique et progression sauvegardée",
    category: "game",
    guide: `🎮 MENUS PRINCIPAUX :
┌──────────────────────────────────┐
│ narutostorm → Menu Principal    │
│ narutostorm master → Mode RPG   │
│ narutostorm fight [@joueur]→ PvP│
│ narutostorm shop → Boutique     │
│ narutostorm profile → Profil    │
│ narutostorm mission → Mission   │
│ narutostorm top → Classement    │
│ narutostorm unlock → Déblocage  │
│ narutostorm characters → Liste  │
└──────────────────────────────────┘`
  },

  onStart: async function ({ message, args, api, event }) {
    const { threadID, messageID, senderID, mentions } = event;
    const subCommand = args[0]?.toLowerCase();

    // Chargement des données
    const allData = loadData();
    const playerID = senderID;
    
    // Initialisation du joueur s'il n'existe pas
    if (!allData.players[playerID]) {
      allData.players[playerID] = {
        name: "Ninja Inconnu",
        level: 1,
        xp: 0,
        xpNeeded: 100,
        ryo: 1000, // Plus d'argent de départ
        masterCharacter: null,
        masterLevel: 1,
        masterXP: 0,
        inventory: [],
        unlockedCharacters: ["Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake", "Rock Lee", "Hinata Hyuga", "Shikamaru Nara", "Gaara", "Killer Bee", "Itachi Uchiha"],
        stats: { attack: 10, defense: 10, speed: 10, chakra: 100 },
        missionsDone: 0,
        wins: 0,
        losses: 0,
        rank: "Académicien",
        titles: [],
        achievements: []
      };
      saveData(allData);
    }

    const playerData = allData.players[playerID];

    // =============================================
    // MENU PRINCIPAL
    // =============================================
    if (!subCommand || subCommand === "menu") {
      const mainMenu = `
╔══════════════════════════════════════╗
║     🌀 NARUTO STORM ULTIMATE 🌀     ║
║  🍥 60+ PERSOS • 50+ ARTICLES 🍥  ║
╠══════════════════════════════════════╣
║                                      ║
║  👤 ${(playerData.name || "Ninja").padEnd(28)}║
║  ⭐ Niv.${playerData.level} | ${playerData.rank} | 💰${playerData.ryo}R
║                                      ║
║  🎮 **MENU PRINCIPAL**              ║
║                                      ║
║  1️⃣  🎙️ Voix du Maître (RPG)       ║
║     📜 ${playerData.masterCharacter || "❌ Aucun"} | Niv.${playerData.masterLevel}
║                                      ║
║  2️⃣  ⚔️ Combat Libre (PvE/PvP)     ║
║     🏆 ${playerData.wins}V/${playerData.losses}D
║                                      ║
║  3️⃣  🏪 Boutique (${Object.keys(getAllShopItems()).reduce((sum, cat) => sum + Object.keys(getAllShopItems()[cat]).length, 0)} articles)
║     💰 ${playerData.ryo} Ryos        ║
║                                      ║
║  4️⃣  📊 Profil Détaillé             ║
║  5️⃣  📋 Missions                    ║
║  6️⃣  🏆 Classement                  ║
║  7️⃣  🔓 Déblocage Persos            ║
║  8️⃣  📜 Liste Personnages           ║
║                                      ║
╠══════════════════════════════════════╣
║  📌 Persos débloqués : ${playerData.unlockedCharacters.length}/62
║  🎒 Inventaire : ${playerData.inventory.length} objets
╚══════════════════════════════════════╝
🎙️ *Voix du Maître : "Choisis ta voie, futur Kage !"*
`;
      return api.sendMessage(mainMenu, threadID, messageID);
    }

    // =============================================
    // LISTE DES PERSONNAGES
    // =============================================
    if (subCommand === "characters" || subCommand === "chars") {
      const allChars = getAllCharacters();
      const page = parseInt(args[1]) || 1;
      const charsPerPage = 15;
      const villages = {};
      
      Object.entries(allChars).forEach(([name, data]) => {
        if (!villages[data.village]) villages[data.village] = [];
        villages[data.village].push({ name, data, unlocked: playerData.unlockedCharacters.includes(name) });
      });

      let totalChars = 0;
      let charList = `📜 **LISTE DES 62 PERSONNAGES** (Page ${page})\n\n`;
      
      Object.entries(villages).forEach(([village, chars]) => {
        charList += `📍 **${village}** (${chars.length} persos)\n`;
        chars.forEach(({ name, data, unlocked }) => {
          totalChars++;
          if (totalChars > (page - 1) * charsPerPage && totalChars <= page * charsPerPage) {
            charList += `  ${unlocked ? "✅" : "🔒"} ${data.emoji} ${name} [${data.rarity}]\n`;
          }
        });
        charList += `\n`;
      });

      const totalPages = Math.ceil(totalChars / charsPerPage);
      charList += `📄 Page ${page}/${totalPages} | Débloqués: ${playerData.unlockedCharacters.length}/62\n`;
      charList += `💡 narutostorm chars <page> → Page suivante\n`;
      charList += `🔓 narutostorm unlock → Débloquer des persos`;

      return api.sendMessage(charList, threadID, messageID);
    }

    // =============================================
    // MODE VOIX DU MAÎTRE (RPG)
    // =============================================
    if (subCommand === "master") {
      const allChars = getAllCharacters();
      
      // Si le joueur n'a pas encore choisi son perso
      if (!playerData.masterCharacter || args[1] === "choose") {
        if (args[1] === "choose" && args[2]) {
          const chosenChar = args.slice(2).join(" ");
          if (!allChars[chosenChar]) {
            return api.sendMessage("❌ Personnage invalide ! Vérifie le nom exact.", threadID, messageID);
          }
          if (!playerData.unlockedCharacters.includes(chosenChar)) {
            return api.sendMessage(
              `🔒 **${chosenChar}** est verrouillé !\n💡 Utilise \`narutostorm unlock\` pour le débloquer.`,
              threadID, messageID
            );
          }
          
          playerData.masterCharacter = chosenChar;
          playerData.masterLevel = 1;
          playerData.masterXP = 0;
          const rarityBonus = { "Mythique": 25, "Légendaire": 20, "Épique": 15, "Rare": 10, "Commun": 5 };
          const bonus = rarityBonus[allChars[chosenChar].rarity] || 10;
          playerData.stats = { attack: 15 + bonus, defense: 15 + bonus, speed: 15 + bonus, chakra: 120 + bonus * 2 };
          playerData.ryo += 200;
          saveData(allData);
          
          return api.sendMessage(
            `🎙️ *Voix du Maître : "Excellent choix ! ${chosenChar} sera ton ninja !"*\n\n` +
            `✅ Tu as choisi **${chosenChar}** ${allChars[chosenChar].emoji}\n` +
            `📍 Village : ${allChars[chosenChar].village}\n` +
            `🏛️ Clan : ${allChars[chosenChar].clan}\n` +
            `⭐ Rareté : ${allChars[chosenChar].rarity}\n` +
            `📊 Stats initiales : Atk:${playerData.stats.attack} | Def:${playerData.stats.defense} | Vit:${playerData.stats.speed} | Chakra:${playerData.stats.chakra}\n` +
            `💰 Bonus de départ : +200 Ryos !\n\n` +
            `⚡ Lance des missions avec : narutostorm mission`,
            threadID, messageID
          );
        }

        // Afficher la liste des personnages DÉBLOQUÉS
        let charList = "🎙️ *Voix du Maître : 'Choisis ton ninja !'*\n\n";
        charList += "📜 **PERSONNAGES DÉBLOQUÉS :**\n\n";
        
        const unlockedChars = Object.entries(allChars)
          .filter(([name]) => playerData.unlockedCharacters.includes(name));
        
        const villages = {};
        unlockedChars.forEach(([name, data]) => {
          if (!villages[data.village]) villages[data.village] = [];
          villages[data.village].push({ name, data });
        });

        Object.entries(villages).forEach(([village, chars]) => {
          charList += `📍 **${village}** (${chars.length} persos)\n`;
          chars.forEach(({ name, data }) => {
            charList += `  ${data.emoji} ${name} [${data.rarity}]\n`;
          });
          charList += `\n`;
        });

        charList += `🔒 ${62 - playerData.unlockedCharacters.length} persos verrouillés\n`;
        charList += `💡 Pour choisir : narutostorm master choose <nom>\n`;
        charList += `🔓 Pour débloquer : narutostorm unlock`;

        return api.sendMessage(charList, threadID, messageID);
      }

      // Afficher le statut du mode Maître
      const masterChar = allChars[playerData.masterCharacter];
      const masterMenu = `
╔══════════════════════════════════════╗
║   🎙️ MODE VOIX DU MAÎTRE 🎙️      ║
╠══════════════════════════════════════╣
║                                      ║
║  👤 ${playerData.masterCharacter} ${masterChar?.emoji || "❓"}
║  📍 ${masterChar?.village || "Inconnu"}
║  🏛️ ${masterChar?.clan || "Inconnu"}
║  ⭐ Niveau Maître : ${playerData.masterLevel}
║  📊 XP : ${playerData.masterXP}/${playerData.masterLevel * 100}
║                                      ║
║  ⚔️ ATK : ${playerData.stats.attack}
║  🛡️ DEF : ${playerData.stats.defense}
║  💨 VIT : ${playerData.stats.speed}
║  🔵 CHAKRA : ${playerData.stats.chakra}
║                                      ║
║  💰 Ryos : ${playerData.ryo}
║  ✅ Missions : ${playerData.missionsDone}
║  🏆 Rang : ${playerData.rank}
║                                      ║
╠══════════════════════════════════════╣
║  📋 MISSIONS DISPONIBLES :          ║
║  narutostorm mission → Facile       ║
║  narutostorm mission normal         ║
║  narutostorm mission hard           ║
║  narutostorm mission legendary      ║
║  narutostorm mission kage           ║
╚══════════════════════════════════════╝
🎙️ *"Continue ton entraînement, futur Kage !"*
`;
      return api.sendMessage(masterMenu, threadID, messageID);
    }

    // =============================================
    // DÉBLOCAGE DE PERSONNAGES
    // =============================================
    if (subCommand === "unlock") {
      const allChars = getAllCharacters();
      const lockedChars = Object.keys(allChars).filter(name => !playerData.unlockedCharacters.includes(name));
      
      if (lockedChars.length === 0) {
        return api.sendMessage(
          "🎉 **TOUS LES PERSONNAGES SONT DÉBLOQUÉS !**\nTu possèdes les 62 personnages !",
          threadID, messageID
        );
      }

      if (args[1] === "buy" && args[2]) {
        const charName = lockedChars.find(name => 
          name.toLowerCase().includes(args.slice(2).join(" ").toLowerCase())
        );
        
        if (!charName) {
          return api.sendMessage("❌ Personnage introuvable ou déjà débloqué !", threadID, messageID);
        }

        const charData = allChars[charName];
        const rarityPrices = {
          "Mythique": 15000,
          "Légendaire": 10000,
          "Épique": 5000,
          "Rare": 3000,
          "Commun": 1000
        };
        const price = rarityPrices[charData.rarity] || 2000;

        if (playerData.ryo < price) {
          return api.sendMessage(
            `❌ Pas assez de Ryos !\n💰 Tu as ${playerData.ryo}R, besoin de ${price}R pour **${charName}** [${charData.rarity}]`,
            threadID, messageID
          );
        }

        playerData.ryo -= price;
        playerData.unlockedCharacters.push(charName);
        saveData(allData);

        return api.sendMessage(
          `🎙️ *Voix du Maître : "Nouveau combattant débloqué !"*\n\n` +
          `🔓 **${charName}** ${charData.emoji} est maintenant disponible !\n` +
          `📍 ${charData.village} | 🏛️ ${charData.clan}\n` +
          `⭐ Rareté : ${charData.rarity}\n` +
          `💰 Prix payé : ${price}R\n` +
          `📊 Persos débloqués : ${playerData.unlockedCharacters.length}/62`,
          threadID, messageID
        );
      }

      // Afficher les persos à débloquer
      const rarityPrices = {
        "Mythique": 15000,
        "Légendaire": 10000,
        "Épique": 5000,
        "Rare": 3000,
        "Commun": 1000
      };

      let unlockList = "🔓 **PERSONNAGES À DÉBLOQUER**\n\n";
      unlockList += `💰 Vos Ryos : ${playerData.ryo}R\n\n`;
      
      const lockedByRarity = {};
      lockedChars.forEach(name => {
        const rarity = allChars[name].rarity;
        if (!lockedByRarity[rarity]) lockedByRarity[rarity] = [];
        lockedByRarity[rarity].push(name);
      });

      Object.entries(rarityPrices).forEach(([rarity, price]) => {
        if (lockedByRarity[rarity]) {
          unlockList += `⭐ **${rarity}** (${price}R)\n`;
          lockedByRarity[rarity].slice(0, 5).forEach(name => {
            const available = playerData.ryo >= price ? "✅" : "❌";
            unlockList += `  ${available} ${allChars[name].emoji} ${name}\n`;
          });
          if (lockedByRarity[rarity].length > 5) {
            unlockList += `  ... et ${lockedByRarity[rarity].length - 5} autres\n`;
          }
          unlockList += `\n`;
        }
      });

      unlockList += `💡 Pour acheter : narutostorm unlock buy <nom du perso>\n`;
      unlockList += `🔒 ${lockedChars.length} persos verrouillés`;

      return api.sendMessage(unlockList, threadID, messageID);
    }

    // =============================================
    // MISSIONS (RPG)
    // =============================================
    if (subCommand === "mission") {
      if (!playerData.masterCharacter) {
        return api.sendMessage(
          "❌ Tu dois d'abord choisir un personnage !\n💡 Utilise : narutostorm master choose <nom>",
          threadID, messageID
        );
      }

      const difficulty = args[1]?.toLowerCase() || "normal";
      
      const missions = {
        easy: [
          { name: "Entraînement de base", rank: "D", reward: 150, xp: 50, description: "S'entraîner avec des clones dans la forêt" },
          { name: "Livraison de parchemins", rank: "D", reward: 200, xp: 60, description: "Livrer des parchemins urgents au village voisin" },
          { name: "Nettoyage de la rivière", rank: "D", reward: 180, xp: 55, description: "Nettoyer la rivière polluée du village" },
          { name: "Garde du marché", rank: "D", reward: 160, xp: 45, description: "Surveiller le marché contre les voleurs" },
          { name: "Chercher Tora", rank: "D", reward: 200, xp: 70, description: "Retrouver le chat perdu de la Daimyo" }
        ],
        normal: [
          { name: "Escorte du Daimyo", rank: "C", reward: 400, xp: 120, description: "Protéger un seigneur féodal jusqu'à la capitale" },
          { name: "Pourchasser les bandits", rank: "C", reward: 550, xp: 180, description: "Éliminer un groupe de ninjas renégats" },
          { name: "Protection du convoi", rank: "C", reward: 600, xp: 200, description: "Escorter un convoi de marchandises précieuses" },
          { name: "Exploration de ruines", rank: "C", reward: 500, xp: 160, description: "Explorer des ruines anciennes dangereuses" },
          { name: "Capture de déserteur", rank: "C", reward: 700, xp: 220, description: "Capturer un ninja déserteur de rang C" }
        ],
        hard: [
          { name: "Protéger le village", rank: "B", reward: 1000, xp: 350, description: "Défendre le village contre une attaque coordonnée" },
          { name: "Infiltration ennemie", rank: "B", reward: 1200, xp: 400, description: "Infiltrer une base ennemie et voler des documents" },
          { name: "Chasse au déserteur S", rank: "B", reward: 1500, xp: 500, description: "Traquer un ninja déserteur de rang A" },
          { name: "Tournoi de combat", rank: "B", reward: 1800, xp: 600, description: "Participer à un tournoi de ninjas" },
          { name: "Protéger le Jinchuriki", rank: "B", reward: 2000, xp: 650, description: "Protéger un Jinchuriki d'Akatsuki" }
        ],
        legendary: [
          { name: "Affronter l'Akatsuki", rank: "S", reward: 3000, xp: 800, description: "Combattre un membre de l'Akatsuki" },
          { name: "Protéger le Kage", rank: "S", reward: 4000, xp: 1000, description: "Protéger le Hokage d'une tentative d'assassinat" },
          { name: "Défense du sanctuaire", rank: "S", reward: 3500, xp: 900, description: "Défendre un sanctuaire sacré contre l'invasion" },
          { name: "Chasse au Bijuu", rank: "S", reward: 5000, xp: 1200, description: "Traquer un démon à queue en liberté" }
        ],
        kage: [
          { name: "Guerre ninja", rank: "SS", reward: 8000, xp: 2000, description: "Participer à la 4ème Grande Guerre Ninja" },
          { name: "Affronter Madara", rank: "SS", reward: 10000, xp: 3000, description: "Combattre Madara Uchiha ressuscité" },
          { name: "Bataille finale", rank: "SS", reward: 15000, xp: 5000, description: "Affronter Kaguya Otsutsuki" }
        ]
      };

      const missionPool = missions[difficulty] || missions.normal;
      const mission = missionPool[Math.floor(Math.random() * missionPool.length)];
      
      let successRate;
      switch(difficulty) {
        case "easy": successRate = Math.min(95, 40 + (playerData.masterLevel * 10)); break;
        case "normal": successRate = Math.min(85, 30 + (playerData.masterLevel * 8)); break;
        case "hard": successRate = Math.min(75, 20 + (playerData.masterLevel * 6)); break;
        case "legendary": successRate = Math.min(60, 10 + (playerData.masterLevel * 4)); break;
        case "kage": successRate = Math.min(40, 5 + (playerData.masterLevel * 2)); break;
        default: successRate = 60;
      }
      
      const success = Math.random() * 100 < successRate;

      if (success) {
        const bonusXP = Math.floor(Math.random() * (100 + playerData.masterLevel * 10));
        const bonusRyos = Math.floor(Math.random() * (300 + playerData.masterLevel * 20));
        playerData.ryo += mission.reward + bonusRyos;
        playerData.masterXP += mission.xp + bonusXP;
        playerData.missionsDone++;
        playerData.xp += mission.xp;
        playerData.wins++;

        // Level up système
        let leveledUp = false;
        while (playerData.masterXP >= playerData.masterLevel * 100) {
          playerData.masterXP -= playerData.masterLevel * 100;
          playerData.masterLevel++;
          playerData.stats.attack += 5;
          playerData.stats.defense += 5;
          playerData.stats.speed += 3;
          playerData.stats.chakra += 20;
          leveledUp = true;
        }

        while (playerData.xp >= playerData.xpNeeded) {
          playerData.xp -= playerData.xpNeeded;
          playerData.level++;
          playerData.xpNeeded = Math.floor(playerData.xpNeeded * 1.5);
          leveledUp = true;
        }

        // Déblocage aléatoire de personnage
        let unlockedChar = null;
        const allChars = getAllCharacters();
        const lockedChars = Object.keys(allChars).filter(name => !playerData.unlockedCharacters.includes(name));
        if (lockedChars.length > 0 && Math.random() < 0.1) { // 10% de chance
          unlockedChar = lockedChars[Math.floor(Math.random() * lockedChars.length)];
          playerData.unlockedCharacters.push(unlockedChar);
        }

        updateRank(playerData);
        saveData(allData);

        let resultMsg = `🎙️ *Voix du Maître : "MISSION ACCOMPLIE !"*\n\n`;
        resultMsg += `📋 **${mission.name}** [Rang ${mission.rank}]\n`;
        resultMsg += `📝 ${mission.description}\n\n`;
        resultMsg += `✅ **Succès !** (Probabilité: ${successRate}%)\n`;
        resultMsg += `💰 +${mission.reward}R (+${bonusRyos}R bonus)\n`;
        resultMsg += `⭐ +${mission.xp + bonusXP} XP (Bonus: ${bonusXP})\n`;
        resultMsg += `📊 Niveau Maître : ${playerData.masterLevel}\n`;
        if (leveledUp) resultMsg += `🎉 **LEVEL UP !** Stats augmentées !\n`;
        resultMsg += `🏆 Rang : ${playerData.rank}\n`;
        if (unlockedChar) resultMsg += `\n🔓 **NOUVEAU PERSONNAGE DÉBLOQUÉ !**\n🎉 ${allChars[unlockedChar].emoji} **${unlockedChar}** est disponible !\n`;

        return api.sendMessage(resultMsg, threadID, messageID);
      } else {
        const penalty = Math.floor(mission.reward * 0.3);
        playerData.ryo = Math.max(0, playerData.ryo - penalty);
        playerData.losses++;
        
        if (Math.random() > 0.7) {
          playerData.masterXP = Math.max(0, playerData.masterXP - Math.floor(mission.xp * 0.2));
        }
        
        saveData(allData);

        return api.sendMessage(
          `🎙️ *Voix du Maître : "MISSION ÉCHOUÉE..."*\n\n` +
          `📋 **${mission.name}** [Rang ${mission.rank}]\n` +
          `📝 ${mission.description}\n\n` +
          `❌ **Échec...** (Probabilité: ${successRate}%)\n` +
          `💸 -${penalty}R (pénalité)\n` +
          `💪 Continue de t'entraîner pour réussir !\n` +
          `💡 Conseil : Augmente ton niveau Maître pour plus de chances.`,
          threadID, messageID
        );
      }
    }

    // =============================================
    // COMBAT LIBRE
    // =============================================
    if (subCommand === "fight") {
      const allChars = getAllCharacters();
      const unlockedChars = playerData.unlockedCharacters;
      
      let fighter1Char, fighter2Char;
      
      if (args[1]) {
        fighter1Char = args.slice(1).join(" ");
        if (!allChars[fighter1Char]) {
          const similar = Object.keys(allChars).find(name => 
            name.toLowerCase().includes(args.slice(1).join(" ").toLowerCase())
          );
          if (similar && unlockedChars.includes(similar)) {
            fighter1Char = similar;
          } else if (similar) {
            return api.sendMessage(`🔒 **${similar}** est verrouillé ! Débloque-le d'abord.`, threadID, messageID);
          } else {
            return api.sendMessage("❌ Personnage introuvable !", threadID, messageID);
          }
        }
        if (!unlockedChars.includes(fighter1Char)) {
          return api.sendMessage(`🔒 **${fighter1Char}** est verrouillé ! Utilise \`narutostorm unlock\` pour le débloquer.`, threadID, messageID);
        }
      } else {
        fighter1Char = unlockedChars[Math.floor(Math.random() * unlockedChars.length)];
      }

      // Si un joueur est mentionné = PvP
      if (Object.keys(mentions).length > 0) {
        const opponentID = Object.keys(mentions)[0];
        if (!allData.players[opponentID]) {
          return api.sendMessage("❌ Ce joueur n'a pas encore de profil Naruto Storm !", threadID, messageID);
        }
        
        const opponentData = allData.players[opponentID];
        const opponentChars = opponentData.unlockedCharacters || Object.keys(allChars).slice(0, 10);
        fighter2Char = opponentData.masterCharacter || opponentChars[Math.floor(Math.random() * opponentChars.length)];
        
        const battleResult = simulateBattle(
          fighter1Char, allChars[fighter1Char],
          fighter2Char, allChars[fighter2Char],
          playerData.stats,
          opponentData.stats,
          true
        );

        if (battleResult.winner === "player1") {
          playerData.wins++;
          playerData.ryo += 500;
          playerData.xp += 100;
        } else {
          playerData.losses++;
          opponentData.wins++;
          opponentData.ryo += 500;
          opponentData.xp += 100;
        }
        updateRank(playerData);
        updateRank(opponentData);
        saveData(allData);

        return api.sendMessage(
          `🎙️ *Voix du Maître : "COMBAT PVP !"\n\n` +
          battleResult.log +
          `\n👤 Joueur 1 : ${playerData.wins}V/${playerData.losses}D` +
          `\n👤 Joueur 2 : ${opponentData.wins}V/${opponentData.losses}D`,
          threadID, messageID
        );
      }

      // Combat PvE (contre le bot)
      fighter2Char = Object.keys(allChars)[Math.floor(Math.random() * Object.keys(allChars).length)];
      const botLevel = Math.floor(Math.random() * playerData.level) + 1;
      const botStats = {
        attack: 10 + botLevel * 3,
        defense: 10 + botLevel * 3,
        speed: 10 + botLevel * 2,
        chakra: 100 + botLevel * 20
      };

      const battleResult = simulateBattle(
        fighter1Char, allChars[fighter1Char],
        fighter2Char, allChars[fighter2Char],
        playerData.stats,
        botStats,
        false
      );

      if (battleResult.winner === "player1") {
        playerData.wins++;
        const reward = Math.floor(Math.random() * 300) + 100;
        playerData.ryo += reward;
        playerData.xp += 50;
        
        // Chance de débloquer le perso battu
        let unlockedMsg = "";
        if (!playerData.unlockedCharacters.includes(fighter2Char) && Math.random() < 0.15) {
          playerData.unlockedCharacters.push(fighter2Char);
          unlockedMsg = `\n\n🔓 **${fighter2Char}** ${allChars[fighter2Char].emoji} a été débloqué !`;
        }
        
        updateRank(playerData);
        saveData(allData);

        return api.sendMessage(
          `🎙️ *Voix du Maître : "COMBAT GAGNÉ !"*\n\n` +
          battleResult.log +
          `\n💰 +${reward}R | ⭐ +50 XP${unlockedMsg}`,
          threadID, messageID
        );
      } else {
        playerData.losses++;
        saveData(allData);
        
        return api.sendMessage(
          `🎙️ *Voix du Maître : "K.O. !"*\n\n` +
          battleResult.log +
          `\n💪 Continue de t'entraîner !`,
          threadID, messageID
        );
      }
    }

    // =============================================
    // BOUTIQUE
    // =============================================
    if (subCommand === "shop") {
      const shopItems = getAllShopItems();

      // Achat
      if (args[1] === "buy" && args[2]) {
        const searchTerm = args.slice(2).join(" ").toLowerCase();
        let foundItem = null;

        for (const [category, items] of Object.entries(shopItems)) {
          for (const [name, item] of Object.entries(items)) {
            if (name.toLowerCase().includes(searchTerm)) {
              foundItem = { name, category, ...item };
              break;
            }
          }
          if (foundItem) break;
        }

        if (!foundItem) {
          return api.sendMessage(
            "❌ Article introuvable !\n💡 Vérifie le nom ou utilise : narutostorm shop <catégorie>",
            threadID, messageID
          );
        }

        if (playerData.ryo < foundItem.price) {
          return api.sendMessage(
            `❌ Pas assez de Ryos !\n💰 Tu as ${playerData.ryo}R, il te faut ${foundItem.price}R pour **${foundItem.name}**.`,
            threadID, messageID
          );
        }

        playerData.ryo -= foundItem.price;
        playerData.inventory.push(foundItem.name);

        if (foundItem.attack) playerData.stats.attack += foundItem.attack;
        if (foundItem.defense) playerData.stats.defense += foundItem.defense;
        if (foundItem.speed) playerData.stats.speed += foundItem.speed;
        if (foundItem.chakra) playerData.stats.chakra += foundItem.chakra;
        if (foundItem.allStats) {
          playerData.stats.attack += foundItem.allStats;
          playerData.stats.defense += foundItem.allStats;
          playerData.stats.speed += foundItem.allStats;
          playerData.stats.chakra += foundItem.allStats;
        }

        saveData(allData);

        return api.sendMessage(
          `🎙️ *Voix du Maître : "Excellent achat !"*\n\n` +
          `✅ Acheté : ${foundItem.emoji} **${foundItem.name}**\n` +
          `📝 ${foundItem.description}\n` +
          `💰 Prix : ${foundItem.price}R\n` +
          `📊 Stats : ${foundItem.attack ? `ATK+${foundItem.attack} ` : ""}${foundItem.defense ? `DEF+${foundItem.defense} ` : ""}${foundItem.speed ? `VIT+${foundItem.speed} ` : ""}${foundItem.chakra ? `CHAKRA+${foundItem.chakra} ` : ""}${foundItem.allStats ? `TOUT+${foundItem.allStats}` : ""}\n` +
          `💰 Restant : ${playerData.ryo}R\n` +
          `🎒 ${playerData.inventory.length} objets dans l'inventaire`,
          threadID, messageID
        );
      }

      // Voir une catégorie spécifique
      if (args[1] && shopItems[args[1]]) {
        const category = args[1];
        const items = shopItems[category];
        
        let shopDisplay = `
╔══════════════════════════════════════╗
║   🏪 BOUTIQUE - ${category.toUpperCase().padEnd(18)} ║
╠══════════════════════════════════════╣
║  💰 Ryos : ${playerData.ryo.toString().padEnd(20)} ║
╠══════════════════════════════════════╣
`;

        Object.entries(items).forEach(([name, item]) => {
          const stats = [];
          if (item.attack) stats.push(`ATK+${item.attack}`);
          if (item.defense) stats.push(`DEF+${item.defense}`);
          if (item.speed) stats.push(`VIT+${item.speed}`);
          if (item.chakra) stats.push(`CHK+${item.chakra}`);
          if (item.allStats) stats.push(`ALL+${item.allStats}`);
          
          shopDisplay += `║  ${item.emoji} ${name.padEnd(16)} ${item.price.toString().padEnd(5)}💰 ║\n`;
          shopDisplay += `║     ${stats.join(" ").padEnd(26)} ║\n`;
        });

        shopDisplay += `
╠══════════════════════════════════════╣
║  💡 Acheter :                       ║
║  narutostorm shop buy <article>     ║
╚══════════════════════════════════════╝
🎙️ *"Choisis bien ton équipement, ninja !"*
`;
        return api.sendMessage(shopDisplay, threadID, messageID);
      }

      // Affichage principal de la boutique
      const categories = {
        weapons: "🗡️ ARMES",
        armor: "🛡️ ARMURES",
        consumables: "💊 CONSOMMABLES",
        scrolls: "📜 PARCHEMINS",
        accessories: "💍 ACCESSOIRES",
        rare: "🔮 RARES",
        legendary: "👑 LÉGENDAIRES"
      };

      let shopDisplay = `
╔══════════════════════════════════════╗
║      🏪 BOUTIQUE NINJA 🏪          ║
╠══════════════════════════════════════╣
║  💰 Vos Ryos : ${playerData.ryo.toString().padEnd(20)} ║
╠══════════════════════════════════════╣
`;

      Object.entries(categories).forEach(([key, label]) => {
        const count = Object.keys(shopItems[key] || {}).length;
        shopDisplay += `║  ${label.padEnd(20)} (${count}) ║\n`;
      });

      shopDisplay += `
╠══════════════════════════════════════╣
║  💡 Commandes :                     ║
║  narutostorm shop <catégorie>       ║
║  narutostorm shop buy <article>     ║
║                                     ║
║  Catégories : weapons, armor,       ║
║  consumables, scrolls, accessories, ║
║  rare, legendary                    ║
╚══════════════════════════════════════╝
🎙️ *"De l'équipement de qualité pour les vrais ninjas !"*
`;

      return api.sendMessage(shopDisplay, threadID, messageID);
    }

    // =============================================
    // PROFIL
    // =============================================
    if (subCommand === "profile") {
      const allChars = getAllCharacters();
      const masterChar = playerData.masterCharacter ? allChars[playerData.masterCharacter] : null;
      
      const profile = `
╔══════════════════════════════════════╗
║        📊 PROFIL NINJA 📊          ║
╠══════════════════════════════════════╣
║  👤 ${(playerData.name || "Ninja Inconnu").padEnd(28)}║
║  ⭐ Niveau Global : ${playerData.level.toString().padEnd(22)}║
║  📊 XP : ${playerData.xp}/${playerData.xpNeeded}                  ║
║  🏆 Rang : ${playerData.rank.padEnd(24)}║
║  💰 Ryos : ${playerData.ryo.toString().padEnd(25)}║
║                                      ║
║  🎙️ **Mode Maître** :              ║
║  ${masterChar ? `${masterChar.emoji} ${playerData.masterCharacter}`.padEnd(30) : "❌ Aucun".padEnd(30)}║
║  📍 ${(masterChar?.village || "Inconnu").padEnd(28)}║
║  🏛️ ${(masterChar?.clan || "Inconnu").padEnd(28)}║
║  ⭐ Niveau : ${playerData.masterLevel.toString().padEnd(24)}║
║  📊 XP : ${playerData.masterXP}/${playerData.masterLevel * 100}                  ║
║                                      ║
║  ⚔️ ATK : ${playerData.stats.attack.toString().padEnd(26)}║
║  🛡️ DEF : ${playerData.stats.defense.toString().padEnd(26)}║
║  💨 VIT : ${playerData.stats.speed.toString().padEnd(26)}║
║  🔵 CHAKRA : ${playerData.stats.chakra.toString().padEnd(23)}║
║                                      ║
║  ✅ Missions : ${playerData.missionsDone.toString().padEnd(24)}║
║  🏆 Victoires : ${playerData.wins.toString().padEnd(24)}║
║  💀 Défaites : ${playerData.losses.toString().padEnd(24)}║
║  🔓 Persos : ${playerData.unlockedCharacters.length}/62              ║
║                                      ║
║  🎒 Inventaire (${playerData.inventory.length} objets) :
║  ${playerData.inventory.slice(-5).join(", ").padEnd(28) || "Vide".padEnd(28)}║
╚══════════════════════════════════════╝
🎙️ *"Voilà ton parcours de ninja ! Continue comme ça !"*
`;

      return api.sendMessage(profile, threadID, messageID);
    }

    // =============================================
    // CLASSEMENT
    // =============================================
    if (subCommand === "top") {
      const players = Object.entries(allData.players)
        .sort((a, b) => b[1].level - a[1].level)
        .slice(0, 10);

      let topDisplay = `
╔══════════════════════════════════════╗
║      🏆 CLASSEMENT NINJA 🏆        ║
╠══════════════════════════════════════╣
`;

      if (players.length === 0) {
        topDisplay += `║  Aucun joueur classé...           ║\n`;
      } else {
        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        players.forEach(([id, data], index) => {
          const masterChar = data.masterCharacter ? getAllCharacters()[data.masterCharacter] : null;
          topDisplay += `║  ${medals[index]} ${(data.name || "Ninja").padEnd(8)} Niv.${data.level.toString().padEnd(4)} ${data.rank.padEnd(10)} ${masterChar?.emoji || "❓"} ║\n`;
        });
      }

      topDisplay += `
╚══════════════════════════════════════╝
🎙️ *"Les meilleurs ninjas du monde !"*
`;
      return api.sendMessage(topDisplay, threadID, messageID);
    }

    // Si aucune commande reconnue
    return api.sendMessage(
      "❌ Commande inconnue ! Utilise `narutostorm` pour le menu principal.",
      threadID, messageID
    );
  }
};

// =============================================
// 62 PERSONNAGES COMPLETS
// =============================================
function getAllCharacters() {
  return {
    // KONOHA 11 + Équipe
    "Naruto Uzumaki": { emoji: "🍥", clan: "Uzumaki", village: "Konoha", rarity: "Légendaire", element: "💨 Vent" },
    "Sasuke Uchiha": { emoji: "⚡", clan: "Uchiha", village: "Konoha", rarity: "Légendaire", element: "⚡ Foudre" },
    "Sakura Haruno": { emoji: "🌸", clan: "Haruno", village: "Konoha", rarity: "Rare", element: "🌊 Eau" },
    "Kakashi Hatake": { emoji: "📖", clan: "Hatake", village: "Konoha", rarity: "Légendaire", element: "⚡ Foudre" },
    "Rock Lee": { emoji: "💪", clan: "Lee", village: "Konoha", rarity: "Épique", element: "⚡ Taijutsu" },
    "Neji Hyuga": { emoji: "👁️", clan: "Hyuga", village: "Konoha", rarity: "Épique", element: "💨 Vent" },
    "Tenten": { emoji: "🎯", clan: "Inconnu", village: "Konoha", rarity: "Commun", element: "⚙️ Armes" },
    "Shikamaru Nara": { emoji: "🧠", clan: "Nara", village: "Konoha", rarity: "Rare", element: "🌑 Ombre" },
    "Choji Akimichi": { emoji: "🍖", clan: "Akimichi", village: "Konoha", rarity: "Commun", element: "🔥 Feu" },
    "Ino Yamanaka": { emoji: "💐", clan: "Yamanaka", village: "Konoha", rarity: "Commun", element: "🧠 Mental" },
    "Hinata Hyuga": { emoji: "💜", clan: "Hyuga", village: "Konoha", rarity: "Rare", element: "💨 Vent" },
    "Shino Aburame": { emoji: "🪲", clan: "Aburame", village: "Konoha", rarity: "Rare", element: "🐛 Insectes" },
    "Kiba Inuzuka": { emoji: "🐺", clan: "Inuzuka", village: "Konoha", rarity: "Commun", element: "🌊 Eau" },
    
    // SENSEI
    "Might Guy": { emoji: "👊", clan: "Guy", village: "Konoha", rarity: "Légendaire", element: "🔥 Feu" },
    "Asuma Sarutobi": { emoji: "🚬", clan: "Sarutobi", village: "Konoha", rarity: "Épique", element: "💨 Vent" },
    "Kurenai Yuhi": { emoji: "🌙", clan: "Yuhi", village: "Konoha", rarity: "Rare", element: "🔥 Feu" },
    "Iruka Umino": { emoji: "🐬", clan: "Umino", village: "Konoha", rarity: "Commun", element: "💨 Vent" },
    "Yamato": { emoji: "🌳", clan: "Inconnu", village: "Konoha", rarity: "Épique", element: "🌳 Bois" },
    
    // HOKAGE
    "Hashirama Senju": { emoji: "🌳", clan: "Senju", village: "Konoha", rarity: "Mythique", element: "🌳 Bois" },
    "Tobirama Senju": { emoji: "💧", clan: "Senju", village: "Konoha", rarity: "Légendaire", element: "🌊 Eau" },
    "Hiruzen Sarutobi": { emoji: "👴", clan: "Sarutobi", village: "Konoha", rarity: "Légendaire", element: "🔥 Feu" },
    "Minato Namikaze": { emoji: "💛", clan: "Namikaze", village: "Konoha", rarity: "Mythique", element: "💨 Vent" },
    "Tsunade": { emoji: "💎", clan: "Senju", village: "Konoha", rarity: "Légendaire", element: "🔥 Feu" },
    "Kakashi Hatake (Hokage)": { emoji: "📖", clan: "Hatake", village: "Konoha", rarity: "Légendaire", element: "⚡ Foudre" },
    "Naruto Uzumaki (Hokage)": { emoji: "🍥", clan: "Uzumaki", village: "Konoha", rarity: "Mythique", element: "💨 Vent" },
    
    // UCHIHA
    "Itachi Uchiha": { emoji: "🌑", clan: "Uchiha", village: "Konoha", rarity: "Mythique", element: "🔥 Feu" },
    "Madara Uchiha": { emoji: "🔥", clan: "Uchiha", village: "Konoha", rarity: "Mythique", element: "🔥 Feu" },
    "Obito Uchiha": { emoji: "🌀", clan: "Uchiha", village: "Konoha", rarity: "Mythique", element: "🔥 Feu" },
    "Shisui Uchiha": { emoji: "💨", clan: "Uchiha", village: "Konoha", rarity: "Légendaire", element: "⚡ Foudre" },
    "Izuna Uchiha": { emoji: "👁️", clan: "Uchiha", village: "Konoha", rarity: "Épique", element: "🔥 Feu" },
    "Fugaku Uchiha": { emoji: "👁️", clan: "Uchiha", village: "Konoha", rarity: "Épique", element: "🔥 Feu" },
    
    // AKATSUKI
    "Pain (Nagato)": { emoji: "👁️", clan: "Uzumaki", village: "Ame", rarity: "Mythique", element: "🌊 Eau" },
    "Konan": { emoji: "📄", clan: "Ame", village: "Ame", rarity: "Épique", element: "💨 Vent" },
    "Kisame Hoshigaki": { emoji: "🦈", clan: "Hoshigaki", village: "Kiri", rarity: "Épique", element: "🌊 Eau" },
    "Deidara": { emoji: "💣", clan: "Iwa", village: "Iwa", rarity: "Épique", element: "💥 Explosion" },
    "Sasori": { emoji: "🦂", clan: "Suna", village: "Suna", rarity: "Légendaire", element: "⚙️ Métal" },
    "Hidan": { emoji: "💀", clan: "Yugakure", village: "Yu", rarity: "Rare", element: "🩸 Sang" },
    "Kakuzu": { emoji: "💰", clan: "Takigakure", village: "Taki", rarity: "Épique", element: "🌪️ Tous" },
    "Zetsu": { emoji: "🌿", clan: "Akatsuki", village: "Inconnu", rarity: "Rare", element: "🌳 Bois" },
    
    // KAGE
    "Gaara": { emoji: "🏜️", clan: "Kazekage", village: "Suna", rarity: "Légendaire", element: "💨 Vent" },
    "Mei Terumi": { emoji: "💋", clan: "Terumi", village: "Kiri", rarity: "Épique", element: "🌋 Lave" },
    "Onoki": { emoji: "👴", clan: "Kamizuru", village: "Iwa", rarity: "Légendaire", element: "⛰️ Terre" },
    "A (4ème Raikage)": { emoji: "⚡", clan: "Raikage", village: "Kumo", rarity: "Légendaire", element: "⚡ Foudre" },
    "Yagura": { emoji: "🐢", clan: "Kiri", village: "Kiri", rarity: "Épique", element: "🌊 Eau" },
    "Rasa": { emoji: "⏳", clan: "Kazekage", village: "Suna", rarity: "Épique", element: "💨 Poussière d'or" },
    "Gengetsu Hozuki": { emoji: "🫧", clan: "Hozuki", village: "Kiri", rarity: "Épique", element: "🌊 Eau" },
    "Mû": { emoji: "🫥", clan: "Iwa", village: "Iwa", rarity: "Légendaire", element: "⛰️ Particules" },
    
    // SANNIN
    "Jiraiya": { emoji: "🐸", clan: "Sannin", village: "Konoha", rarity: "Légendaire", element: "💨 Vent" },
    "Orochimaru": { emoji: "🐍", clan: "Sannin", village: "Konoha", rarity: "Mythique", element: "🐍 Serpent" },
    "Tsunade (Sannin)": { emoji: "💎", clan: "Senju", village: "Konoha", rarity: "Légendaire", element: "🔥 Feu" },
    
    // JINCHURIKI
    "Killer Bee": { emoji: "🐙", clan: "Kumo", village: "Kumo", rarity: "Légendaire", element: "⚡ Foudre" },
    "Yugito Nii": { emoji: "🐱", clan: "Kumo", village: "Kumo", rarity: "Épique", element: "🔥 Feu" },
    "Roshi": { emoji: "🦍", clan: "Iwa", village: "Iwa", rarity: "Épique", element: "🌋 Lave" },
    "Han": { emoji: "🐴", clan: "Iwa", village: "Iwa", rarity: "Épique", element: "💨 Vapeur" },
    "Utakata": { emoji: "🫧", clan: "Kiri", village: "Kiri", rarity: "Épique", element: "🫧 Bulles" },
    "Fu": { emoji: "🪰", clan: "Taki", village: "Taki", rarity: "Épique", element: "💨 Vent" },
    
    // LÉGENDAIRES & OTSUTSUKI
    "Kushina Uzumaki": { emoji: "❤️", clan: "Uzumaki", village: "Konoha", rarity: "Légendaire", element: "⛓️ Scellement" },
    "Kabuto Yakushi": { emoji: "🧪", clan: "Yakushi", village: "Konoha", rarity: "Épique", element: "🐍 Serpent" },
    "Danzo Shimura": { emoji: "🦾", clan: "Shimura", village: "Konoha", rarity: "Épique", element: "💨 Vent" },
    "Might Dai": { emoji: "🔥", clan: "Dai", village: "Konoha", rarity: "Rare", element: "🔥 Feu" },
    "Sakumo Hatake": { emoji: "⚪", clan: "Hatake", village: "Konoha", rarity: "Légendaire", element: "⚡ Foudre" },
    "Hagoromo Otsutsuki": { emoji: "👁️", clan: "Otsutsuki", village: "Céleste", rarity: "Mythique", element: "✨ Tout" },
    "Hamura Otsutsuki": { emoji: "🌙", clan: "Otsutsuki", village: "Lune", rarity: "Mythique", element: "✨ Tout" },
    "Kaguya Otsutsuki": { emoji: "👁️", clan: "Otsutsuki", village: "Céleste", rarity: "Mythique", element: "✨ Tout" },
    "Momoshiki Otsutsuki": { emoji: "🌀", clan: "Otsutsuki", village: "Céleste", rarity: "Mythique", element: "✨ Tout" },
    "Isshiki Otsutsuki": { emoji: "🕳️", clan: "Otsutsuki", village: "Céleste", rarity: "Mythique", element: "✨ Tout" }
  };
}

// =============================================
// 50+ ARTICLES DE BOUTIQUE
// =============================================
function getAllShopItems() {
  return {
    weapons: {
      "Kunai Explosif": { price: 200, attack: 5, emoji: "🔪", description: "Kunai qui explose à l'impact" },
      "Shuriken Fūma": { price: 500, attack: 10, emoji: "⭐", description: "Shuriken géant dévastateur" },
      "Épée de Kusanagi": { price: 1500, attack: 20, emoji: "🗡️", description: "L'épée légendaire d'Orochimaru" },
      "Samehada": { price: 3000, attack: 25, chakra: 30, emoji: "🦈", description: "L'épée dévoreuse de chakra" },
      "Gunbai d'Uchiha": { price: 2500, attack: 22, defense: 10, emoji: "🪭", description: "L'éventail de guerre de Madara" },
      "Kubikiribōchō": { price: 2800, attack: 28, emoji: "🔪", description: "L'épée coupe-brume de Zabuza" },
      "Nuibari": { price: 2200, attack: 20, speed: 15, emoji: "🧵", description: "L'épée-aiguille qui perce tout" },
      "Shibuki": { price: 2000, attack: 18, emoji: "💥", description: "L'épée explosive" },
      "Kabutowari": { price: 2500, attack: 22, defense: 8, emoji: "⚒️", description: "Marteau-hache légendaire" },
      "Hiramekarei": { price: 3500, attack: 30, emoji: "🐟", description: "L'épée jumelle de Chojuro" },
      "Bâton d'Enma": { price: 4000, attack: 35, emoji: "🦍", description: "Le bâton d'Hiruzen qui se transforme" },
      "Faux de Hidan": { price: 1800, attack: 15, speed: 20, emoji: "🩸", description: "La faux rituelle de Jashin" }
    },
    armor: {
      "Gilet Ninja": { price: 500, defense: 10, emoji: "🦺", description: "Protection standard de ninja" },
      "Armure de Samouraï": { price: 1000, defense: 20, emoji: "⚔️", description: "Armure lourde de samouraï" },
      "Manteau Akatsuki": { price: 2000, defense: 15, chakra: 50, emoji: "☁️", description: "Le manteau légendaire de l'Akatsuki" },
      "Armure de Raikage": { price: 3500, defense: 30, speed: 10, emoji: "⚡", description: "L'armure de foudre du Raikage" },
      "Cape de Hokage": { price: 5000, defense: 40, chakra: 100, emoji: "🔥", description: "La cape officielle du Hokage" },
      "Plastron ANBU": { price: 2500, defense: 25, speed: 15, emoji: "😷", description: "Armure légère des forces spéciales" },
      "Kimono de Jōnin": { price: 1500, defense: 18, chakra: 30, emoji: "👘", description: "Tenue traditionnelle de Jōnin" },
      "Susanoo Partiel": { price: 8000, defense: 60, attack: 30, emoji: "💀", description: "Protection ultime Uchiha" }
    },
    consumables: {
      "Pilule de Chakra": { price: 150, chakra: 30, emoji: "💊", description: "Restaure du chakra" },
      "Pilule du Soldat": { price: 300, attack: 10, chakra: 20, emoji: "💉", description: "Augmente les capacités" },
      "Ration Militaire": { price: 200, defense: 5, chakra: 15, emoji: "🍙", description: "Restaure l'endurance" },
      "Pilule Senzu": { price: 500, chakra: 100, emoji: "🫘", description: "Restaure tout le chakra" },
      "Élixir de Jeunesse": { price: 1000, attack: 20, speed: 15, emoji: "✨", description: "Puissance de la jeunesse !" },
      "Venin de Sasori": { price: 800, attack: 25, emoji: "🦂", description: "Poison mortel de marionnettiste" },
      "Parfum d'Ino": { price: 400, chakra: 40, emoji: "🌸", description: "Fleur qui restaure l'esprit" },
      "Gélule Akimichi": { price: 600, attack: 15, defense: 10, emoji: "💊", description: "Pilule d'expansion corporelle" }
    },
    scrolls: {
      "Parchemin de Jutsu": { price: 1000, attack: 15, emoji: "📜", description: "Contient un jutsu puissant" },
      "Parchemin Interdit": { price: 5000, attack: 30, chakra: 100, emoji: "📕", description: "Technique interdite légendaire" },
      "Parchemin des Sannin": { price: 3000, attack: 20, defense: 15, emoji: "🐸🐍💎", description: "Le savoir des trois Sannin" },
      "Rouleau d'Invocation": { price: 2000, chakra: 80, emoji: "📜", description: "Invoque un animal allié" },
      "Parchemin de Scellement": { price: 3500, defense: 30, emoji: "🔒", description: "Scelle les techniques ennemies" },
      "Rouleau de Fūinjutsu": { price: 4500, attack: 25, defense: 25, emoji: "⛓️", description: "Art du scellement avancé" },
      "Parchemin des 7 Épées": { price: 7000, attack: 50, emoji: "⚔️", description: "Maîtrise des 7 lames de Kiri" }
    },
    accessories: {
      "Bandeau de Konoha": { price: 100, defense: 3, emoji: "🍥", description: "Le bandeau frontal de Konoha" },
      "Bague Akatsuki": { price: 5000, chakra: 80, attack: 15, emoji: "💍", description: "Anneau de l'Akatsuki" },
      "Collier de Tsunade": { price: 7500, defense: 40, chakra: 200, emoji: "💎", description: "Le pendentif légendaire" },
      "Éventail de Temari": { price: 3000, attack: 20, speed: 25, emoji: "🪭", description: "Maîtrise du vent suprême" },
      "Gourde de Gaara": { price: 5500, defense: 50, chakra: 150, emoji: "🏺", description: "Sable de la défense absolue" },
      "Katana de Minato": { price: 9000, attack: 45, speed: 50, emoji: "⚡", description: "L'éclair jaune personnifié" }
    },
    rare: {
      "Boule de Chakra Pur": { price: 2500, allStats: 20, emoji: "🔮", description: "Orbe de chakra pur" },
      "Bijuu Dormant": { price: 10000, allStats: 50, chakra: 200, emoji: "👹", description: "Fragment de démon à queue" },
      "Sharingan": { price: 8000, attack: 40, speed: 30, emoji: "👁️", description: "Œil légendaire Uchiha" },
      "Rinnegan": { price: 15000, allStats: 80, emoji: "🟣", description: "L'œil divin de la réincarnation" },
      "Marionnette Suprême": { price: 6500, attack: 35, defense: 30, emoji: "🎭", description: "Chef-d'œuvre de Sasori" }
    },
    legendary: {
      "Jūbi Fragment": { price: 20000, allStats: 100, chakra: 500, emoji: "👹", description: "Fragment du démon originel" },
      "Épée de Hagoromo": { price: 25000, attack: 80, defense: 50, chakra: 300, emoji: "⚔️", description: "L'arme du Sage des Six Chemins" },
      "Manteau de Kage": { price: 18000, allStats: 70, emoji: "👑", description: "L'habit suprême des Kage" }
    }
  };
}

// =============================================
// SIMULATION DE COMBAT
// =============================================
function simulateBattle(char1Name, char1Data, char2Name, char2Data, stats1, stats2, isPvP) {
  let p1HP = 100 + (stats1.defense || 0);
  let p2HP = 100 + (stats2.defense || 0);
  const maxHP1 = p1HP;
  const maxHP2 = p2HP;
  
  let log = "";
  
  log += `⚔️ **${char1Name}** ${char1Data.emoji} [${char1Data.village}]\n`;
  log += `   ATK:${stats1.attack} DEF:${stats1.defense} VIT:${stats1.speed} CHK:${stats1.chakra}\n`;
  log += `⚔️ **${char2Name}** ${char2Data.emoji} [${char2Data.village}]\n`;
  log += `   ATK:${stats2.attack} DEF:${stats2.defense} VIT:${stats2.speed} CHK:${stats2.chakra}\n\n`;
  
  // Tour 1 - Engagement
  log += `🎙️ *"ROUND 1... FIGHT !"*\n`;
  const dmg1_1 = Math.floor(Math.random() * 15) + 5 + Math.floor(stats1.attack / 10);
  const dmg2_1 = Math.floor(Math.random() * 10) + 5 + Math.floor(stats2.attack / 10);
  p2HP -= dmg1_1;
  p1HP -= dmg2_1;
  log += `💥 Échange de coups ! (-${dmg1_1}/-${dmg2_1})\n\n`;
  
  // Tour 2 - Jutsu
  log += `🎙️ *"JUTSU !"*\n`;
  const dmg1_2 = Math.floor(Math.random() * 20) + 10 + Math.floor(stats1.attack / 5);
  const dmg2_2 = Math.floor(Math.random() * 15) + 10 + Math.floor(stats2.attack / 5);
  p2HP -= dmg1_2;
  p1HP -= dmg2_2;
  log += `🌀 Techniques spéciales ! (-${dmg1_2}/-${dmg2_2})\n\n`;
  
  // Tour 3 - Éveil
  log += `🎙️ *"AWAKENING !"*\n`;
  const dmg1_3 = Math.floor(Math.random() * 25) + 15 + Math.floor(stats1.attack / 3);
  const dmg2_3 = Math.floor(Math.random() * 20) + 10 + Math.floor(stats2.attack / 3);
  p2HP -= dmg1_3;
  p1HP -= dmg2_3;
  log += `⚡ Modes éveil activés ! (-${dmg1_3}/-${dmg2_3})\n\n`;
  
  // Tour 4 - Ultime
  log += `🎙️ *"ULTIMATE JUTSU !"*\n`;
  const dmg1_4 = Math.floor(Math.random() * 30) + 20 + Math.floor(stats1.attack / 2);
  const dmg2_4 = Math.floor(Math.random() * 25) + 15 + Math.floor(stats2.attack / 2);
  p2HP -= dmg1_4;
  p1HP -= dmg2_4;
  log += `💥 Techniques ultimes ! (-${dmg1_4}/-${dmg2_4})\n\n`;
  
  p1HP = Math.max(0, p1HP);
  p2HP = Math.max(0, p2HP);
  
  const winner = p1HP > p2HP ? "player1" : "player2";
  
  log += `📊 ${char1Name}: ${Math.round(p1HP/maxHP1*100)}% | ${char2Name}: ${Math.round(p2HP/maxHP2*100)}%\n`;
  
  if (winner === "player1") {
    log += `🎙️ *"YOU WIN !"*\n`;
    log += `🏆 Vainqueur : **${char1Name}** ${char1Data.emoji}\n`;
  } else {
    log += `🎙️ *"K.O. !"*\n`;
    log += `🏆 Vainqueur : **${char2Name}** ${char2Data.emoji}\n`;
  }
  
  return { winner, log };
}

// =============================================
// MISE À JOUR DU RANG
// =============================================
function updateRank(playerData) {
  if (playerData.level >= 50) playerData.rank = "Kage Légendaire";
  else if (playerData.level >= 40) playerData.rank = "Hokage";
  else if (playerData.level >= 30) playerData.rank = "Jōnin d'élite";
  else if (playerData.level >= 20) playerData.rank = "Jōnin";
  else if (playerData.level >= 10) playerData.rank = "Chūnin";
  else if (playerData.level >= 5) playerData.rank = "Genin";
  else playerData.rank = "Académicien";
        }
