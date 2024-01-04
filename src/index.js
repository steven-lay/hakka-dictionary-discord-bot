// npx cross-env NODE_EXTRA_CA_CERTS=node_modules/node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem node .
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const { token } = require('./config.json')
const slash = require('./slash.js')
const { getSyndict, getMoedict } = require('./getEntries.js')
var { tify } = require('chinese-conv')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.login(token)

client.commands = new Collection()
client.commands.set(slash.data.name, slash)

// Events 
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return;
  }

  /* Place slash command code here as there is only a single command anyway */
  try {
    const searchTerm = interaction.options.getString('chinese')

    /* Ensure it is a Chinese character */
    if (!searchTerm?.match(/[\u3400-\u9FBF]/)) {
      await interaction.reply('Please input Chinese characters only')
      return
    }

    /* Stall for time as the result fetching may take awhile */
    await interaction.deferReply({ ephemeral: true })

    /*
      TODO

      Issue:
      Due to embed string length limit (1024 characters), need to paginate results in certain cases.

      Action:
      - syndictResults and moeDictResults to be changed to string arrays of results
      - Use reaction collector to paginate and navigate between array values
      - Show react to toggle between syndict and moedict results, reset array index to 0 if toggled
      - Do not paginate when both of the arrays length <= 1 (single or no result case)
    */

    const syndictResults = await getSyndict(searchTerm)
    /* Moedict only accepts Traditional characters so convert it if necessary */
    const moedictResults = await getMoedict(tify(searchTerm))

    /* Do something else if 1024 character limit for discord embeds is exceeded */
    if ((syndictResults?.length + moedictResults?.length) > 1000) {
      await interaction.editReply("Too many results returned, cannot display. Will fix this when I can. -Loger")
      return
    }

    /* Build embed to display */
    const replyEmbed = new EmbedBuilder()
      .setTitle(`Results for search term ${searchTerm}`)
      .setColor(0x0099FF)
      .addFields(
        { name: 'Syndict', value: syndictResults ? syndictResults : "No results", inline: true },
        { name: 'Moedict', value: moedictResults ? moedictResults : "No results", inline: true },
      )

    await interaction.editReply({ embeds: [replyEmbed] })
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
  }
})
