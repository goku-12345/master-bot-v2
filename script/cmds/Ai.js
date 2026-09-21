const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

// ══════════════════════════════════════
//  🔑 CLÉ API GEMINI
// ══════════════════════════════════════
const GEMINI_KEY = "AQ.Ab8RN6I0t9_tKk5yYJRmZ4QejIQn7ZQxr4eE1SeRGPJS6SE_4Q";
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const memory = {};
const botMessages = new Set();

function toStyle(text) {
  const map = {
    A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',
    K:'𝑲',L:'𝑳',M:'𝑴',N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',
    U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁',
    a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',h:'𝒉',i:'𝒊',j:'𝒋',
    k:'𝒌',l:'𝒍',m:'𝒎',n:'𝒏',o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',
    u:'𝒖',v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',' ':' '
  };
  return text.split('').map(c => map[c] || c).join('');
}

function resumeLocal(texte) {
  return texte.split(/[.!?]+/).filter(p => p.trim().length > 20).slice(0, 3).map(p => `• ${p.trim()}`).join('\n');
}

async function callGemini(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  const res = await axios.post(API_ENDPOINT, body, {
    headers: { 'Content-Type': 'application/json' }
  });
  const c = res.data && res.data.candidates && res.data.candidates[0];
  return c && c.content && c.content.parts && c.content.parts[0] && c.content.parts[0].text || null;
}

