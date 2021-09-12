import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.clientId;
const token = process.env.token;

const commands = [
	new SlashCommandBuilder()
		.setName('syn')
		.setDescription('Returns results from Syndict Hakka Dictionary')
		.addStringOption((option) =>
			option
				.setName('character')
				.setDescription('The Chinese character to search')
				.setRequired(true)
		),
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		});

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();
