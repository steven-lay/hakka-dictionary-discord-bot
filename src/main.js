// Require the necessary discord.js classes
import { Client } from 'discord.js';
import { getSyndictResults } from './syndict.js';
import { embedBuild } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
	intents: [
		'GUILDS',
		'GUILD_MESSAGES',
		'DIRECT_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGE_REACTIONS',
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.once('ready', () => {
	console.log(`${client.user.username} is ready!`);
	// client.api.applications(client.user.id).commands('881437432308989952').delete();
	// (async () => { console.log(await client.api.applications(client.user.id).commands.get());})();
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName !== 'syn') {
		return;
	}

	const arg = interaction.options.getString('character');

	if (!arg.match(/[\u3400-\u9FBF]/)) {
		await interaction.reply('Please input Chinese characters');
		return;
	}

	/* Get around the timeout issue */
	await interaction.deferReply();

	const results = await getSyndictResults(arg);

	if (!results || !results.length) {
		await interaction.editReply(`No results found for ${arg}`);
		return;
	}

	const numResults = results.length;

	let resultNum = 0;

	await interaction.editReply(
		{
			embeds: [
				embedBuild(arg, resultNum, numResults, results[resultNum]),
			],
		},
		{ fetchReply: true }
	);
	const message = await interaction.fetchReply();

	if (numResults > 1) message.react('🔄');

	const filter = (reaction, user) => {
		return (
			['🔄'].includes(reaction.emoji.name) &&
			user.id === interaction.user.id
		);
	};

	const collector = message.createReactionCollector({
		filter,
		time: 60000,
		dispose: true,
	});

	async function handleEmoteAddRemove() {
		resultNum = ++resultNum % numResults;
		await interaction.editReply(
			{
				embeds: [
					embedBuild(arg, resultNum, numResults, results[resultNum]),
				],
			},
			{ fetchReply: true }
		);
	}

	collector.on('collect', handleEmoteAddRemove);
	collector.on('remove', handleEmoteAddRemove);
});

client.login(process.env.token);
