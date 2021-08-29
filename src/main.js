// Require the necessary discord.js classes
const { Client, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');

const syn = require('./syndict.js');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });

client.once('ready', () => {
    console.log(client.user.username, 'is ready!');
    // client.api.applications(client.user.id).commands('881437432308989952').delete(); 
    // (async () => { console.log(await client.api.applications(client.user.id).commands.get());})();
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

    if (interaction.commandName === 'syn') {
        const arg = interaction.options.getString('character');
    
        if (arg.length > 1 || !arg.match(/[\u3400-\u9FBF]/)) {
            await interaction.reply("Please input a single Chinese character.");
            return;
        }

        await syn(arg).then(result => {
            const resultStr = result[0];
            const numPron = result[1]; /* no. of pronunciations */
            const embed = new MessageEmbed()
                .setColor('#6b9ff2')
                .setTitle('Showing results for ' + arg)    
                .setDescription(resultStr)
    
            interaction.reply({embeds: [embed]});
        }); 
	}
});

client.login(token);