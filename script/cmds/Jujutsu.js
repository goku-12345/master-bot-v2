const characters = [
  // ─── PERSONNAGES PRINCIPAUX ───
  {
    name: "Yuji Itadori",
    power: 75,
    basic: "Coup de Poing Divin 👊",
    special: "Black Flash ⚡",
    ultimate: "Domaine : Démolition 💀",
    domain: "Démolition",
    cursedEnergy: 100,
    type: "physique"
  },
  {
    name: "Satoru Gojo",
    power: 95,
    basic: "Infini ✨",
    special: "Bleu 💠",
    ultimate: "Domaine : Illimitée 🌌",
    domain: "Illimitée",
    cursedEnergy: 120,
    type: "spécial"
  },
  {
    name: "Megumi Fushiguro",
    power: 70,
    basic: "Ombres 🌀",
    special: "Nuée de Chiens 🐕",
    ultimate: "Domaine : Chimère Jardin 🌿",
    domain: "Chimère Jardin",
    cursedEnergy: 85,
    type: "technique"
  },
  {
    name: "Nobara Kugisaki",
    power: 68,
    basic: "Marteau 🔨",
    special: "Paille et Clou 📌",
    ultimate: "Domaine : Frappe Infernale 🔥",
    domain: "Frappe Infernale",
    cursedEnergy: 80,
    type: "physique"
  },
  {
    name: "Ryomen Sukuna",
    power: 98,
    basic: "Découpage 🔪",
    special: "Malveillance 👹",
    ultimate: "Domaine : Sanctuaire Malveillant ⛩️",
    domain: "Sanctuaire Malveillant",
    cursedEnergy: 150,
    type: "maudit"
  },
  {
    name: "Kenjaku",
    power: 88,
    basic: "Manipulation de Corps 🧬",
    special: "Barrière Maudite 🕸️",
    ultimate: "Domaine : Mille Visages 🎭",
    domain: "Mille Visages",
    cursedEnergy: 130,
    type: "maudit"
  },
  {
    name: "Yuta Okkotsu",
    power: 85,
    basic: "Katana Maudit 🗡️",
    special: "Rika : Tempête 👻",
    ultimate: "Domaine : Amour Éternel 💕",
    domain: "Amour Éternel",
    cursedEnergy: 140,
    type: "spécial"
  },
  {
    name: "Kinji Hakari",
    power: 78,
    basic: "Pari 🎰",
    special: "Mode Jackpot 💰",
    ultimate: "Domaine : Salle de Jeux 🎲",
    domain: "Salle de Jeux",
    cursedEnergy: 100,
    type: "physique"
  },
  {
    name: "Toji Fushiguro",
    power: 82,
    basic: "Chaîne Inversée ⛓️",
    special: "Lame du Ciel 🗡️",
    ultimate: "Assassinat Parfait 🎯",
    domain: "Assassin",
    cursedEnergy: 0,
    type: "physique"
  },
  {
    name: "Geto Suguru",
    power: 80,
    basic: "Esprit Maudit 🌑",
    special: "Absorption 🌀",
    ultimate: "Domaine : Mille Démons 👿",
    domain: "Mille Démons",
    cursedEnergy: 120,
    type: "maudit"
  },
  {
    name: "Maki Zenin",
    power: 70,
    basic: "Lame Maudite 🗡️",
    special: "Cœur de Fer 💪",
    ultimate: "Domaine : Force Pure ⚔️",
    domain: "Force Pure",
    cursedEnergy: 20,
    type: "physique"
  },
  {
    name: "Toge Inumaki",
    power: 65,
    basic: "Parole Maudite 🗣️",
    special: "Plongez ! 🌊",
    ultimate: "Domaine : Silence Absolu 🤫",
    domain: "Silence Absolu",
    cursedEnergy: 75,
    type: "spécial"
  },
  {
    name: "Panda",
    power: 62,
    basic: "Gorille 🦍",
    special: "Mode Triceratops 🦕",
    ultimate: "Domaine : Bête de Combat 🐻",
    domain: "Bête de Combat",
    cursedEnergy: 60,
    type: "physique"
  },
  {
    name: "Choso",
    power: 72,
    basic: "Sang Maudit 🩸",
    special: "Nez de Sang 💧",
    ultimate: "Domaine : Rivière Sanglante 🌊🩸",
    domain: "Rivière Sanglante",
    cursedEnergy: 90,
    type: "maudit"
  },
  {
    name: "Naoya Zenin",
    power: 68,
    basic: "Projection 🏃",
    special: "Frame Frappe 💨",
    ultimate: "Domaine : Vitesse Absolue ⚡",
    domain: "Vitesse Absolue",
    cursedEnergy: 80,
    type: "physique"
  },
  {
    name: "Mahito",
    power: 76,
    basic: "Transformation Corporelle 🧠",
    special: "Doigts de Malveillance 👆",
    ultimate: "Domaine : Désespoir Infini 😈",
    domain: "Désespoir Infini",
    cursedEnergy: 110,
    type: "maudit"
  },
  {
    name: "Jogo",
    power: 74,
    basic: "Lave 🔥",
    special: "Vulcain 🌋",
    ultimate: "Domaine : Brasier Éternel 🔥",
    domain: "Brasier Éternel",
    cursedEnergy: 100,
    type: "maudit"
  },
  {
    name: "Hanami",
    power: 70,
    basic: "Forêt 🌳",
    special: "Épine Maudite 🌿",
    ultimate: "Domaine : Nature Maudite 🌍",
    domain: "Nature Maudite",
    cursedEnergy: 95,
    type: "maudit"
  },
  {
    name: "Dagon",
    power: 68,
    basic: "Vagues 🌊",
    special: "Abysse 🐟",
    ultimate: "Domaine : Océan Maudit 🌊",
    domain: "Océan Maudit",
    cursedEnergy: 90,
    type: "maudit"
  },
  {
    name: "Mei Mei",
    power: 65,
    basic: "Hache 🪓",
    special: "Corbeaux 🐦",
    ultimate: "Domaine : Ailes de Mort 🐦💀",
    domain: "Ailes de Mort",
    cursedEnergy: 70,
    type: "physique"
  },
  {
    name: "Utahime Iori",
    power: 55,
    basic: "Danse 💃",
    special: "Renforcement 🎤",
    ultimate: "Domaine : Harmonie 🎶",
    domain: "Harmonie",
    cursedEnergy: 65,
    type: "spécial"
  },
  {
    name: "Kashimo Hajime",
    power: 80,
    basic: "Foudre ⚡",
    special: "Éclair Mortel 🌩️",
    ultimate: "Domaine : Tonnerre Divin ⚡",
    domain: "Tonnerre Divin",
    cursedEnergy: 100,
    type: "physique"
  },
  {
    name: "Yuki Tsukumo",
    power: 82,
    basic: "Grave 👊",
    special: "Star Rage 🌟",
    ultimate: "Domaine : Big Bang 💥",
    domain: "Big Bang",
    cursedEnergy: 110,
    type: "spécial"
  },
  {
    name: "Nobara (Éveil)",
    power: 78,
    basic: "Clou Résurrection 📌",
    special: "Marteau Démoniaque 🔨",
    ultimate: "Domaine : Frappe Céleste 🌟",
    domain: "Frappe Céleste",
    cursedEnergy: 95,
    type: "physique"
  },
  {
    name: "Yuta (Éveil)",
    power: 92,
    basic: "Rika Déchaînée 👻",
    special: "Cursed Speech 🗣️",
    ultimate: "Domaine : Amour Éternel 💕",
    domain: "Amour Éternel",
    cursedEnergy: 160,
    type: "spécial"
  },
  {
    name: "Gojo (Éveil)",
    power: 100,
    basic: "Infini Parfait ✨",
    special: "Rouge 🔴",
    ultimate: "Domaine : Illimitée 🌌",
    domain: "Illimitée",
    cursedEnergy: 200,
    type: "spécial"
  },
  {
    name: "Sukuna (20 Doigts)",
    power: 100,
    basic: "Malveillance 👹",
    special: "Découpage Spatial 🔪",
    ultimate: "Domaine : Sanctuaire Malveillant ⛩️",
    domain: "Sanctuaire Malveillant",
    cursedEnergy: 220,
    type: "maudit"
  },

  // ─── NOUVEAUX PERSONNAGES ───
  {
    name: "Yuji (Éveil)",
    power: 85,
    basic: "Coup Divin ⚡",
    special: "Black Flash Parfait 💥",
    ultimate: "Domaine : Destruction Totale 💀",
    domain: "Destruction Totale",
    cursedEnergy: 130,
    type: "physique"
  },
  {
    name: "Megumi (Éveil)",
    power: 80,
    basic: "Ombre Totale 🌀",
    special: "Chimère Jardin 🌿",
    ultimate: "Domaine : Ombre Éternelle 🌌",
    domain: "Ombre Éternelle",
    cursedEnergy: 120,
    type: "technique"
  },
  {
    name: "Hana Kurusu",
    power: 72,
    basic: "Lumière ✨",
    special: "Angel 🕊️",
    ultimate: "Domaine : Clairière Céleste 🌅",
    domain: "Clairière Céleste",
    cursedEnergy: 90,
    type: "spécial"
  },
  {
    name: "Takaba Fumihiko",
    power: 70,
    basic: "Blague 🃏",
    special: "Rire 😂",
    ultimate: "Domaine : Comédie Infernale 🎭",
    domain: "Comédie Infernale",
    cursedEnergy: 85,
    type: "spécial"
  },
  {
    name: "Yuki (Éveil)",
    power: 90,
    basic: "Star Rage Max 🌟",
    special: "Big Bang 💥",
    ultimate: "Domaine : Destruction Stellaire 🌌",
    domain: "Destruction Stellaire",
    cursedEnergy: 150,
    type: "spécial"
  },
  {
    name: "Kashimo (Éveil)",
    power: 88,
    basic: "Foudre Divine ⚡",
    special: "Éclair Absolu 🌩️",
    ultimate: "Domaine : Tonnerre Infini ⚡",
    domain: "Tonnerre Infini",
    cursedEnergy: 140,
    type: "physique"
  },
  {
    name: "Choso (Éveil)",
    power: 82,
    basic: "Sang Royal 🩸",
    special: "Rivière de Sang 🌊",
    ultimate: "Domaine : Mer de Sang 🌊🩸",
    domain: "Mer de Sang",
    cursedEnergy: 120,
    type: "maudit"
  },
  {
    name: "Mahito (Éveil)",
    power: 86,
    basic: "Transformation Parfaite 🧠",
    special: "Désespoir Infini 😈",
    ultimate: "Domaine : Abysse Maudit 🌌",
    domain: "Abysse Maudit",
    cursedEnergy: 140,
    type: "maudit"
  },
  {
    name: "Jogo (Éveil)",
    power: 84,
    basic: "Lave Inferno 🌋",
    special: "Brasier Éternel 🔥",
    ultimate: "Domaine : Fournaise 🌋🔥",
    domain: "Fournaise",
    cursedEnergy: 130,
    type: "maudit"
  },
  {
    name: "Hanami (Éveil)",
    power: 80,
    basic: "Forêt Maudite 🌳",
    special: "Nature Sauvage 🌿",
    ultimate: "Domaine : Jungle Maudite 🌍",
    domain: "Jungle Maudite",
    cursedEnergy: 120,
    type: "maudit"
  },
  {
    name: "Dagon (Éveil)",
    power: 78,
    basic: "Abysse Profond 🌊",
    special: "Océan Maudit 🐟",
    ultimate: "Domaine : Mer des Ténèbres 🌊",
    domain: "Mer des Ténèbres",
    cursedEnergy: 115,
    type: "maudit"
  },
  {
    name: "Toji (Éveil)",
    power: 90,
    basic: "Chaîne Mortelle ⛓️",
    special: "Lame Céleste 🗡️",
    ultimate: "Assassinat Ultime 🎯",
    domain: "Chasseur",
    cursedEnergy: 0,
    type: "physique"
  },
  {
    name: "Maki (Éveil)",
    power: 85,
    basic: "Lame Démoniaque 🗡️",
    special: "Force Brutale 💪",
    ultimate: "Domaine : Guerrière Totale ⚔️",
    domain: "Guerrière Totale",
    cursedEnergy: 50,
    type: "physique"
  },
  {
    name: "Panda (Éveil)",
    power: 75,
    basic: "Gorille Géant 🦍",
    special: "Triceratops Furieux 🦕",
    ultimate: "Domaine : Bête Légendaire 🐻",
    domain: "Bête Légendaire",
    cursedEnergy: 90,
    type: "physique"
  },
  {
    name: "Toge (Éveil)",
    power: 78,
    basic: "Parole Divine 🗣️",
    special: "Ordre Absolu ✨",
    ultimate: "Domaine : Silence Céleste 🤫",
    domain: "Silence Céleste",
    cursedEnergy: 110,
    type: "spécial"
  },
  {
    name: "Naoya (Éveil)",
    power: 82,
    basic: "Vitesse Infinie 🏃",
    special: "Frame Mortelle 💨",
    ultimate: "Domaine : Temps Absolu ⚡",
    domain: "Temps Absolu",
    cursedEnergy: 110,
    type: "physique"
  },
  {
    name: "Mei Mei (Éveil)",
    power: 78,
    basic: "Corbeau Maudit 🐦",
    special: "Nuée Noire 🐦🐦",
    ultimate: "Domaine : Vol de la Mort 💀",
    domain: "Vol de la Mort",
    cursedEnergy: 100,
    type: "physique"
  },
  {
    name: "Utahime (Éveil)",
    power: 70,
    basic: "Danse Sacrée 💃",
    special: "Chant Divin 🎤",
    ultimate: "Domaine : Symphonie Céleste 🎶",
    domain: "Symphonie Céleste",
    cursedEnergy: 95,
    type: "spécial"
  },
  {
    name: "Angel (Hana)",
    power: 85,
    basic: "Lumière Divine ✨",
    special: "Ailes Sacrées 🕊️",
    ultimate: "Domaine : Paradis 🌅",
    domain: "Paradis",
    cursedEnergy: 130,
    type: "spécial"
  },
  {
    name: "Uraume",
    power: 78,
    basic: "Glace Éternelle ❄️",
    special: "Tempête Gelée 🌨️",
    ultimate: "Domaine : Hiver Éternel ❄️",
    domain: "Hiver Éternel",
    cursedEnergy: 110,
    type: "maudit"
  },
  {
    name: "Kenjaku (Éveil)",
    power: 95,
    basic: "Corps Parfait 🧬",
    special: "Barrière Maudite Ultime 🕸️",
    ultimate: "Domaine : Mille Âmes 🎭",
    domain: "Mille Âmes",
    cursedEnergy: 180,
    type: "maudit"
  },
  {
    name: "Geto (Éveil)",
    power: 90,
    basic: "Absorption Totale 🌀",
    special: "Esprit Suprême 🌑",
    ultimate: "Domaine : Roi des Démons 👑",
    domain: "Roi des Démons",
    cursedEnergy: 160,
    type: "maudit"
  },
  {
    name: "Sukuna (Heian)",
    power: 105,
    basic: "Malveillance Primale 👹",
    special: "Découpage Absolu 🔪",
    ultimate: "Domaine : Sanctuaire Éternel ⛩️",
    domain: "Sanctuaire Éternel",
    cursedEnergy: 250,
    type: "maudit"
  },
  {
    name: "Gojo (Rouge)",
    power: 110,
    basic: "Rouge Absolu 🔴",
    special: "Bleu Infini 💠",
    ultimate: "Domaine : Illimitée Suprême 🌌",
    domain: "Illimitée Suprême",
    cursedEnergy: 250,
    type: "spécial"
  },
  {
    name: "Yuji (Sukuna)",
    power: 100,
    basic: "Double Possession 👹",
    special: "Malveillance Partagée 🔪",
    ultimate: "Domaine : Sanctuaire Double ⛩️",
    domain: "Sanctuaire Double",
    cursedEnergy: 200,
    type: "maudit"
  },
  {
    name: "Miwa Kasumi",
    power: 55,
    basic: "Katana 🗡️",
    special: "Danse de l'Épée 💃",
    ultimate: "Domaine : Lame Sacrée ⚔️",
    domain: "Lame Sacrée",
    cursedEnergy: 60,
    type: "physique"
  },
  {
    name: "Kamo Noritoshi",
    power: 65,
    basic: "Sang Maudit 🩸",
    special: "Flèche de Sang 🏹",
    ultimate: "Domaine : Rivière Sanglante 🩸",
    domain: "Rivière Sanglante",
    cursedEnergy: 80,
    type: "maudit"
  },
  {
    name: "Momo Nishimiya",
    power: 50,
    basic: "Balai 🧹",
    special: "Vent Tranchant 🌪️",
    ultimate: "Domaine : Tempête Aérienne 🌪️",
    domain: "Tempête Aérienne",
    cursedEnergy: 55,
    type: "physique"
  },
  {
    name: "Nobara (Résurrection)",
    power: 88,
    basic: "Clou Sacré 📌",
    special: "Marteau Divin 🔨",
    ultimate: "Domaine : Frappe Céleste Parfaite 🌟",
    domain: "Frappe Céleste Parfaite",
    cursedEnergy: 130,
    type: "physique"
  },
  {
    name: "Megumi (Shadow)",
    power: 92,
    basic: "Ombre Suprême 🌀",
    special: "Chimère Parfaite 🌿",
    ultimate: "Domaine : Royaume des Ombres 🌌",
    domain: "Royaume des Ombres",
    cursedEnergy: 150,
    type: "technique"
  },
  {
    name: "Takaba (Éveil)",
    power: 80,
    basic: "Blague Divine 🃏",
    special: "Rire Cosmique 😂",
    ultimate: "Domaine : Comédie Divine 🎭",
    domain: "Comédie Divine",
    cursedEnergy: 120,
    type: "spécial"
  }
];

