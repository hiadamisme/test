const Discord = require("discord.js");
const db = require("quick.db");
const { default_prefix, color } = require("../../config.json");

module.exports = {
  name: "help",
  aliases: ["commands"],

  run: async (client, message) => {
    let prefix = db.get(`prefix_${message.guild.id}`);
    if (prefix === null) prefix = default_prefix;

    const categories = {};
    for (const command of client.commands.values()) {
      const category = command.category || "other";
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
      embed.addFields({
        name: category,
        value: names.map(name => `\`${name}\``).join(", ").slice(0, 1024) || "N/A"
      });
    }

    return message.channel.send(embed);
  }
};
