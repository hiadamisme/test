const client = require('../bleed')
const db = require("quick.db");
const { default_prefix, color } = require("../config.json");
const Discord = require('discord.js');

client.on("messageCreate", async message => {
  if (message.partial) return
  if (message.author.bot) return;
  if (!message.guild) return;
  if (db.has(`afk-${message.author.id}+${message.guild.id}`)) {
    const info = db.get(`afk-${message.author.id}+${message.guild.id}`)
    await db.delete(`afk-${message.author.id}+${message.guild.id}`)
    message.channel.send({ embed: { color: "#6495ED", description: `:wave: ${message.author}: Welcome back, you're no longer **AFK**` } });
  }

  const mentionedMember = message.mentions.members.first();
  if (mentionedMember) {
    if (db.has(`afk-${mentionedMember.id}+${message.guild.id}`)) {
      const embed = new Discord.MessageEmbed()
        .setColor("#6495ED")
        .setDescription(`:zzz: ${mentionedMember} is AFK: ` + db.get(`afk-${mentionedMember.id}+${message.guild.id}`))
      message.channel.send(embed)
    } else return;
  }
})

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  let prefix2 = db.get(`prefix_${message.guild.id}`)

  const args1 = message.content.trim().split(/ +/g);
  if (prefix2 === null) { prefix2 = default_prefix; }
  if (args1.length === 1 && message.mentions.users.has(client.user.id)) {

    const prefixEmbed = new Discord.MessageEmbed()
      .setDescription(`${message.author}: Guild prefix: \`${prefix2}\``)
      .setColor(`#6495ED`)
    message.channel.send(prefixEmbed);
  }

  let prefix = db.get(`prefix_${message.guild.id}`);
  if (prefix === null) prefix = default_prefix;

  if (!message.content.startsWith(prefix)) return;


  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  let cmdx = db.get(`cmd_${message.guild.id}`)

  if (cmdx) {
    let cmdy = cmdx.find(x => x.name === cmd)
    if (cmdy) message.channel.send(cmdy.responce)
  }

  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));


  if (command) command.run(client, message, args);

  // return addexp(message);

})

client.on('messageCreate', message => {
  if (message.author.bot) return;
  if (message.content === 'bleed') {
    message.channel.send('what')
  }
});
