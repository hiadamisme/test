const Discord = require("discord.js");
const db = require("quick.db");
const { default_prefix, color } = require("../../config.json");

module.exports = {
  name: "help",
  aliases: ["commands"],

  run: async (client, message, args) => {
    let prefix = db.get(`prefix_${message.guild.id}`);
    if (prefix === null) prefix = default_prefix;

    const categories = {};
    for (const command of client.commands.values()) {
      const category = command.category || "Other";
      if (!categories[category]) categories[category] = new Set();
      categories[category].add(command.name);
    }

    const embed = new Discord.MessageEmbed()
      .setColor(color)
      .setAuthor({ name: `${client.user.username} help`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Prefix for this server: \`${prefix}\``)
      .setFooter({ text: `Total commands: ${client.commands.size}` })
      .setTimestamp();

    const sortedCategories = Object.keys(categories).sort((a, b) => a.localeCompare(b));
    for (const category of sortedCategories) {
      const names = [...categories[category]].sort((a, b) => a.localeCompare(b));
      const entries = names.map(name => `\`${name}\``);
      const limited = [];
      let totalLength = 0;
      for (const entry of entries) {
        const addition = limited.length === 0 ? entry.length : entry.length + 2;
        if (totalLength + addition > 1024) break;
        limited.push(entry);
        totalLength += addition;
      }
      embed.addFields({
        name: category,
        value: limited.join(", ") || "N/A"
      });
    }

    return message.channel.send({ embeds: [embed] });
  }
};
