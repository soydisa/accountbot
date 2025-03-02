const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js')
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("View the leaderboard"),
    async execute(interaction, client) {

        const leaderboardDataMore = await publicAccount.find({}).sort({ Likes: -1 }).limit(25);
        const leaderboardDataLess = await publicAccount.find({}).sort({ Likes: 1 }).limit(25);

        const embedMore = new EmbedBuilder()
        .setTitle('<:thumbs_up:1140523687456542840> Leaderboard')
        .setColor("Blurple");

        leaderboardDataMore.forEach((data, index) => {
            embedMore.addFields({ name: `#${index + 1} ${data.Username}`, value: `\`\`\`Likes: ${data.Likes}\`\`\`` });
        });

        const embedLess = new EmbedBuilder()
        .setTitle('<:thumbs_down:1140523745451200583> Leaderboard')
        .setColor("Blurple");

        leaderboardDataLess.forEach((data, index) => {
            embedLess.addFields({ name: `#${index + 1} ${data.Username}`, value: `\`\`\`Likes: ${data.Likes}\`\`\`` });
        });

        const select = new StringSelectMenuBuilder()
        .setCustomId('leaderboard_stringselect')
        .setPlaceholder('Select the Type')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('More Likes')
                .setValue('more-likes')
                .setEmoji('<:thumbs_up:1140523687456542840>'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Less Likes')
                .setValue('less-likes')
                .setEmoji('<:thumbs_down:1140523745451200583>'),
        );

        const selectRow = new ActionRowBuilder()
        .addComponents(select)

        const msg = await interaction.reply({ embeds: [embedMore], components: [selectRow], ephemeral: true })

        const collector = msg.createMessageComponentCollector({ time: 180000, filter: i => i.user.id === interaction.user.id })

        collector.on('collect', async i => {
            const value = i.values[0];

            if (value === 'more-likes') {
                await interaction.editReply({ embeds: [embedMore], components: [selectRow], ephemeral: true });
                await i.deferReply({ ephemeral: true });
            } else if (value === 'less-likes') {
                await interaction.editReply({ embeds: [embedLess], components: [selectRow], ephemeral: true });
                await i.deferReply({ ephemeral: true });
            }
        })
    }
}