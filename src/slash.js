const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSyndict, getMoedict } = require('./getEntries.js')
var { tify } = require('chinese-conv')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hak')
    .setDescription('Search Chinese word')
    .addStringOption(option =>
      option.setName('chinese')
        .setDescription('Enter Chinese word')
        .setRequired(true)
    ),
  async execute(interaction) {
    const searchTerm = interaction.options.getString('chinese')

    /* Ensure it is a Chinese character */
    if (!searchTerm?.match(/[\u3400-\u9FBF]/)) {
      await interaction.reply('Please input Chinese characters only')
      return
    }

    /* Stall for time as the result fetching may take awhile */
    await interaction.deferReply({ ephemeral: true })

    const syndictResults = await getSyndict(searchTerm)
    /* Moedict only accepts Traditional characters so convert it if necessary */
    const moedictResults = await getMoedict(tify(searchTerm))

    /* Do something else if 1024 character limit for discord embeds is exceeded */
    if ((syndictResults.length + moedictResults.length) > 1000) {
      await interaction.editReply("Too many results returned, cannot display. Will fix this when I can. -Loger")
      return
    }

    /* Build embed to display */
    const replyEmbed = new EmbedBuilder()
      .setTitle(`Results for search term ${searchTerm}`)
      .setColor(0x0099FF)
      .addFields(
        { name: 'Syndict', value: syndictResults, inline: true },
        { name: 'Moedict', value: moedictResults, inline: true },
      )

    await interaction.editReply({ embeds: [replyEmbed] })
  },
};