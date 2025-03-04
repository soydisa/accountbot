const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('quests')
    .setDescription("View your quests"),
    async execute(interaction, client) {
        const finder = 'Missions.status'
        const schemaData = await publicAccount.findOne({ DiscordID: interaction.user.id });
        if (!schemaData) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account doesn't exist`, ephemeral: true });
        const activeStatus = schemaData.Missions.filter(mission => mission.status === '0').slice(0, 10);
        const completedStatus = schemaData.Missions.filter(mission => mission.status === '1').slice(0, 10);
        const expiredStatus = schemaData.Missions.filter(mission => mission.status === '2').slice(0, 10);

        const embed1 = new EmbedBuilder()
        .setColor(schemaData.Color)
        .setTitle("<:forward:1141603712809316392> Active Quests")
        const button1 = new ButtonBuilder()
        .setCustomId('mission_button_1')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:chain:1140525058780049529>')
        .setLabel("Active")
        const button2 = new ButtonBuilder()
        .setCustomId('mission_button_2')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:chain:1140525058780049529>')
        .setLabel("Completed")
        const button3 = new ButtonBuilder()
        .setCustomId('mission_button_3')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('<:chain:1140525058780049529>')
        .setLabel("Expired")
        const row1 = new ActionRowBuilder()
        .addComponents(button1)
        const row2 = new ActionRowBuilder()
        .addComponents(button2)
        const row3 = new ActionRowBuilder()
        .addComponents(button3)
        if (activeStatus.length < 1) {
            embed1.addFields({ name: `Nothing to show`, value: `There isn't a quest to show...` })
            await interaction.reply({ embeds: [embed1], components: [row2, row3], ephemeral: true })
        } else {
            activeStatus.forEach((mission, index) => {
                let type
                if (mission.type === '0') {
                    type = 'Daily'
                } else if (mission.type === '1') {
                    type = 'Weekly'
                }
                embed1.addFields({ name: `Quest ${index + 1}`, value: `Type: **${type}**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>` })
            });
            const msg = await interaction.reply({ embeds: [embed1], components: [row2, row3], ephemeral: true });
            const collector = msg.createMessageComponentCollector({ time: 180000, filter: i => i.user.id === interaction.user.id })
            collector.on('collect', async i => {
                if (i.customId === 'mission_button_1') {
                    const embed2 = new EmbedBuilder()
                    .setColor(schemaData.Color)
                    .setTitle("<:forward:1141603712809316392> Active Quests")
                    if (activeStatus.length < 1) {
                        embed2.addFields({ name: `Nothing to show`, value: `There isn't a quest to show...` })
                        await interaction.editReply({ embeds: [embed2], components: [row2, row3], ephemeral: true });
                        await i.deferUpdate();
                    } else {
                        activeStatus.forEach((mission, index) => {
                            let type
                            if (mission.type === '0') {
                                type = 'Daily'
                            } else if (mission.type === '1') {
                                type = 'Weekly'
                            }
                            embed2.addFields({ name: `Quest ${index + 1}`, value: `Type: **${type}**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>` })
                        });
                        await interaction.editReply({ embeds: [embed2], components: [row2, row3], ephemeral: true });
                        await i.deferUpdate();

                    }
                } else if (i.customId === 'mission_button_2') {
                    const embed2 = new EmbedBuilder()
                    .setColor(schemaData.Color)
                    .setTitle("<:forward:1141603712809316392> Completed Quests")
                    if (completedStatus.length < 1) {
                        embed2.addFields({ name: `Nothing to show`, value: `There isn't a quest to show...` })
                        await interaction.editReply({ embeds: [embed2], components: [row1, row3], ephemeral: true });
                        await i.deferUpdate();
                    } else {
                        completedStatus.forEach((mission, index) => {
                            let type
                            if (mission.type === '0') {
                                type = 'Daily'
                            } else if (mission.type === '1') {
                                type = 'Weekly'
                            }
                            embed2.addFields({ name: `Quest ${index + 1}`, value: `Type: **${type}**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>` })
                        });
                        await interaction.editReply({ embeds: [embed2], components: [row1, row3], ephemeral: true });
                        await i.deferUpdate();
                    }
                } else if (i.customId === 'mission_button_3') {
                    const embed2 = new EmbedBuilder()
                    .setColor(schemaData.Color)
                    .setTitle("<:forward:1141603712809316392> Expired Quests")
                    if (expiredStatus.length < 1) {
                        embed2.addFields({ name: `Nothing to show`, value: `There isn't a quest to show...` })
                        await interaction.editReply({ embeds: [embed2], components: [row1, row2], ephemeral: true });
                        await i.deferUpdate();
                    } else {
                        expiredStatus.forEach((mission, index) => {
                            let type
                            if (mission.type === '0') {
                                type = 'Daily'
                            } else if (mission.type === '1') {
                                type = 'Weekly'
                            }
                            embed2.addFields({ name: `Quest ${index + 1}`, value: `Type: **${type}**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>` })
                        });
                        await interaction.editReply({ embeds: [embed2], components: [row1, row2], ephemeral: true });
                        await i.deferUpdate();
                    }
                }
            })
        }
    }
}