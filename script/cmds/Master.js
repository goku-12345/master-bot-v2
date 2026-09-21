 const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

// ══════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════
const GEMINI_KEY   = "AQ.Ab8RN6I0t9_tKk5yYJRmZ4QejIQn7ZQxr4eE1SeRGPJS6SE_4Q";
const GITHUB_TOKEN = "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";
const REPO_OWNER   = "charl20000";
const REPO_NAME    = "master-bot-v2";
const BRANCH       = "main";
const CMD_FOLDER   = "scripts/cmds/";

// 🔑 ADMIN AUTORISÉS POUR GITHUB
const ADMIN_IDS = ["61594170716211", "100089867688595"];

const GEMINI_URL   = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY;
const FALLBACK_API = "https://shizuai.vercel.app/chat";
const GH_API       = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME;

const memory = {};
const botMessages = new Set();
const ghSessions = {};

// ══════════════════════════════════════
//  STYLE TEXTE
// ══════════════════════════════════════
function toStyle(text) {
  var map = {
    A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',
    K:'𝑲',L:'𝑳',M:'𝑴',N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',
    U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁',
    a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',h:'𝒉',i:'𝒊',j:'𝒋',
    k:'𝒌',l:'𝒍',m:'𝒎',n:'𝒏',o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',
    u:'𝒖',v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',' ':' '
  };
  return text.split('').map(function(c) { return map[c] || c; }).join('');
}

function fmt(titre, corps) {
  return '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n╭━━ ' + titre + '\n│ ' + corps + '\n╰━━━━━━━ ✨';
}

function nettoyerReply(text) {
  var mots = ['Shizu','Aryan Chauhan','Christuska','Satoru Gojo','Google'];
  var res = text;
  for (var i = 0; i < mots.length; i++) {
    while (res.indexOf(mots[i]) !== -1) res = res.replace(mots[i], 'Master AI');
  }
  return res;
}

function resumeLocal(texte) {
  var phrases = texte.split('.');
  var result = [];
  for (var i = 0; i < phrases.length; i++) {
    var p = phrases[i].trim();
    if (p.length > 20) result.push('• ' + p);
    if (result.length >= 3) break;
  }
  return result.join('\n');
}

// ══════════════════════════════════════
//  PERMISSIONS
// ══════════════════════════════════════
function isAdmin(uid) {
  return ADMIN_IDS.includes(String(uid));
}

// ══════════════════════════════════════
//  GITHUB HELPERS
// ══════════════════════════════════════
function ghHeaders() {
  return {
    'Authorization': 'token ' + GITHUB_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  };
}

async function ghListFiles(folder) {
  var url = GH_API + '/contents/' + (folder || '');
  var res = await axios.get(url, { headers: ghHeaders() });
  return res.data;
}

async function ghReadFile(filePath) {
  var url = GH_API + '/contents/' + filePath;
  var res = await axios.get(url, { headers: ghHeaders() });
  var content = Buffer.from(res.data.content, 'base64').toString('utf8');
  return { content: content, sha: res.data.sha };
}