// ─── SYSTÈME DE COMBAT ───
const damageSystem = {
  basic: { min: 10, max: 18, chakraCost: 0 },
  special: { min: 20, max: 32, chakraCost: 25 },
  ultimate: { min: 40, max: 60, chakraCost: 100, failChance: 0.15 },
  domain: { min: 60, max: 85, chakraCost: 150, failChance: 0.1 },
  charge: { chakraGain: 35 },
  blackFlash: { multiplier: 2.5, chance: 0.1 }
};

const domainEffects = {
  "Démolition": { boost: 1.3, effect: "dégâts augmentés" },
  "Illimitée": { boost: 1.5, effect: "défense infinie" },
  "Chimère Jardin": { boost: 1.2, effect: "création d'ombres" },
  "Sanctuaire Malveillant": { boost: 2.0, effect: "attaque massive" },
  "Amour Éternel": { boost: 1.6, effect: "régénération" },
  "Salle de Jeux": { boost: 1.4, effect: "chance augmentée" },
  "Désespoir Infini": { boost: 1.5, effect: "confusion" },
  "Tonnerre Divin": { boost: 1.3, effect: "paralysie" },
  "Big Bang": { boost: 1.8, effect: "destruction" },
  "Destruction Totale": { boost: 1.7, effect: "destruction massive" },
  "Ombre Éternelle": { boost: 1.4, effect: "ombre absorbante" },
  "Clairière Céleste": { boost: 1.3, effect: "guérison" },
  "Comédie Infernale": { boost: 1.5, effect: "confusion" },
  "Destruction Stellaire": { boost: 2.0, effect: "destruction cosmique" },
  "Tonnerre Infini": { boost: 1.6, effect: "paralysie totale" },
  "Mer de Sang": { boost: 1.4, effect: "saignement" },
  "Abysse Maudit": { boost: 1.6, effect: "absorption" },
  "Fournaise": { boost: 1.5, effect: "brûlure" },
  "Jungle Maudite": { boost: 1.4, effect: "empoisonnement" },
  "Mer des Ténèbres": { boost: 1.3, effect: "noyade" },
  "Guerrière Totale": { boost: 1.6, effect: "force brute" },
  "Bête Légendaire": { boost: 1.4, effect: "force animale" },
  "Silence Céleste": { boost: 1.5, effect: "silence" },
  "Temps Absolu": { boost: 1.6, effect: "vitesse" },
  "Vol de la Mort": { boost: 1.4, effect: "mort" },
  "Symphonie Céleste": { boost: 1.3, effect: "harmonie" },
  "Paradis": { boost: 1.5, effect: "guérison divine" },
  "Hiver Éternel": { boost: 1.4, effect: "gel" },
  "Mille Âmes": { boost: 1.7, effect: "possession" },
  "Roi des Démons": { boost: 1.8, effect: "domination" },
  "Sanctuaire Éternel": { boost: 2.2, effect: "destruction absolue" },
  "Illimitée Suprême": { boost: 2.5, effect: "omnipotence" },
  "Sanctuaire Double": { boost: 2.0, effect: "double destruction" },
  "Lame Sacrée": { boost: 1.3, effect: "tranchant" },
  "Rivière Sanglante": { boost: 1.4, effect: "saignement" },
  "Tempête Aérienne": { boost: 1.3, effect: "vent" },
  "Frappe Céleste Parfaite": { boost: 1.7, effect: "frappe divine" },
  "Royaume des Ombres": { boost: 1.6, effect: "ombre éternelle" },
  "Comédie Divine": { boost: 1.5, effect: "rire cosmique" }
};

