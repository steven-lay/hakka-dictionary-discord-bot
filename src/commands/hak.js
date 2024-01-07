const {
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js")
const { getSyndictResults, getMoedictResults } = require("../functions/getEntries.js")
var { tify } = require("chinese-conv")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hak")
    .setDescription("Search Chinese word")
    .addStringOption((option) =>
      option.setName("chinese").setDescription("Enter Chinese word").setRequired(true),
    ),
  async execute(interaction) {
    const searchTerm = interaction.options.getString("chinese")

    /* Check if input arg is not a Chinese character */
    if (!searchTerm.match(/[\u3400-\u9FBF]/)) {
      await interaction.reply("Please input Chinese characters only.")
      return
    }

    /* Gonna take awhile to fetch results */
    const message = await interaction.deferReply()

    let results = await Promise.all([
      getSyndictResults(searchTerm),
      getMoedictResults(tify(searchTerm)),
    ])

    const nextPageBtn = new ButtonBuilder()
      .setCustomId("nextPageBtn")
      .setLabel("Change page")
      .setStyle(ButtonStyle.Secondary)

    const changeDictionaryBtn = new ButtonBuilder()
      .setCustomId("changeDictionaryBtn")
      .setLabel("Swap dictionary")
      .setStyle(ButtonStyle.Secondary)

    const buttonRow = new ActionRowBuilder().addComponents(changeDictionaryBtn)

    let currentPage = 0
    let currentDictionaryIndex = 0

    /* 
        Layout example:
          Syndic [0][0]    [0][1]
          Moedic [1][0]    [1][1]
      */

    const embedResponse = new EmbedBuilder()
      .setAuthor({ name: `Showing results for: ${searchTerm}` })
      .setTitle(`${currentDictionaryIndex == 0 ? "Syndict" : "Moedict"}`)
      .setDescription(results[currentDictionaryIndex][currentPage])
      .setFooter({
        text: `Page ${currentPage + 1} of ${results[currentDictionaryIndex].length}`,
      })

    if (results[currentDictionaryIndex].length > 1) {
      buttonRow.addComponents(nextPageBtn)
    }

    await interaction.editReply({
      embeds: [embedResponse],
      components: [buttonRow],
    })

    /* Handle collector */
    const collector = await message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
    })

    collector.on("collect", async (int) => {
      await int.deferUpdate()

      switch (int.customId) {
        case "nextPageBtn":
          currentPage = (currentPage + 1) % results[currentDictionaryIndex].length
          break
        case "changeDictionaryBtn":
          currentPage = 0
          currentDictionaryIndex = (currentDictionaryIndex + 1) % 2
          embedResponse.setTitle(`${currentDictionaryIndex == 0 ? "Syndict" : "Moedict"}`)
          break
        default:
          return
      }

      buttonRow.setComponents(changeDictionaryBtn)
      if (results[currentDictionaryIndex].length > 1) {
        buttonRow.addComponents(nextPageBtn)
      }

      embedResponse.setDescription(results[currentDictionaryIndex][currentPage])
      embedResponse.setFooter({
        text: `Page ${currentPage + 1} of ${results[currentDictionaryIndex].length}`,
      })

      collector.resetTimer()

      await interaction.editReply({
        embeds: [embedResponse],
        components: [buttonRow],
      })
    })

    /* Remove buttons on timeout */
    collector.on("end", async () => {
      await interaction.editReply({ embeds: [embedResponse], components: [] })
    })
  },
}
