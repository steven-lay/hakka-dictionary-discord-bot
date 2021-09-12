import { MessageEmbed } from 'discord.js';

export function embedBuild(arg, resultNum, numResults, result) {
	const embed = new MessageEmbed()
		.setColor('#6b9ff2')
		.setTitle(`Showing results for ${arg}`)
		.setDescription(result)
		.setFooter(`Pronunciation ${resultNum + 1} of ${numResults}`);

	return embed;
}
