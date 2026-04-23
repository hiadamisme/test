const client = require('../bleed')
const { ActivityType } = require("discord.js");

client.on("ready", () => {
  console.log(`${client.user.username} is now up and running!`);
  client.user.setActivity(`discord.gg/four`, {
    type: ActivityType.Playing,
    url: "https://www.twitch.tv/discord"
  })
})
