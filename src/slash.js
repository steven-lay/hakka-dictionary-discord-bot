const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder()
	.setName('syn')
	.setDescription('Returns results from Syndict Hakka Dictionary')
	.addStringOption(option =>
		option.setName('character')
			.setDescription('The Chinese character to search')
			.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();