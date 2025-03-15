const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../', '../', './configs', 'badges.json');
const badgesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const badges = Object.values(badgesData);
const itemsPerPage = 3;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('badges')
    .setDescription('View your unlocked badges')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('The user to show badges')
        .setRequired(false)
    ),
    async execute (interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const userData1 = await publicAccount.findOne({ DiscordID: user.id });
        
        let page = 0;
        const pages = Math.ceil(badges.length / itemsPerPage);

        const generateEmbed = (pageIndex, userData) => {
            const start = pageIndex * itemsPerPage;
            const end = start + itemsPerPage;
            const currentBadges = badges.slice(start, end);

            const unlockedBadges = userData ? userData.Badges : [];
            const unlockedCount = unlockedBadges.length;
            const totalCount = badges.length;

            const description = currentBadges.map(badge => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return isUnlocked 
                    ? `${badge.icon} **${badge.name}**\n> \`${badge.description || 'No description set'}\`` 
                    : `||${badge.icon} **${badge.name}**\nㅤ\`${badge.description || 'No description set'}\`||`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setColor(Colors.Blurple)
                .setDescription(description);

            return { embed, unlockedCount, totalCount };
        };

        const prevButton = new ButtonBuilder()
            .setCustomId('badges-prev')
            .setEmoji('<:backward:1141603760574046228>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0);

        const nextButton = new ButtonBuilder()
            .setCustomId('badges-next')
            .setEmoji('<:forward:1141603712809316392>')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === pages - 1);

        const countButton = new ButtonBuilder()
            .setCustomId('badges-count')
            .setLabel(`ㅤ${generateEmbed(page, userData1).unlockedCount} / ${generateEmbed(page, userData1).totalCount}ㅤ`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(prevButton, countButton, nextButton);

        const reply = await interaction.reply({
            embeds: [generateEmbed(page, userData1).embed],
            components: [row],
            ephemeral: true
        });

        const collector = reply.createMessageComponentCollector({ time: 600000 });

        collector.on('collect', async (btnInteraction) => {
            const userData = await publicAccount.findOne({ DiscordID: user.id });

            if (btnInteraction.customId === 'badges-prev' && page > 0) page--;
            if (btnInteraction.customId === 'badges-next' && page < pages - 1) page++;

            prevButton.setDisabled(page === 0);
            nextButton.setDisabled(page === pages - 1);
            countButton.setLabel(`ㅤ${generateEmbed(page, userData).unlockedCount} / ${generateEmbed(page, userData).totalCount}ㅤ`);

            await btnInteraction.update({ 
                embeds: [generateEmbed(page, userData).embed], 
                components: [row] 
            });
        });

        collector.on('end', () => {
            reply.edit({ components: [] }).catch(() => {});
        });
    }
}