async function ghWriteFile(filePath, content, commitMsg, sha) {
  var url = GH_API + '/contents/' + filePath;
  var body = {
    message: commitMsg || 'Update via Master AI',
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  await axios.put(url, body, { headers: ghHeaders() });
}

async function ghDeleteFile(filePath, sha, commitMsg) {
  var url = GH_API + '/contents/' + filePath;
  await axios.delete(url, {
    headers: ghHeaders(),
    data: { message: commitMsg || 'Delete via Master AI', sha: sha, branch: BRANCH }
  });
}

async function ghGetSha(filePath) {
  try {
    var res = await axios.get(GH_API + '/contents/' + filePath, { headers: ghHeaders() });
    return res.data.sha;
  } catch(e) { return null; }
}

// ══════════════════════════════════════
//  IA HELPERS
// ══════════════════════════════════════
async function callGemini(prompt) {
  var body = { contents: [{ parts: [{ text: prompt }] }] };
  var res = await axios.post(GEMINI_URL, body, { headers: { 'Content-Type': 'application/json' } });
  var c = res.data && res.data.candidates && res.data.candidates[0];
  return c && c.content && c.content.parts && c.content.parts[0] && c.content.parts[0].text || null;
}

async function callFallback(uid, prompt) {
  var res = await axios.post(FALLBACK_API, { uid: uid, message: prompt });
  return res.data && res.data.reply || null;
}

async function callAI(uid, prompt) {
  try { var r = await callGemini(prompt); if (r) return r; } catch(e) {}
  try { var r2 = await callFallback(uid, prompt); if (r2) return r2; } catch(e) {}
  return null;
}

async function repondre(api, event, message, input) {
  var uid = event.senderID;
  if (!memory[uid]) memory[uid] = [];
  memory[uid].push({ role: 'user', content: input });
  if (memory[uid].length > 20) memory[uid] = memory[uid].slice(-20);

  var context = memory[uid].map(function(m) {
    return (m.role === 'user' ? 'Utilisateur' : 'IA') + ': ' + m.content;
  }).join('\n');

  var prompt =
    'Tu es une IA intelligente et amicale creee par Master Charbel. ' +
    'Tu reponds TOUJOURS en francais, clairement. ' +
    'Ne cite jamais d\'autre developpeur que Master Charbel.\n\n' +
    'Historique :\n' + context + '\n\nReponds a la derniere question.';

  api.setMessageReaction("🤞", event.messageID, function() {}, true);

  var reply = await callAI(uid, prompt);
  if (!reply) return message.reply(fmt('❌ 𝑬𝒓𝒓𝒆𝒖𝒓', toStyle('Service indisponible. Reessaie !')));

  var clean = nettoyerReply(reply);
  memory[uid].push({ role: 'ai', content: clean });

  var sent = await message.reply(fmt('🤖 𝑹é𝒑𝒐𝒏𝒔𝒆', toStyle(clean)));
  if (sent && sent.messageID) botMessages.add(sent.messageID);
}

// ══════════════════════════════════════
//  MODULE PRINCIPAL
// ══════════════════════════════════════
module.exports = {
  config: {
    name: 'Master',
    aliases: ['ask', 'chat'],
    version: '20.0',
    author: 'Master Charbel',
    role: 0,
    category: 'ai',
    hasPrefix: false,
    shortDescription: { en: '🤖 Master AI — IA + GitHub + image + YouTube + résumé' },
    longDescription: { en: 'IA Gemini complète avec gestion GitHub, image, YouTube et résumé.' },
    guide: { en: 'ai <question> | ai image | ai yt | ai resume | ai gh list | ai gh read | ai gh save | ai reset' }
  },

  onChat: async function({ api, event, message }) {
    if (!event.messageReply) return;
    if (!botMessages.has(event.messageReply.messageID)) return;
    var input = event.body && event.body.trim();
    if (!input) return;
    await repondre(api, event, message, input);
  },

  onStart: async function({ api, event, args, message }) {
    var uid  = event.senderID;
    var sub  = args[0] ? args[0].toLowerCase() : '';
    var sub2 = args[1] ? args[1].toLowerCase() : '';
    var input = args.join(' ').trim();

    // ─── RESET ───
    if (sub === 'reset') {
      delete memory[uid];
      return message.reply(fmt('🗑️ 𝑴é𝒎𝒐𝒊𝒓𝒆', toStyle('Memoire effacee !')));
    }

    // ─── IMAGE ───
    if (sub === 'image') {
      var prompt = args.slice(1).join(' ').trim();
      if (!prompt) return message.reply(fmt('🎨 𝑰𝒎𝒂𝒈𝒆', toStyle('Ex : ai image coucher de soleil')));

      api.setMessageReaction("🎨", event.messageID, function() {}, true);
      try {
        var imgUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=768&height=768&nologo=true';
        var imgResp = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        var imgPath = path.join(__dirname, 'cache', 'img_' + uuidv4() + '.jpg');
        await fs.ensureDir(path.dirname(imgPath));
        await fs.writeFile(imgPath, imgResp.data);
        var sent = await message.reply({ body: fmt('🎨 𝑰𝒎𝒂𝒈𝒆', toStyle(prompt)), attachment: fs.createReadStream(imgPath) });
        if (sent && sent.messageID) botMessages.add(sent.messageID);
        setTimeout(function() { fs.remove(imgPath).catch(function(){}); }, 15000);
      } catch(e) {
        return message.reply(fmt('❌ 𝑬𝒓𝒓𝒆𝒖𝒓', toStyle('Generation echouee. Reessaie !')));
      }
      return;
    }

    // ─── YOUTUBE ───
    if (sub === 'yt') {
      var query = args.slice(1).join(' ').trim();
      if (!query) return message.reply(fmt('🎵 𝒀𝒐𝒖𝑻𝒖𝒃𝒆', toStyle('Ex : ai yt Drake')));

      api.setMessageReaction("🎵", event.messageID, function() {}, true);
      try {
        var results = await ytSearch(query);
        var videos = results.videos.slice(0, 5);
        if (!videos.length) return message.reply(fmt('❌', toStyle('Aucun resultat.')));

        var res = '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n╭━━ 🎵 𝒀𝒐𝒖𝑻𝒖𝒃𝒆\n';
        for (var i = 0; i < videos.length; i++) {
          var v = videos[i];
          res += '│\n│ ' + (i+1) + '. ' + toStyle(v.title.slice(0,30)) + '\n';
          res += '│ ⏱ ' + (v.timestamp||'??:??') + '  👁 ' + (v.views||0).toLocaleString() + '\n';
          res += '│ 🔗 ' + v.url + '\n';
        }
        res += '╰━━━━━━━ ✨';
        return message.reply(res);
      } catch(e) {
        return message.reply(fmt('❌', toStyle('Erreur YouTube. Reessaie !')));
      }
    }

    // ─── RÉSUMÉ ───
    if (sub === 'resume') {
      var texte = args.slice(1).join(' ').trim();
      if (!texte || texte.length < 50) return message.reply(fmt('❌', toStyle('Texte trop court ! (min 50 caract.)')));

      api.setMessageReaction("📝", event.messageID, function() {}, true);
      var rPrompt = 'Resume ce texte en 3 points clairs en francais :\n\n' + texte;
      var reply = await callAI(uid, rPrompt) || resumeLocal(texte);
      return message.reply(fmt('📝 𝑹é𝒔𝒖𝒎é', toStyle(reply)));
    }

    // ─── GITHUB (ADMIN SEULEMENT) ───
    if (sub === 'gh') {

      // 🔒 VÉRIFICATION ADMIN
      if (!isAdmin(uid)) {
        return message.reply(
          '🔒 **Acces refuse**\n\n' +
          'Seuls les admins peuvent utiliser GitHub.\n' +
          '💡 Tu peux utiliser l\'IA normalement avec `ai <question>`'
        );
      }

      // ─── AIDE ───
      if (!sub2) {
        return message.reply(
          '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n' +
          '╭━━ 📁 𝑮𝒊𝒕𝑯𝒖𝒃\n│\n' +
          '│ ai gh list [dossier] [page]\n' +
          '│ ai gh read <fichier>\n' +
          '│ ai gh save <fichier> | <contenu>\n' +
          '│ ai gh delete <fichier>\n' +
          '│ ai gh info\n' +
          '│\n' +
          '│ 💡 Après "list", réponds avec un numéro !\n' +
          '╰━━━━━━━ ✨'
        );
      }

      // ─── LISTE AVEC PAGINATION ───
      if (sub2 === 'list' || sub2 === 'ls') {
        var folder = args[2] || '';
        var page = parseInt(args[3]) || 1;

        try {
          var files = await ghListFiles(folder);
          var dirs  = files.filter(function(f) { return f.type === 'dir'; });
          var fls   = files.filter(function(f) { return f.type === 'file'; });
          var allItems = dirs.concat(fls);

          var perPage = 10;
          var totalPages = Math.ceil(allItems.length / perPage);
          if (page < 1) page = 1;
          if (page > totalPages) page = totalPages;

          var startIdx = (page - 1) * perPage;
          var pageItems = allItems.slice(startIdx, startIdx + perPage);

          var res = '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n';
          res += '╭━━ 📁 ' + toStyle('GitHub : ' + (folder || 'racine')) + '\n│\n';
          res += '│ 📄 Page ' + page + '/' + totalPages + '\n│\n';

          for (var i = 0; i < pageItems.length; i++) {
            var item = pageItems[i];
            var num = startIdx + i + 1;
            var icon = item.type === 'dir' ? '📂' : '📄';
            res += '│ ' + num + '. ' + icon + ' ' + item.name + '\n';
          }

          res += '│\n│ ' + toStyle(dirs.length + ' dossiers, ' + fls.length + ' fichiers') + '\n';
          res += '│\n│ 💡 Réponds avec un numéro pour ouvrir\n';
          res += '╰━━━━━━━ ✨';

          var sent = await message.reply(res);

          if (sent && sent.messageID) {
            botMessages.add(sent.messageID);
            ghSessions[sent.messageID] = {
              type: 'list',
              items: allItems,
              folder: folder,
              page: page,
              totalPages: totalPages,
              author: uid
            };
          }
          return sent;

        } catch(e) {
          return message.reply(fmt('❌ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle('Dossier introuvable.')));
        }
      }

      // ─── LIRE ───
      if (sub2 === 'read' || sub2 === 'cat') {
        var filePath = args.slice(2).join(' ').trim();
        if (!filePath) return message.reply(fmt('❌', toStyle('Ex : ai gh read scripts/cmds/help.js')));

        try {
          var file = await ghReadFile(filePath);
          var preview = file.content.slice(0, 800);
          var res = '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n';
          res += '╭━━ 📖 ' + toStyle(filePath) + '\n│\n';
          var lines = preview.split('\n');
          for (var i = 0; i < lines.length && i < 30; i++) res += '│ ' + lines[i] + '\n';
          if (file.content.length > 800) res += '│ ... (' + file.content.length + ' caract. total)\n';
          res += '╰━━━━━━━ ✨';
          return message.reply(res);
        } catch(e) {
          return message.reply(fmt('❌ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle('Fichier introuvable : ' + filePath)));
        }
      }

      // ─── SAUVEGARDER ───
      if (sub2 === 'save') {
        var rest = args.slice(2).join(' ');
        var sep  = rest.indexOf('|');
        if (sep === -1) {
          // Mode "réponse" : demander le contenu
          var fileName = args[2];
          if (!fileName) return message.reply(fmt('❌', toStyle('Format : ai gh save <fichier.js> | <contenu>')));
          if (!fileName.endsWith('.js')) fileName += '.js';
          var fullPath = CMD_FOLDER + fileName;

          var sent = await message.reply(
            '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n' +
            '╭━━ 💾 𝑺𝒂𝒖𝒗𝒆𝒈𝒂𝒓𝒅𝒆\n│\n' +
            '│ 📝 Fichier : ' + fileName + '\n' +
            '│\n' +
            '│ 💡 Réponds à ce message avec le contenu.\n' +
            '╰━━━━━━━ ✨'
          );
          if (sent && sent.messageID) {
            botMessages.add(sent.messageID);
            ghSessions[sent.messageID] = {
              type: 'save',
              filePath: fullPath,
              author: uid
            };
          }
          return sent;
        }

        var fileName = rest.slice(0, sep).trim();
        var content2 = rest.slice(sep + 1).trim();
        if (!fileName.endsWith('.js')) fileName += '.js';
        var fullPath = CMD_FOLDER + fileName;

        try {
          var sha2 = await ghGetSha(fullPath);
          await ghWriteFile(fullPath, content2, 'Save ' + fileName + ' via Master AI', sha2);
          return message.reply(fmt('✅ 𝑺𝒂𝒖𝒗𝒆𝒈𝒂𝒓𝒅𝒆', toStyle(fileName + ' sauvegarde dans ' + CMD_FOLDER + ' !')));
        } catch(e) {
          return message.reply(fmt('❌ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle('Erreur sauvegarde : ' + e.message)));
        }
      }

      // ─── SUPPRIMER ───
      if (sub2 === 'delete' || sub2 === 'rm') {
        var filePath = args.slice(2).join(' ').trim();
        if (!filePath) return message.reply(fmt('❌', toStyle('Ex : ai gh delete scripts/cmds/test.js')));

        try {
          var file2 = await ghReadFile(filePath);
          await ghDeleteFile(filePath, file2.sha, 'Delete ' + filePath + ' via Master AI');
          return message.reply(fmt('🗑️ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle(filePath + ' supprime !')));
        } catch(e) {
          return message.reply(fmt('❌ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle('Erreur suppression : ' + e.message)));
        }
      }

      // ─── INFO ───
      if (sub2 === 'info') {
        try {
          var repoRes = await axios.get(GH_API, { headers: ghHeaders() });
          var r = repoRes.data;
          var res = '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n╭━━ 📊 ' + toStyle('Repo Info') + '\n│\n';
          res += '│ 📌 ' + toStyle(r.full_name) + '\n';
          res += '│ ⭐ ' + r.stargazers_count + ' stars\n';
          res += '│ 🍴 ' + r.forks_count + ' forks\n';
          res += '│ 👁 ' + r.watchers_count + ' watchers\n';
          res += '│ 🌿 Branche : ' + BRANCH + '\n';
          res += '│ 📦 Taille : ' + r.size + ' KB\n';
          res += '╰━━━━━━━ ✨';
          return message.reply(res);
        } catch(e) {
          return message.reply(fmt('❌', toStyle('Erreur infos repo.')));
        }
      }

      // ─── AIDE ───
      return message.reply(
        '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n' +
        '╭━━ 📁 𝑮𝒊𝒕𝑯𝒖𝒃 𝑪𝒐𝒎𝒎𝒂𝒏𝒅𝒔\n│\n' +
        '│ ai gh list [dossier] [page]\n' +
        '│ ai gh read <chemin>\n' +
        '│ ai gh save <fichier.js> | <contenu>\n' +
        '│ ai gh delete <chemin>\n' +
        '│ ai gh info\n' +
        '╰━━━━━━━ ✨'
      );
    }

    // ─── IA PRINCIPALE ───
    var question = input || 'Presente-toi en une phrase en francais.';
    await repondre(api, event, message, question);
  },

  // ─── RÉPONSE AUX MESSAGES ───
  onReply: async function({ api, event, message }) {
    var uid = String(event.senderID);
    var input = event.body ? event.body.trim() : '';
    var replyId = event.messageReply && event.messageReply.messageID;

    if (!replyId) return;

    var session = ghSessions[replyId];
    if (!session) {
      if (botMessages.has(replyId)) {
        await repondre(api, event, message, input);
      }
      return;
    }

    if (session.author !== uid) return;

    // ─── NAVIGATION LISTE ───
    if (session.type === 'list') {
      var num = parseInt(input);
      if (!isNaN(num) && num > 0 && num <= session.items.length) {
        var item = session.items[num - 1];
        if (item.type === 'dir') {
          var folderPath = session.folder ? session.folder + '/' + item.name : item.name;
          return message.reply(fmt('📂 𝑫𝒐𝒔𝒔𝒊𝒆𝒓', toStyle('Tape : ai gh list ' + folderPath)));
        } else {
          var filePath = session.folder ? session.folder + '/' + item.name : item.name;
          try {
            var file = await ghReadFile(filePath);
            var preview = file.content.slice(0, 800);
            var res = '✨ ━━ 『 𝗠𝗔𝗦𝗧𝗘𝗥 𝗔𝗜 』 ━━ ✨\n\n';
            res += '╭━━ 📖 ' + toStyle(filePath) + '\n│\n';
            var lines = preview.split('\n');
            for (var i = 0; i < lines.length && i < 30; i++) res += '│ ' + lines[i] + '\n';
            if (file.content.length > 800) res += '│ ... (' + file.content.length + ' caract.)\n';
            res += '╰━━━━━━━ ✨';
            return message.reply(res);
          } catch(e) {
            return message.reply(fmt('❌', toStyle('Erreur de lecture.')));
          }
        }
      }
    }

    // ─── SAUVEGARDE ───
    if (session.type === 'save') {
      if (!input) return message.reply(fmt('❌', toStyle('Contenu vide.')));
      try {
        var sha = await ghGetSha(session.filePath);
        await ghWriteFile(session.filePath, input, 'Save ' + session.filePath + ' via Master AI', sha);
        delete ghSessions[replyId];
        return message.reply(fmt('✅ 𝑺𝒂𝒖𝒗𝒆𝒈𝒂𝒓𝒅𝒆', toStyle(session.filePath + ' sauvegarde !')));
      } catch(e) {
        return message.reply(fmt('❌ 𝑮𝒊𝒕𝑯𝒖𝒃', toStyle('Erreur : ' + e.message)));
      }
    }

    // Sinon → IA
    await repondre(api, event, message, input);
  }
};
