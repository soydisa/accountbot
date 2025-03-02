const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js')
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription("Get the reload link for your Account"),
    async execute(interaction, client) {
        await interaction.reply({ content: '<:verified_2:1140890170661548073> **Oh yes!** Use _[this link](https://repeated-windy-garden.glitch.me/link)_ to reload your Account', ephemeral: true })
    }
}