// ─── STYLE ───
const bold = (txt) => {
  const map = {a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭'};
  return txt.split('').map(c => map[c] || c).join('');
};

function getHealthColor(hp) {
  if (hp === 100) return "💚";
  if (hp >= 85) return "💚";
  if (hp >= 55) return "💛";
  if (hp >= 25) return "🧡";
  if (hp > 0) return "❤️";
  return "💔";
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const gameState = {};

module.exports = {
  config: { 
    name: "jujutsu", 
    version: "6.0",
    author: "Master Charbel",
    role: 0,
    category: "game",
    shortDescription: "👹 Jujutsu Kaisen - Combat Ultime",
    longDescription: "Jeu de combat Jujutsu Kaisen avec domaine et énergie maudite - 58 personnages"
  },

  onStart: async function ({ message, event }) {
    const threadID = event.threadID;

    gameState[threadID] = {
      step: "waiting_start",
      players: {},
      turn: null,
      p1Character: null,
      p2Character: null,
      p1HP: 100,
      p2HP: 100,
      p1Cursed: 100,
      p2Cursed: 100,
      cursedRegen: 8,
      defending: false,
      domainActive: false,
      domainUser: null,
      blackFlashCharge: 0,
      lastAction: null,
      lastPlayer: null,
      battleLog: []
    };

    await message.reply({
      body: `👹 ${bold('JUJUTSU KAISEN - DOMAINE EXPANSION')} 👹\n━━━━━━━━━━━━━━━━━━━━\n` +
        `⚔️ ${bold('MODE COMBAT')}\n` +
        `🔥 ${bold('ENERGIE MAUDITE')} : Système avancé\n` +
        `🌌 ${bold('DOMAINE')} : Expansion disponible\n` +
        `💥 ${bold('BLACK FLASH')} : Chance de déchaînement\n` +
        `👥 ${bold('58 PERSONNAGES')} disponibles\n\n` +
        `📌 ${bold('ENVOYEZ "start" POUR COMMENCER')}`
    });
  },

  onChat: async function ({ event, message, usersData }) {
    const threadID = event.threadID;
    const userID = event.senderID;
    const body = event.body.toLowerCase();

    if (!gameState[threadID]) return;
    const state = gameState[threadID];

    if (state.step !== "waiting_start" && state.step !== "choose_p1" && state.step !== "choose_p2" && 
        userID !== state.players.p1 && userID !== state.players.p2) {
      return;
    }

    if (body === 'fin') {
      delete gameState[threadID];
      return message.reply(`🔄 ${bold('PARTIE TERMINÉE')}\n💡 Envoyez 'start' pour un nouveau combat.`);
    }

    if (state.step === "waiting_start" && body === "start") {
      state.step = "choose_p1";
      state.players.p1 = userID;
      return message.reply(`👹 ${bold('JOUEUR 1')}\n📌 Tapez 'p1' pour sélectionner votre personnage`);
    }

    if (state.step === "choose_p1" && body === 'p1') {
      if (userID !== state.players.p1) return;
      state.step = "choose_p2";
      return message.reply(`🔥 ${bold('JOUEUR 2')}\n📌 Tapez 'p2' pour vous inscrire`);
    }

    if (state.step === "choose_p2" && body === 'p2') {
      if (userID === state.players.p1) {
        return message.reply(`❌ ${bold('ERREUR')}\nVous ne pouvez pas être les deux joueurs !`);
      }
      state.players.p2 = userID;
      state.step = "choose_characters_p1";
      
      let characterList = `🎭 ${bold('LISTE DES 58 PERSONNAGES')}\n━━━━━━━━━━━━━━━━━━━━\n`;
      characterList += characters.map((char, i) => 
        `${i + 1}. ${char.name} (${char.power}★) - ${char.type}`
      ).join("\n");
      
      const userInfo = await usersData.get(state.players.p1);
      return message.reply({
        body: characterList + `\n\n👤 @${userInfo.name} ${bold('JOUEUR 1')}\n📌 Répondez avec le numéro du personnage`,
        mentions: [{
          tag: `@${userInfo.name}`,
          id: state.players.p1
        }]
      });
    }

    if (state.step.startsWith("choose_characters")) {
      const index = parseInt(body) - 1;
      
      if (isNaN(index) || index < 0 || index >= characters.length) {
        return message.reply(`❌ ${bold('NUMÉRO INVALIDE')}\n📌 Choisissez un numéro entre 1 et ${characters.length}`);
      }

      if (state.step === "choose_characters_p1" && userID === state.players.p1) {
        state.p1Character = characters[index];
        state.step = "choose_characters_p2";
        const userInfo = await usersData.get(state.players.p2);
        return message.reply({
          body: `✅ ${bold('JOUEUR 1')} : ${state.p1Character.name}\n\n👤 @${userInfo.name} ${bold('JOUEUR 2')}\n📌 Choisissez votre personnage`,
          mentions: [{
            tag: `@${userInfo.name}`,
            id: state.players.p2
          }]
        });
      }

      if (state.step === "choose_characters_p2" && userID === state.players.p2) {
        state.p2Character = characters[index];
        state.turn = "p1";
        state.step = "battle";
        
        const p1Info = await usersData.get(state.players.p1);
        const p2Info = await usersData.get(state.players.p2);
        
        const battleStartMsg = `⚔️ ${bold('COMBAT DÉCLENCHÉ !')}\n━━━━━━━━━━━━━━━━━━━━\n` +
          `👹 ${state.p1Character.name} (@${p1Info.name})\n` +
          `VS\n` +
          `👹 ${state.p2Character.name} (@${p2Info.name})\n\n` +
          `📌 ${bold('COMMANDES DISPONIBLES')} :\n` +
          `» ${bold('a')} - Attaque basique (0 énergie)\n` +
          `» ${bold('b')} - Technique spéciale (-25 énergie)\n` +
          `» ${bold('x')} - Ultime (-100 énergie)\n` +
          `» ${bold('d')} - Expansion de Domaine (-150 énergie)\n` +
          `» ${bold('c')} - Charger énergie (+35 énergie)\n` +
          `» ${bold('g')} - Défense (réduit dégâts)\n\n` +
          `🔥 ${bold('ÉNERGIE MAUDITE')} : ${state.p1Cursed}%\n` +
          `🔥 ${bold('ÉNERGIE MAUDITE')} : ${state.p2Cursed}%\n\n` +
          `@${p1Info.name} ${bold('JOUEUR 1')}, c'est à toi de jouer !`;
        
        return message.reply({
          body: battleStartMsg,
          mentions: [{
            tag: `@${p1Info.name}`,
            id: state.players.p1
          }]
        });
      }
      return;
    }

    if (state.step === "battle") {
      const currentPlayer = state.turn === "p1" ? state.players.p1 : state.players.p2;
      if (userID !== currentPlayer) return;

      if (body === 'c' && state.lastAction === 'c' && state.lastPlayer === userID) {
        return message.reply(`❌ ${bold('IMPOSSIBLE')}\nVous ne pouvez pas charger deux fois de suite !`);
      }

      const attacker = state.turn === "p1" ? state.p1Character : state.p2Character;
      const defender = state.turn === "p1" ? state.p2Character : state.p1Character;
      const hpKey = state.turn === "p1" ? "p2HP" : "p1HP";
      const cursedKey = state.turn === "p1" ? "p1Cursed" : "p2Cursed";

      let damage = 0;
      let tech = "Attaque basique";
      let effect = "👊";
      let cursedUsed = 0;
      let missed = false;
      let chargeMessage = "";
      let isBlackFlash = false;
      let isDomain = false;

      if (Math.random() < damageSystem.blackFlash.chance && state.blackFlashCharge > 2) {
        isBlackFlash = true;
        state.blackFlashCharge = 0;
      } else {
        state.blackFlashCharge++;
      }

      switch (body) {
        case 'a':
          damage = randomBetween(damageSystem.basic.min, damageSystem.basic.max);
          if (isBlackFlash) {
            damage = Math.floor(damage * damageSystem.blackFlash.multiplier);
            tech = "BLACK FLASH ⚡";
            effect = "💥💫";
          } else {
            tech = "Attaque basique";
            effect = "👊";
          }
          break;

        case 'b':
          if (state[cursedKey] < damageSystem.special.chakraCost) {
            missed = true;
            break;
          }
          damage = randomBetween(damageSystem.special.min, damageSystem.special.max);
          cursedUsed = damageSystem.special.chakraCost;
          tech = attacker.special;
          effect = attacker.special.split(' ').pop();
          if (isBlackFlash) {
            damage = Math.floor(damage * damageSystem.blackFlash.multiplier);
            tech = "BLACK FLASH + " + tech;
            effect = "💥💫";
          }
          break;

        case 'x':
          if (state[cursedKey] < damageSystem.ultimate.chakraCost) {
            missed = true;
            break;
          }
          cursedUsed = damageSystem.ultimate.chakraCost;
          if (Math.random() < damageSystem.ultimate.failChance) {
            missed = true;
            tech = attacker.ultimate + " (échoué)";
            effect = "❌";
          } else {
            damage = randomBetween(damageSystem.ultimate.min, damageSystem.ultimate.max);
            tech = attacker.ultimate;
            effect = attacker.ultimate.split(' ').pop();
            if (isBlackFlash) {
              damage = Math.floor(damage * damageSystem.blackFlash.multiplier);
              tech = "BLACK FLASH + " + tech;
              effect = "💥💫";
            }
          }
          break;

        case 'd':
          if (state[cursedKey] < damageSystem.domain.chakraCost) {
            missed = true;
            break;
          }
          if (state.domainActive) {
            return message.reply(`❌ ${bold('DOMAINE DÉJÀ ACTIF')}\nUn domaine est déjà déployé !`);
          }
          if (!attacker.domain) {
            return message.reply(`❌ ${bold('PAS DE DOMAINE')}\nCe personnage n'a pas de domaine !`);
          }
          
          cursedUsed = damageSystem.domain.chakraCost;
          if (Math.random() < damageSystem.domain.failChance) {
            missed = true;
            tech = "Domaine : " + attacker.domain + " (échoué)";
            effect = "❌";
          } else {
            state.domainActive = true;
            state.domainUser = state.turn;
            isDomain = true;
            const domainBoost = domainEffects[attacker.domain]?.boost || 1.3;
            damage = randomBetween(damageSystem.domain.min, damageSystem.domain.max);
            damage = Math.floor(damage * domainBoost);
            tech = "Domaine : " + attacker.domain + " 🌌";
            effect = "🌀";
            if (isBlackFlash) {
              damage = Math.floor(damage * damageSystem.blackFlash.multiplier);
              tech = "BLACK FLASH + " + tech;
              effect = "💥💫🌀";
            }
          }
          break;

        case 'c':
          const gain = damageSystem.charge.chakraGain + (state.domainActive && state.domainUser === state.turn ? 20 : 0);
          state[cursedKey] = Math.min(100, state[cursedKey] + gain);
          chargeMessage = `🔋 ${attacker.name} accumule +${gain}% d'énergie maudite !`;
          state.lastAction = 'c';
          state.lastPlayer = userID;
          state.turn = state.turn === "p1" ? "p2" : "p1";
          return await sendBattleMessage();

        case 'g':
          state.defending = state.turn;
          state.lastAction = 'g';
          state.lastPlayer = userID;
          state.turn = state.turn === "p1" ? "p2" : "p1";
          return message.reply(`🛡️ ${bold(attacker.name)} se met en position défensive !`);

        default:
          return message.reply(`❌ ${bold('COMMANDE INVALIDE')}\n📌 Utilisez : a, b, x, d, c, g`);
      }

      if (!missed) {
        if (state.defending && state.defending !== state.turn) {
          damage = Math.floor(damage * 0.6);
          tech += " (défendu)";
        }

        state[cursedKey] -= cursedUsed;
        state[cursedKey] = Math.max(0, state[cursedKey]);
        state[hpKey] -= damage;
        state[hpKey] = Math.max(0, state[hpKey]);
      }

      state.lastAction = body;
      state.lastPlayer = userID;

      if (state.turn === "p1") {
        state.p1Cursed = Math.min(100, state.p1Cursed + state.cursedRegen + (state.domainActive && state.domainUser === "p1" ? 10 : 0));
      } else {
        state.p2Cursed = Math.min(100, state.p2Cursed + state.cursedRegen + (state.domainActive && state.domainUser === "p2" ? 10 : 0));
      }

      async function sendBattleMessage() {
        let msg = "";

        if (body !== 'c' && !missed) {
          if (isDomain) {
            msg += `🌌 ${bold(attacker.name)} DÉPLOIE SON DOMAINE !\n`;
            msg += `🌀 ${attacker.domain} - ${domainEffects[attacker.domain]?.effect || 'Effet mystérieux'}\n\n`;
          }
          msg += `⚡ ${attacker.name} utilise ${tech} ${effect}\n`;
          msg += `💥 Inflige ${damage}% de dégâts à ${defender.name} !\n\n`;
          if (isBlackFlash) {
            msg += `💫 ${bold('BLACK FLASH !!!')} ⚡\n\n`;
          }
        } else if (missed) {
          msg += `⚡ ${attacker.name} tente ${tech}...\n`;
          msg += `❌ Échec ! ${state[cursedKey] < (damageSystem.domain.chakraCost || damageSystem.ultimate.chakraCost) ? "Énergie maudite insuffisante" : "Technique ratée"}\n\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `${getHealthColor(state.p1HP)}|${state.p1Character.name}: HP ${state.p1HP}%\n`;
        msg += `🔥| Énergie Maudite ${state.p1Cursed}%\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `${getHealthColor(state.p2HP)}|${state.p2Character.name}: HP ${state.p2HP}%\n`;
        msg += `🔥| Énergie Maudite ${state.p2Cursed}%\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━\n`;

        if (state.domainActive) {
          msg += `🌌 ${bold('DOMAINE ACTIF')} : ${state.domainUser === "p1" ? state.p1Character.name : state.p2Character.name}\n`;
        }

        if (chargeMessage) msg += `${chargeMessage}\n`;

        if (state.p1HP <= 0 || state.p2HP <= 0) {
          const winner = state.p1HP <= 0 ? state.p2Character.name : state.p1Character.name;
          msg += `🏆 ${bold('VICTOIRE')} DE ${winner} !\n`;
          msg += `👹 Combat terminé. Tapez 'fin' pour recommencer.`;
          delete gameState[threadID];
        } else {
          state.turn = state.turn === "p1" ? "p2" : "p1";
          state.defending = false;
          const nextPlayer = state.turn === "p1" ? state.players.p1 : state.players.p2;
          const userInfo = await usersData.get(nextPlayer);
          msg += `@${userInfo.name} ${bold('JOUEUR ' + (state.turn === "p1" ? "1" : "2"))}, c'est à toi de jouer !`;
        }

        const nextPlayer = state.turn === "p1" ? state.players.p1 : state.players.p2;
        const userInfo = await usersData.get(nextPlayer);
        
        return message.reply({
          body: msg,
          mentions: [{
            tag: `@${userInfo.name}`,
            id: nextPlayer
          }]
        });
      }

      return await sendBattleMessage();
    }
  }
};
