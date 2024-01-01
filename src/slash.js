const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hak')
    .setDescription('Search Chinese word')
    .addStringOption(option =>
      option.setName('chinese')
        .setDescription('Enter Chinese word')
        .setRequired(true)
    )
};