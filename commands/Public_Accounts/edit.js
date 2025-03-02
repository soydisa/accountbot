const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('edit')
    .setDescription("Edit your account")
    .addAttachmentOption(option => option.setName('image').setDescription('Change your Profile Image').setRequired(false)),
    async execute(interaction, client) {
        const schemaData = await publicAccount.findOne({ DiscordID: interaction.user.id });
        if (!schemaData) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an account`, ephemeral: true })
        
        const fields = {
            username: new TextInputBuilder()
            .setCustomId(`edit-username`)
            .setLabel(`Change the Username`)
            .setStyle(TextInputStyle.Short)
            .setValue(schemaData.Username)
            .setRequired(true)
            .setPlaceholder(`Dis4d4tt4t0`)

            .setMinLength(5)
            .setMaxLength(15),
            color: new TextInputBuilder()
            .setCustomId(`edit-color`)
            .setLabel(`Change your Color`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(`Red, Green, Blue`)
            .setValue(schemaData.Color)
            .setMinLength(2)
            .setMaxLength(8),
            description: new TextInputBuilder()
            .setCustomId(`edit-description`)
            .setLabel(`Edit your description`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setValue(schemaData.Description)
            .setPlaceholder(`I am a bad boy...`)
            .setMaxLength(150)
        }
          
        const modal = new ModalBuilder()
        .setCustomId(`register_modal`)
        .setTitle(`Edit your Account`)
        .setComponents(
            new ActionRowBuilder().addComponents(fields.username),
            new ActionRowBuilder().addComponents(fields.color),
            new ActionRowBuilder().addComponents(fields.description)
        )
          
        await interaction.showModal(modal)
          
        const submitted = await interaction.awaitModalSubmit({
            time: 180000,
            filter: i => i.user.id === interaction.user.id
        }).catch(error => {
            console.error(error)
            return null
        })
        if (submitted) {
            const [ username, color, description ] = Object.keys(fields).map(key => submitted.fields.getTextInputValue(fields[key].data.custom_id))
            const supportedColors = ["Blue", "Blurple", "Red", "Green", "Purple", "Pink", "Yellow", "Orange"]
            const image = interaction.options.getAttachment('image')?.url;
            const discordID = interaction.user.id;
            const Description = description || "None"
            if (schemaData.Suspended) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })
            if (schemaData.Username !== username) {
                const usernameVerify = await publicAccount.findOne({ Username: username })
                if (usernameVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The Username ${username} has been already taken`, ephemeral: true })
            }
            if (!supportedColors.includes(color)) {
                return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The Color ${color} isn't a valid Color`, ephemeral: true })
            }

            await submitted.deferReply({ ephemeral: true });
            if (image) {
                schemaData.Image = image;
            }
            schemaData.Username = username;
            schemaData.Color = color;
            schemaData.Description = description;
            await schemaData.save();
            const accountData = await publicAccount.findOne({ UserID: schemaData.UserID })
            const embed = new EmbedBuilder()
            .setColor(accountData.Color)
            .setAuthor({ name: accountData.Username, iconURL: accountData.Image })
            .addFields({ name: `Description`, value: `\`\`\`${accountData.Description}\`\`\`` }, { name: `Likes`, value: `\`\`\`${accountData.Likes}\`\`\`` }, { name: `Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` }, { name: `Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` })
            await submitted.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your account has been edited:`, embeds: [embed], ephemeral: true })

        }

    }
}