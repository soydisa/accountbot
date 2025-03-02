const { SlashCommandBuilder, EmbedBuilder, ActivityType, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const crypto = require('crypto');
const publicAccount = require('../../schemas/publicAccount');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('register')
    .setDescription("Register a new account")
    .addAttachmentOption(option => option.setName('image').setDescription('Your new Profile Image').setRequired(true)),
    async execute(interaction, client) {
        const schemaData = await publicAccount.findOne({ DiscordID: interaction.user.id });
        if (schemaData) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You already have an account`, ephemeral: true })
        
        const fields = {
            username: new TextInputBuilder()
            .setCustomId(`input-username`)
            .setLabel(`Chooose an Username`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(`Dis4d4tt4t0`)
            .setMinLength(5)
            .setMaxLength(15),
            color: new TextInputBuilder()
            .setCustomId(`input-color`)
            .setLabel(`Select your Color`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(`Red, Green, Blue`)
            .setValue('Red')
            .setMinLength(2)
            .setMaxLength(8),
            description: new TextInputBuilder()
            .setCustomId(`input-description`)
            .setLabel(`Describe yourself`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder(`I am a bad boy...`)
            .setMaxLength(150)
        }
          
        const modal = new ModalBuilder()
        .setCustomId(`register_modal`)
        .setTitle(`Register your Account`)
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
            const image = interaction.options.getAttachment('image').url;
            const discordID = interaction.user.id;
            const Description = description || "None"
            const userID = crypto.createHash('md5').update(discordID).digest('hex');
            const idVerify = await publicAccount.findOne({ UserID: userID })
            const usernameVerify = await publicAccount.findOne({ Username: username })
            if (idVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The ID ${userID} has been already taken`, ephemeral: true })
            if (usernameVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The Username ${username} has been already taken`, ephemeral: true })
            if (!supportedColors.includes(color)) {
                return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The Color ${color} isn't a valid Color`, ephemeral: true })
            }

            await submitted.deferReply({ ephemeral: true });
            await publicAccount.create({ DiscordID: interaction.user.id, UserID: userID, Username: username, Color: color, Image: image, Description: description });
            const accountData = await publicAccount.findOne({ UserID: userID })
            const embed = new EmbedBuilder()
            .setColor(accountData.Color)
            .setAuthor({ name: accountData.Username, iconURL: accountData.Image })
            .addFields({ name: `Description`, value: `\`\`\`${accountData.Description}\`\`\`` }, { name: `Likes`, value: `\`\`\`${accountData.Likes}\`\`\`` }, { name: `Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` }, { name: `Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` })
            await submitted.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your account has been created:`, embeds: [embed], ephemeral: true })
            const accounts = await publicAccount.countDocuments();

            client.user.setActivity({
                name: `/register • ${accounts} Accounts v${process.env.Version}`,
                type: ActivityType.Playing,
            });
        }

    }
}