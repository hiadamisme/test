const { readdirSync } = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsDir = path.resolve(__dirname, "..", "events");
  const eventFiles = readdirSync(eventsDir).filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    require(path.join(eventsDir, file));
  }
};
