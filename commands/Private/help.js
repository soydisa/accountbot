const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
require('dotenv').config();
module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription("View the command list"),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        Lista = [];
        const commands = await client.application.commands.fetch();
        commands.forEach(cmd => {
            Lista.push(`/${cmd.name}: ${cmd.description}`)
        });

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("<:question_point:1140524059017363586> Commands help")
            .setDescription(Lista.join("\n"))

        await interaction.editReply({ embeds: [embed], ephemeral: true })
    }
}