async function repondre({ api, event, message, input }) {
  const uid = event.senderID;

  if (!memory[uid]) memory[uid] = [];
  memory[uid].push({ role: 'user', content: input });
  if (memory[uid].length > 20) memory[uid] = memory[uid].slice(-20);

  const context = memory[uid].map(m => `${m.role === 'user' ? 'Utilisateur' : 'IA'}: ${m.content}`).join('\n');

  const prompt = `Tu es une IA intelligente, utile et amicale créée par Master Charbel. Tu réponds toujours en français de façon claire et précise. Ne mentionne jamais d'autre développeur que Master Charbel.

Historique :
${context}

Réponds à la dernière question.`;

  api.setMessageReaction("🤞", event.messageID, () => {}, true);

  try {
    let reply = await callGemini(prompt);
    if (!reply) reply = '...';
    reply = reply.replace(/Shizu|Aryan Chauhan|Christuska|Satoru Gojo/gi, 'Master AI');

    memory[uid].push({ role: 'ai', content: reply });

    const res =
      `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
      `╭━━ 🤖 𝑹é𝒑𝒐𝒏𝒔𝒆\n│ ${toStyle(reply)}\n╰━━━━━━━ ✨`;

    const sent = await message.reply(res);
    if (sent?.messageID) botMessages.add(sent.messageID);
  } catch {
    const err = await message.reply(toStyle("Désolé, une erreur est survenue. Réessaie !"));
    if (err?.messageID) botMessages.add(err.messageID);
  }
}

module.exports = {
  config: {
    name: 'ai',
    aliases: ['ia', 'charbel'],
    version: '14.0',
    author: 'Master Charbel',
    role: 0,
    category: 'ai',
    hasPrefix: false,
    shortDescription: '🤖 IA complète avec mémoire',
    longDescription: "IA avec mémoire, image, YouTube, résumé. Reply ses messages pour continuer la conversation.",
    guide: 'ai <question> | ai image <prompt> | ai yt <recherche> | ai resume <texte> | ai reset'
  },

  onChat: async function ({ api, event, message }) {
    if (!event.messageReply) return;
    if (!botMessages.has(event.messageReply.messageID)) return;
    const input = event.body?.trim();
    if (!input) return;
    await repondre({ api, event, message, input });
  },

  onStart: async function ({ api, event, args, message }) {
    const uid = event.senderID;
    const sub = args[0]?.toLowerCase();
    const input = args.join(' ').trim();

    // ── RESET ──
    if (sub === 'reset') {
      delete memory[uid];
      return message.reply(
        `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
        `╭━━ 🗑 𝑴é𝒎𝒐𝒊𝒓𝒆\n│ ${toStyle("Mémoire effacée ! On repart de zéro.")}\n╰━━━━━━━ ✨`
      );
    }

    // ── IMAGE ──
    if (sub === 'image') {
      const prompt = args.slice(1).join(' ').trim();
      if (!prompt) return message.reply(
        `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
        `╭━━ 🎨 𝑰𝒎𝒂𝒈𝒆\n│ ${toStyle("Donne une description ! Ex : ai image coucher de soleil")}\n╰━━━━━━━ ✨`
      );

      api.setMessageReaction("🎨", event.messageID, () => {}, true);

      try {
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true`;
        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        const imgPath = path.join(__dirname, 'cache', `img_${uuidv4()}.jpg`);
        await fs.ensureDir(path.dirname(imgPath));
        await fs.writeFile(imgPath, response.data);

        const sent = await message.reply({
          body: `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n╭━━ 🎨 𝑰𝒎𝒂𝒈𝒆\n│ ${toStyle(prompt)}\n╰━━━━━━━ ✨`,
          attachment: fs.createReadStream(imgPath)
        });
        if (sent?.messageID) botMessages.add(sent.messageID);
        setTimeout(() => fs.remove(imgPath).catch(() => {}), 15000);
      } catch {
        return message.reply(
          `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
          `╭━━ ❌ 𝑬𝒓𝒓𝒆𝒖𝒓\n│ ${toStyle("Génération échouée, réessaie !")}\n╰━━━━━━━ ✨`
        );
      }
      return;
    }

    // ── YOUTUBE ──
    if (sub === 'yt') {
      const query = args.slice(1).join(' ').trim();
      if (!query) return message.reply(
        `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
        `╭━━ 🎵 𝒀𝒐𝒖𝑻𝒖𝒃𝒆\n│ ${toStyle("Donne un titre ! Ex : ai yt Drake")}\n╰━━━━━━━ ✨`
      );

      api.setMessageReaction("🎵", event.messageID, () => {}, true);

      try {
        const results = await ytSearch(query);
        const videos = results.videos.slice(0, 5);
        if (!videos.length) return message.reply(
          `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
          `╭━━ ❌\n│ ${toStyle("Aucun résultat trouvé.")}\n╰━━━━━━━ ✨`
        );

        let res = `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n╭━━ 🎵 𝒀𝒐𝒖𝑻𝒖𝒃𝒆\n`;
        videos.forEach((v, i) => {
          res += `│\n│ ${i + 1}. ${toStyle(v.title.slice(0, 30))}\n`;
          res += `│ ⏱ ${v.timestamp || '??:??'}  👁 ${(v.views || 0).toLocaleString()}\n`;
          res += `│ 🔗 ${v.url}\n`;
        });
        res += `╰━━━━━━━ ✨`;

        return message.reply(res);
      } catch {
        return message.reply(
          `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
          `╭━━ ❌\n│ ${toStyle("Erreur YouTube. Réessaie !")}\n╰━━━━━━━ ✨`
        );
      }
    }

    // ── RÉSUMÉ ──
    if (sub === 'resume') {
      const texte = args.slice(1).join(' ').trim();
      if (!texte || texte.length < 50) return message.reply(
        `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
        `╭━━ ❌\n│ ${toStyle("Texte trop court ! (min 50 caractères)")}\n╰━━━━━━━ ✨`
      );

      api.setMessageReaction("📝", event.messageID, () => {}, true);

      try {
        const resumePrompt = `Résume ce texte en 3 points clairs en français :\n\n${texte}`;
        let reply = await callGemini(resumePrompt);
        if (!reply) reply = resumeLocal(texte);

        return message.reply(
          `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
          `╭━━ 📝 𝑹é𝒔𝒖𝒎é\n│ ${toStyle(reply)}\n╰━━━━━━━ ✨`
        );
      } catch {
        return message.reply(
          `✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n` +
          `╭━━ 📝 𝑹é𝒔𝒖𝒎é\n│ ${toStyle(resumeLocal(texte))}\n╰━━━━━━━ ✨`
        );
      }
    }

    // ── IA PRINCIPALE (avec ou sans texte) ──
    const question = input || "Présente-toi en une phrase.";
    await repondre({ api, event, message, input: question });
  }
};
