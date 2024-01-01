const { REST, Routes } = require('discord.js')
const { clientId, guildId, token } = require('./config.json')

const commands = [];
// only a single command for now
const slash = require('./slash.js')
commands.push(slash.data.toJSON())

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)

  // and deploy your commands!
  (async () => {
    try {
      console.log(`Started refreshing ${commands.length} application (/) commands.`)

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );

      console.log(`Successfully reloaded ${data.length} application (/) commands.`)
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
