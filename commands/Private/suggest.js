const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js')
const publicAccount = require('../../schemas/publicAccount');
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription("Suggest something to add to Account"),
    async execute(interaction, client) {
        
        const select = new StringSelectMenuBuilder()
        .setCustomId('suggest_stringselect')
        .setPlaceholder('Select the Type')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Account Bot')
                .setValue('bot'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Account Servers')
                .setValue('servers'),
        );

        const selectRow = new ActionRowBuilder()
        .addComponents(select)

        const msg = await interaction.reply({ components: [selectRow], ephemeral: true })

        const collector = msg.createMessageComponentCollector({ time: 180000, componentType: ComponentType.StringSelect, filter: i => i.user.id === interaction.user.id })

        collector.on('collect', async i => {
            const value = i.values[0];
            
            const fields1 = {
                suggestion: new TextInputBuilder()
                .setCustomId(`suggestion`)
                .setLabel(`Suggestion`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Add a dancing chicken')
                .setMinLength(3)
                .setMaxLength(30),
            }
              
            const modal1 = new ModalBuilder()
            .setCustomId(`suggest_modal`)
            .setTitle(`Suggest something`)
            .setComponents(
                new ActionRowBuilder().addComponents(fields1.suggestion)
            )

            if (value === 'bot') {
                await i.showModal(modal1)
              
                const submitted = await i.awaitModalSubmit({
                    time: 180000,
                    filter: int => int.user.id === interaction.user.id
                }).catch(error => {
                    console.error(error)
                    return null
                })

                if (submitted) {
                    const [ suggestion ] = Object.keys(fields1).map(key => submitted.fields.getTextInputValue(fields1[key].data.custom_id));
                    const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("<:partner:1140527513836199946> New suggestion")
                    .addFields({ name: `Author`, value: `${interaction.user}` }, { name: `Type`, value: `Bot` }, { name: `Suggestion`, value: `\`\`\`${suggestion}\`\`\`` })
                    const button = new ButtonBuilder()
                    .setCustomId('suggestion_button')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('<:verified_2:1140890170661548073>')
                    .setLabel('Accept')
                    const actionRow = new ActionRowBuilder()
                    .addComponents(button)
                    const channel = client.channels.cache.get(process.env.ChannelSuggestion);
                    const msg2 = await channel.send({ embeds: [embed], components: [actionRow] })
                	await submitted.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your suggestion will be valutated`, ephemeral: true });
                    const collector = msg2.createMessageComponentCollector({ time: 180000, componentType: ComponentType.Button, filter: i => i.user.id === interaction.user.id });
                    collector.on('collect', async i2 => {
                        const channel2 = client.channels.cache.get(process.env.ChannelSuggestionAccepted);
                        const embed2 = new EmbedBuilder()
                        .setColor("Blurple")
                        .setTitle("<:partner:1140527513836199946> Sugggestion accepted")
                        .addFields({ name: `Type`, value: `Bot` }, { name: `Suggestion`, value: `\`\`\`${suggestion}\`\`\`` })
                        const toDelete = await channel2.send({ content: '@here' });
                        await toDelete.delete();
                        const reacted = await channel2.send({ embeds: [embed2] });
                        await reacted.react('<:verified_2:1140890170661548073>')
                        await reacted.react('<:cross:1143156155586199602>')
                        await i2.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The suggestion has been accepted`, ephemeral: true });
                        collector.stop();
                    });

                    collector.on('end', async i2 => {
                        await msg2.edit({ embeds: [embed], components: [] })
                    });
                }
                
            } else if (value === 'servers') {
                await i.showModal(modal1)
              
                const submitted = await i.awaitModalSubmit({
                    time: 180000,
                    filter: int => int.user.id === interaction.user.id
                }).catch(error => {
                    console.error(error)
                    return null
                })

                if (submitted) {
                    const [ suggestion ] = Object.keys(fields1).map(key => submitted.fields.getTextInputValue(fields1[key].data.custom_id));
                    const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("<:partner:1140527513836199946> New suggestion")
                    .addFields({ name: `Author`, value: `${interaction.user}` }, { name: `Type`, value: `Servers` }, { name: `Suggestion`, value: `\`\`\`${suggestion}\`\`\`` })
                    const button = new ButtonBuilder()
                    .setCustomId('suggestion_button')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('<:verified_2:1140890170661548073>')
                    .setLabel('Accept')
                    const actionRow = new ActionRowBuilder()
                    .addComponents(button)
                    const channel = client.channels.cache.get(process.env.ChannelSuggestion);
                    const msg2 = await channel.send({ embeds: [embed], components: [actionRow] })
                	await submitted.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your suggestion will be valutated`, ephemeral: true });
                    const collector = msg2.createMessageComponentCollector({ time: 180000, componentType: ComponentType.Button, filter: i => i.user.id === interaction.user.id });
                    collector.on('collect', async i2 => {
                        const channel2 = client.channels.cache.get(process.env.ChannelSuggestionAccepted);
                        const embed2 = new EmbedBuilder()
                        .setColor("Blurple")
                        .setTitle("<:partner:1140527513836199946> Sugggestion accepted")
                        .addFields({ name: `Type`, value: `Servers` }, { name: `Suggestion`, value: `\`\`\`${suggestion}\`\`\`` })
                        const toDelete = await channel2.send({ content: '@here' });
                        await toDelete.delete();
                        const reacted = await channel2.send({ embeds: [embed2] });
                        await reacted.react('<:verified_2:1140890170661548073>')
                        await reacted.react('<:cross:1143156155586199602>')
                        await i2.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The suggestion has been accepted`, ephemeral: true });
                        collector.stop();
                    });

                    collector.on('end', async i2 => {
                        await msg2.edit({ embeds: [embed], components: [] })
                    });
                }
            }
        })
    }
}