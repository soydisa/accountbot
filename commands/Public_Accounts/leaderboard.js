const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription("View the leaderboard"),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const leaderboardDataMore = await publicAccount.find({}).sort({ Likes: -1 }).limit(20);
        const leaderboardDataLess = await publicAccount.find({}).sort({ Likes: 1 }).limit(20);

        const embedMore = createEmbed('<:thumbs_up:1140523687456542840> Leaderboard', leaderboardDataMore);
        const embedLess = createEmbed('<:thumbs_down:1140523745451200583> Leaderboard', leaderboardDataLess);

        const selectRow = createSelectMenu();

        const msg = await interaction.editReply({ embeds: [embedMore], components: [selectRow] });

        const collector = msg.createMessageComponentCollector({ time: 180000, filter: i => i.user.id === interaction.user.id });

        collector.on('collect', async i => {
            const value = i.values[0];
            if (value === 'more-likes') {
                await interaction.editReply({ embeds: [embedMore], components: [selectRow], ephemeral: true });
            } else if (value === 'less-likes') {
                await interaction.editReply({ embeds: [embedLess], components: [selectRow], ephemeral: true });
            }
            await i.deferUpdate();
        });
    }
};

function createEmbed(title, data) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("Blurple");

    data.forEach((item, index) => {
        embed.addFields({ name: `#${index + 1} ${item.Username}`, value: `\`\`\`Likes: ${item.Likes}\`\`\`` });
    });

    return embed;
}

function createSelectMenu() {
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

    return new ActionRowBuilder().addComponents(select);
}