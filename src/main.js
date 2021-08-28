// Require the necessary discord.js classes
const { Client, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');

const syn = require('./syndict.js');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });

const prefix = '?syn';

client.once('ready', () => {
    console.log(client.user.username, 'is ready!');
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const arg = message.content.slice(prefix.length + 1);

    if (arg.length > 1 || !arg.match(/[\u3400-\u9FBF]/)) {
        message.channel.send("Please input a single Chinese character.");
        return;
    }

    await syn(arg).then(result => {
        const embed = new MessageEmbed()
            .setColor('#6b9ff2')
            .setTitle('Showing results for ' + arg)    
            .setDescription(result)

        message.channel.send({embeds: [embed]})
    }); 
});

client.login(token);