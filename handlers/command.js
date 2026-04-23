const { readdirSync, statSync } = require("fs");
const path = require("path");

module.exports = (client) => {
  const root = path.resolve(__dirname, "..");
  const excludedDirs = new Set([
    ".git",
    "events",
    "handlers",
    "node_modules"
  ]);

  const commandDirs = readdirSync(root).filter((entry) => {
    const fullPath = path.join(root, entry);
    return statSync(fullPath).isDirectory() && !excludedDirs.has(entry);
  });

  for (const dir of commandDirs) {
    const files = readdirSync(path.join(root, dir)).filter(file => file.endsWith(".js"));

    for (const file of files) {
      const commandPath = path.join(root, dir, file);
      const command = require(commandPath);

      if (!command || typeof command.name !== "string" || typeof command.run !== "function") {
        console.warn(`Skipping invalid command module: ${dir}/${file}`);
        continue;
      }

      command.name = command.name.toLowerCase();
      client.commands.set(command.name, command);

      if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.aliases.set(String(alias).toLowerCase(), command.name);
        }
      }
    }
  }
};
