const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');
const managersMem = require('../../schemas/managerMembers');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('manager')
    .setDescription("Command reserved to the owners of the Account bot")
    .addSubcommand(command => command.setName('add').setDescription("Add a manager"))
    .addSubcommand(command => command.setName('remove').setDescription("Remove a manager"))
    .addSubcommand(command => command.setName('list').setDescription("View the manager list")),
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        if (interaction.user.id != 783581145522634752) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You are not permitted to do this!`, ephemeral: true })
        const managerMembers = await managersMem.findOne({ _id: "67c32c0276e6aacc05b5b67e" });

        if (managerMembers) {
            switch (sub) {
                case "add":
                    const fields1 = {
                        id: new TextInputBuilder()
                        .setCustomId(`discord-id-management`)
                        .setLabel(`Discord ID`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setPlaceholder('The discord ID')
                        .setMinLength(3)
                        .setMaxLength(40),
                    }
                    
                    const modal1 = new ModalBuilder()
                    .setCustomId(`management_modal`)
                    .setTitle(`Select user`)
                    .setComponents(
                        new ActionRowBuilder().addComponents(fields1.id)
                    )

                    await interaction.showModal(modal1)
                
                    const submitted1 = await interaction.awaitModalSubmit({
                        time: 180000,
                        filter: i => i.user.id === interaction.user.id
                    }).catch(error => {
                        console.error(error)
                        return null
                    })
        
                    if (submitted1) {
                        const [ id ] = Object.keys(fields1).map(key => submitted1.fields.getTextInputValue(fields1[key].data.custom_id));

                        const schemaData6 = await publicAccount.findOne({ DiscordID: id })

                        if (!schemaData6) return await submitted1.reply({ content: `<:cross:1143156155586199602> **Oh no!** I can't find an account with this ID!`, ephemeral: true })

                        if (managerMembers.Staff.includes(id)) return await submitted1.reply({ content: `<:cross:1143156155586199602> **Oh no!** This user is already a manager!`, ephemeral: true });

                        managerMembers.Staff.push(id);
                        await managerMembers.save();
                        await submitted1.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have added <@${id}> to the management team!`, ephemeral: true })
                    }
                break;
                case "remove":
                    const fields2 = {
                        id: new TextInputBuilder()
                        .setCustomId(`discord-id-management`)
                        .setLabel(`Discord ID`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setPlaceholder('The discord ID')
                        .setMinLength(3)
                        .setMaxLength(40),
                    }
                    
                    const modal2 = new ModalBuilder()
                    .setCustomId(`management_modal`)
                    .setTitle(`Select user`)
                    .setComponents(
                        new ActionRowBuilder().addComponents(fields2.id)
                    )

                    await interaction.showModal(modal2)
                
                    const submitted2 = await interaction.awaitModalSubmit({
                        time: 180000,
                        filter: i => i.user.id === interaction.user.id
                    }).catch(error => {
                        console.error(error)
                        return null
                    })
        
                    if (submitted2) {
                        const [ id ] = Object.keys(fields2).map(key => submitted2.fields.getTextInputValue(fields2[key].data.custom_id));

                        const schemaData6 = await publicAccount.findOne({ DiscordID: id })

                        if (!schemaData6) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** I can't find an account with this ID!`, ephemeral: true })

                        if (!managerMembers.Staff.includes(id)) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** This user isn't a manager!`, ephemeral: true });

                        let index = managerMembers.Staff.indexOf(id);
                        if (index !== -1) {
                            managerMembers.Staff.splice(index, 1)
                        }

                        await managerMembers.save();
                        await submitted2.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have removed <@${id}> from the management team!`, ephemeral: true })
                    }
                break;
                case "list":
                let listaMembri = [];

                for (let memberId of managerMembers.Staff) {
                    const discordCheck = await publicAccount.findOne({ DiscordID: memberId });
                    listaMembri.push(discordCheck.Username);
                }

                let embed = new EmbedBuilder()

                if (listaMembri.length > 0) {
                    embed.setColor(`Blurple`)
                    .setAuthor({ name: `Manager team` })
                    .addFields(
                        { name: `Members`, value: `\`\`\`${listaMembri.join(", ")}\`\`\`` }
                    )
                } else {
                    embed.setColor(`Blurple`)
                    .setAuthor({ name: `Manager team` })
                    .addFields(
                        { name: `Members`, value: `\`\`\`None\`\`\`` }
                    )
                }
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }  
}