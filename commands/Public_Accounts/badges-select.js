const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../', '../', './configs', 'badges.json');
const badgesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const badges = badgesData;
const itemsPerPage = 3;

function getBadgeChoices() {
    const badgesPath = path.join(__dirname, '..', '..', 'configs', 'badges.json');
    const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
    return Object.entries(badges).map(([badge, data]) => ({ name: data.name, value: badge }));
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('badges-select')
    .setDescription('Select the badges to show on your profile')
    .addStringOption(option => 
        option.setName('first-badge')
        .setDescription('The first badge you want to select')
        .setRequired(false)
        .addChoices(...getBadgeChoices())
    )
    .addStringOption(option =>
        option.setName('second-badge')
        .setDescription('The second badge to selct')
        .setRequired(false)
        .addChoices(...getBadgeChoices())
    ),
    async execute(interaction, client) {
        const firstBadge = interaction.options.getString('first-badge') || '';
        const secondBadge = interaction.options.getString('second-badge') || '';

        const account = await publicAccount.findOne({ DiscordID: interaction.user.id });

        if (!account) {
            return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** You don\'t have an Account', ephemeral: true });
        }

        if (firstBadge !== '' && secondBadge !== '') {
            if (!badges[firstBadge] || !badges[secondBadge]) {
                return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** This badge is invalid', ephemeral: true });
            }
        } else if (firstBadge !== '' && secondBadge === '') {
            if (!badges[firstBadge]) {
                return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** This badge is invalid', ephemeral: true });
            }
        } else if (firstBadge === '' && secondBadge !== '') {
            if (!badges[secondBadge]) {
                return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** This badge is invalid', ephemeral: true });
            }
        }

        if (firstBadge !== '' && secondBadge !== '' && firstBadge === secondBadge) {
            return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** You can\'t select the same badge twice', ephemeral: true });
        }

        if (firstBadge !== '' && secondBadge !== '') {
            if (!account.Badges.includes(firstBadge) || !account.Badges.includes(secondBadge)) {
                return await interaction.reply({ content: '<:cross:1143156155586199602> **Oh no!** You don\'t have the badges you selected', ephemeral: true });
            }
        }

        if (firstBadge !== '') {
            account.FirstSelectedBadge = firstBadge;
        } else {
            account.FirstSelectedBadge = '';
        }

        if (secondBadge !== '') {
            account.SecondSelectedBadge = secondBadge;
        } else {
            account.SecondSelectedBadge = '';
        }

        await account.save();

        if (secondBadge !== '' && firstBadge !== '') {
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have selected the badges ${badges[firstBadge].icon} and ${badges[secondBadge].icon}!`, ephemeral: true });
        } else if (firstBadge !== '' && secondBadge === '') {
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have selected the badge ${badges[firstBadge].icon}!`, ephemeral: true });
        } else if (secondBadge !== '' && firstBadge === '') {
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have selected the badge ${badges[secondBadge].icon}!`, ephemeral: true });
        } else if (firstBadge === '' && secondBadge === '') {
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have removed your badges!`, ephemeral: true });
        }
    }
}