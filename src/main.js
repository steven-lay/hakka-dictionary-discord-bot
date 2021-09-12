// Require the necessary discord.js classes
import { Client, MessageEmbed } from 'discord.js';
import syn from './syndict.js';
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

function embedBuild(arg, resultNum, numResults, result) {
	const embed = new MessageEmbed()
		.setColor('#6b9ff2')
		.setTitle(`Showing results for ${arg}`)
		.setDescription(result)
		.setFooter(`Pronunciation ${resultNum + 1} of ${numResults}`);

	return embed;
}

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'syn') {
		const arg = interaction.options.getString('character');

		if (arg.length > 1 || !arg.match(/[\u3400-\u9FBF]/)) {
			await interaction.reply('Please input a single Chinese character.');
			return;
		}

		const results = await syn(arg);
		const numResults = results.length;
		let resultNum = 0;

		await interaction.reply(
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
		});

		collector.on('collect', async () => {
			resultNum = resultNum < numResults ? ++resultNum : 0;
			await interaction.editReply(
				{
					embeds: [
						embedBuild(
							arg,
							resultNum,
							numResults,
							results[resultNum]
						),
					],
				},
				{ fetchReply: true }
			);
		});

		collector.on('end', async () => {
			message.reactions.removeAll();
		});
	}
});

client.login(process.env.token);
