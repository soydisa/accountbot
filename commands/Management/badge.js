const { SlashCommandBuilder, Colors, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');
const managersMem = require('../../schemas/managerMembers');
const fs = require('fs');
const path = require('path');

function getBadgeEmoji(badgeName) {
    const badgesPath = path.join(__dirname, '..', '..', 'configs', 'badges.json');
    const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
    return badges[badgeName]?.icon || null;
}

function getBadgeChoices() {
    const badgesPath = path.join(__dirname, '..', '..', 'configs', 'badges.json');
    const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
    return Object.entries(badges).map(([badge, data]) => ({ name: data.name, value: badge }));
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription("Manage the badges of an user")
    .addSubcommand(command => 
        command.setName('add')
        .setDescription("Add a badge to an user")
        .addUserOption(option => option
            .setName("user")
            .setDescription("The user to assign the badge to")
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("badge")
            .setDescription("The badge to assign")
            .setRequired(true)
            .addChoices(...getBadgeChoices())
        )
    )
    .addSubcommand(command => 
        command.setName('remove')
        .setDescription("Remove a badge from an user")
        .addUserOption(option => 
            option.setName('user')
            .setDescription("The user to remove the badge from")
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('badge')
            .setDescription("The badge to remove")
            .setRequired(true)
            .addChoices(...getBadgeChoices())
        )
    )
    .addSubcommand(command =>
        command.setName('list')
        .setDescription("View the badge list of an user")
        .addUserOption(option => 
            option.setName('user')
            .setDescription("The user to view the badge list of")
            .setRequired(true)
        )
    ),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const useroption = interaction.options.getUser('user');
        const sub = interaction.options.getSubcommand();
        const managerMembers = await managersMem.findOne({ ID: 1 });
        if (!managerMembers.Staff.includes(interaction.user.id)) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You are not permitted to do this!`, ephemeral: true })
        const user = await publicAccount.findOne({ DiscordID: useroption.id })
        if (!user) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** The selected user doesn't have an Account!`, ephemeral: true })

        
        switch(sub) {
            case "add": {
                const badge = interaction.options.getString('badge');
                if (!user.Badges.includes(badge)) {
                    user.Badges.push(badge);
                    await user.save();
                    await interaction.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Badge ${getBadgeEmoji(badge)} added to ${user.Username}.` });
                } else {
                    await interaction.editReply({ content: `<:cross:1143156155586199602> **Oh no!** User already has the badge ${getBadgeEmoji(badge)}.` });
                }
            }
            break;
            
            case "remove": {
                const badge = interaction.options.getString('badge');
                if (user.Badges.includes(badge)) {
                    user.Badges = user.Badges.filter(b => b !== badge);
                    await user.save();
                    await interaction.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Badge ${getBadgeEmoji(badge)} removed from ${user.Username}.` });
                } else {
                    await interaction.editReply({ content: `<:cross:1143156155586199602> **Oh no!** User does not have the badge ${getBadgeEmoji(badge)}.` });
                }
            }
            break;

            case "list": {
                const badges = user.Badges;
                const embed = new EmbedBuilder()
                    .setColor(Colors.Blurple)
                    .setTitle(`<:gift:1140523648323686400> Badges of ${user.Username}`)
                    .setDescription(badges.length > 0 ? badges.map(badge => `${getBadgeEmoji(badge)}`).join(', ') : "This user doesn't have any badge!");
                await interaction.editReply({ embeds: [embed] });
            }
        }        
    }
}