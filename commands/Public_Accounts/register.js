const { SlashCommandBuilder, EmbedBuilder, ActivityType, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const crypto = require('crypto');
const publicAccount = require('../../schemas/publicAccount');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../', '../', './configs', 'badges.json');
const badges = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

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
            .setLabel(`Chooose a username`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(`${interaction.user.displayName}`)
            .setMinLength(5)
            .setMaxLength(15),
            color: new TextInputBuilder()
            .setCustomId(`input-color`)
            .setLabel(`Select your color`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(`Red, Green, Blue`)
            .setValue('Red')
            .setMinLength(2)
            .setMaxLength(8),
            description: new TextInputBuilder()
            .setCustomId(`input-description`)
            .setLabel(`Write your biography`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder(`I'm ${interaction.user.displayName}`)
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
            const supportedColors = ["Blue", "Blurple", "Red", "Green", "Purple", "Fuchsia", "Yellow", "Orange"]
            const image = interaction.options.getAttachment('image').url;
            const discordID = interaction.user.id;
            const Description = description || "None"
            const userID = crypto.createHash('md5').update(discordID).digest('hex');
            const idVerify = await publicAccount.findOne({ UserID: userID })
            const usernameVerify = await publicAccount.findOne({ Username: username })
            if (idVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The ID \`${userID}\` has been already taken`, ephemeral: true })
            if (usernameVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The username ${username} has already been taken`, ephemeral: true })
            if (!supportedColors.includes(color)) {
                return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The color ${color} isn't a valid color`, ephemeral: true })
            }

            await submitted.deferReply({ ephemeral: true });
            await publicAccount.create({ DiscordID: interaction.user.id, UserID: userID, Username: username, Color: color, Image: image, Description: description, FirstSelectedBadge: '', SecondSelectedBadge: '', Club: [], Suspended: false });
            const accountData = await publicAccount.findOne({ UserID: userID })

            let space = ''

            if (accountData.FirstSelectedBadge !== '' || accountData.SecondSelectedBadge !== '') {
                space = ' '
            }

            const emoji1 = badges[accountData.FirstSelectedBadge]?.icon || ''
            const emoji2 = badges[accountData.SecondSelectedBadge]?.icon || ''

            const embed = new EmbedBuilder()
            .setColor(accountData.Color)
            .setAuthor({ name: `${accountData.Username}`, iconURL: accountData.Image })
            .addFields(
                { name: `<:mention:1348697599393398805> Username`, value: `\`${accountData.Username}\`${space}${emoji1}${emoji2}` },
                { name: `<:stars:1140524749500465234> Biography`, value: `\`\`\`${accountData.Description}\`\`\`` },
                { name: `<:lightining:1140524539437121606> Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` },
                { name: `<:partner:1140527513836199946> Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` }
            )
            await submitted.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your account has been created:`, embeds: [embed], ephemeral: true });
        }

    }
}