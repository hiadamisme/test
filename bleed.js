const { token } = require("./config.json");
const Discord = require("discord.js");
require("@haileybot/sanitize-role-mentions")();

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildModeration,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.MessageContent
  ],
  partials: [
    Discord.Partials.Message,
    Discord.Partials.Channel,
    Discord.Partials.Reaction,
    Discord.Partials.GuildMember,
    Discord.Partials.User
  ],
  allowedMentions: { parse: ["users", "roles"] }
});

const toPermissionFlag = (permission) => {
  if (typeof permission !== "string") return permission;
  const normalized = permission.toUpperCase().replace(/\s+/g, "_");
  const pascal = normalized
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  if (Discord.PermissionFlagsBits[pascal]) {
    return Discord.PermissionFlagsBits[pascal];
  }
  console.warn(`Unknown permission flag requested: ${permission}`);
  return permission;
};

if (!Discord.MessageEmbed && Discord.EmbedBuilder) {
  Discord.MessageEmbed = Discord.EmbedBuilder;
}
if (!Discord.MessageAttachment && Discord.AttachmentBuilder) {
  Discord.MessageAttachment = Discord.AttachmentBuilder;
}

if (Discord.GuildMember?.prototype?.hasPermission == null) {
  Discord.GuildMember.prototype.hasPermission = function hasPermission(permission) {
    return this.permissions.has(toPermissionFlag(permission));
  };
}

if (Discord.Guild?.prototype && !Object.getOwnPropertyDescriptor(Discord.Guild.prototype, "me")) {
  Object.defineProperty(Discord.Guild.prototype, "me", {
    get() {
      return this.members?.me || null;
    }
  });
}

const normalizeEmbed = (embed) => {
  if (!embed) return embed;
  if (embed instanceof Discord.EmbedBuilder) return embed;
  return new Discord.EmbedBuilder(embed);
};

const patchSend = (prototype) => {
  if (!prototype || prototype.__legacySendPatched) return;
  const originalSend = prototype.send;
  if (typeof originalSend !== "function") return;

  prototype.send = function patchedSend(payload, ...rest) {
    if (payload instanceof Discord.EmbedBuilder) {
      return originalSend.call(this, { embeds: [payload] }, ...rest);
    }

    if (payload && typeof payload === "object" && !Array.isArray(payload) && payload.embed) {
      const nextPayload = { ...payload, embeds: [normalizeEmbed(payload.embed)] };
      delete nextPayload.embed;
      return originalSend.call(this, nextPayload, ...rest);
    }

    return originalSend.call(this, payload, ...rest);
  };

  prototype.startTyping = prototype.startTyping || function startTyping() {
    if (typeof this.sendTyping === "function") {
      return this.sendTyping().catch(() => {});
    }
    return Promise.resolve();
  };
  prototype.stopTyping = prototype.stopTyping || (() => {});
  prototype.__legacySendPatched = true;
};

patchSend(Discord.BaseGuildTextChannel?.prototype);
patchSend(Discord.DMChannel?.prototype);
patchSend(Discord.ThreadChannel?.prototype);

const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URI;
if (mongoURL) {
  mongoose.connect(mongoURL)
    .then(() => console.log("connected to mongoose"))
    .catch((error) => console.error("mongoose connection failed:", error.message));
} else {
  console.warn("mongoose connection skipped: no MONGO_URI configured");
}

const jointocreate = require("./jointocreate");
jointocreate(client);

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.db = require("quick.db");

module.exports = client;

["command", "event"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

client.login(token);
