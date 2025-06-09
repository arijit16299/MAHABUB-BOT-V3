const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.2",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Fancy command list and help menu",
    },
    longDescription: {
      en: "Displays the command list with a stylish look and shows command usage.",
    },
    category: "info",
    guide: {
      en: "{pn} or {pn} commandName",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);

    // Send wait message
    const waitingMsg = await message.reply("⏳ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ᴀ ғᴇᴡ sᴇᴄᴏɴᴅs...");

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔═━━━━✪〘 𝙈𝘼𝙃𝘼𝘽𝙐𝘽-𝘽𝙊𝙏 𝘾𝙈𝘿𝙎 〙✪━━━━═╗\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category of Object.keys(categories)) {
        msg += `\n╭───▣【 𝙲𝘼𝚃𝙴𝙶𝙾𝚁𝚈: 𝙁𝙖𝙣𝙘𝙮 ${category.toUpperCase()} 】▣───╮\n`;
        const cmds = categories[category].sort();
        for (let i = 0; i < cmds.length; i += 3) {
          const line = cmds.slice(i, i + 3).map(cmd => `★${cmd}`).join("    ");
          msg += `│ ${line}\n`;
        }
        msg += `╰────────────────────────────╯\n`;
      }

      msg += `\n➤ 𝙏𝙊𝙏𝘼𝙇 𝘾𝙈𝘿𝙎: ${commands.size}`;
      msg += `\n➤ 𝙐𝙎𝘼𝙂𝙀: ${prefix}help [command name]`;
      msg += `\n➤ 𝘽𝙊𝙏 𝙊𝙒𝙉𝙀𝙍: 𝙈𝘼𝙃𝘼𝘽𝙐𝘽 𝙍𝘼𝙃𝙈𝘼𝙉`;
      msg += `\n➤ 𝙐𝙋𝘿𝘼𝙏𝙀𝙎 𝙀𝙑𝙀𝙍𝙔 𝙒𝙀𝙀𝙆\n`;
      msg += `╚═━「 𝘽𝙊𝙏 𝘽𝙔 𝙈𝙍.𝙈𝘼𝙃𝘼𝘽𝙐𝘽 」━═╝`;

      let attachment = null;
      try {
        const res = await axios.get("https://mahabub-apis.vercel.app/help");
        attachment = await global.utils.getStreamFromURL(res.data.data);
      } catch (err) {
        console.error("Video not loaded:", err.message);
      }

      await message.reply({ body: msg, attachment });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) return message.reply(`⚠️ Command "${commandName}" not found.`);

      const config = command.config;
      const usage = config.guide?.en
        ?.replace(/{p}/g, prefix)
        ?.replace(/{n}/g, config.name)
        ?.replace(/{pn}/g, prefix + config.name) || "No usage guide available.";

      const aliasesList = config.aliases?.join(", ") || "None";
      const roleText = roleTextToString(config.role);
      const description = config.longDescription?.en || "No description.";

      const msg = `╭───✦ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 ✦───╮
│ ✧ 𝙉𝘼𝙈𝙀: ${config.name}
│ ✧ 𝘿𝙀𝙎𝘾: ${description}
│ ✧ 𝘼𝙇𝙄𝘼𝙎𝙀𝙎: ${aliasesList}
│ ✧ 𝙑𝙀𝙍𝙎𝙄𝙊𝙉: ${config.version || "1.0"}
│ ✧ 𝙍𝙊𝙇𝙀: ${roleText}
│ ✧ 𝘾𝙊𝙊𝙇𝘿𝙊𝙒𝙉: ${config.countDown || 1}s
│ ✧ 𝘼𝙐𝙏𝙃𝙊𝙍: ${config.author || "Unknown"}
│ ✧ 𝙐𝙎𝘼𝙂𝙀: ${usage}
╰────────────────────────╯`;

      await message.reply(msg);
    }

    // Optionally delete wait message if you want:
    // global.api.unsendMessage(waitingMsg.messageID);
  },
};

function roleTextToString(roleLevel) {
  switch (roleLevel) {
    case 0: return "All users";
    case 1: return "Group admins";
    case 2: return "Bot admins";
    default: return "Unknown";
  }
}
