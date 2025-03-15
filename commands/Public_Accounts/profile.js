const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ButtonStyle } = require('discord.js');
const crypto = require('crypto');
const publicAccount = require('../../schemas/publicAccount');
let accountInfo;
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../', '../', './configs', 'badges.json');
const badges = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription("View a profile"),
    async execute(interaction, client) {

        const fields = {
            username: new TextInputBuilder()
            .setCustomId(`input-user`)
            .setLabel(`Select an User`)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder(`Username / Account ID / Discord ID`)
            .setMinLength(5)
            .setMaxLength(50),
        }
          
        const modal = new ModalBuilder()
        .setCustomId(`account_modal`)
        .setTitle(`View a profile`)
        .setComponents(
            new ActionRowBuilder().addComponents(fields.username)
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
            let [ username ] = Object.keys(fields).map(key => submitted.fields.getTextInputValue(fields[key].data.custom_id));

            username = username.trim() === '' ? interaction.user.id : username;

            const usernameCheck = await publicAccount.findOne({ Username: username });
            const userCheck = await publicAccount.findOne({ UserID: username });
            const discordCheck = await publicAccount.findOne({ DiscordID: username });

            if (usernameCheck) {
                accountInfo = usernameCheck.DiscordID
            } else if (userCheck) {
                accountInfo = userCheck.DiscordID
            } else if (discordCheck) {
                accountInfo = discordCheck.DiscordID
            } else if (!discordCheck && !userCheck && !usernameCheck) {
                return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Account can't be found`, ephemeral: true });
            } else { 
                return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Account can't be found`, ephemeral: true })
            }

            const accountData = await publicAccount.findOne({ DiscordID: accountInfo });

            if (accountData.Suspended) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Account is Suspended`, ephemeral: true })

            const Clubs = accountData.Club.join(", ") || "None"

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
                { name: `<:thumb:1140523687456542840> Likes`, value: `\`\`\`${accountData.Likes}\`\`\``, inline: true }, 
                { name: `<:team:1140523980235735040> Clubs`, value: `\`\`\`${Clubs}\`\`\``, inline: true }, 
                { name: `<:lightining:1140524539437121606> Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` }, 
                { name: `<:partner:1140527513836199946> Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` }
            )

            const likeButton = new ButtonBuilder()
            .setCustomId('like_button')
            .setLabel('ㅤㅤLeave a Likeㅤㅤ')
            .setEmoji('<:thumbs_up:1140523687456542840>')
            .setStyle(ButtonStyle.Secondary)

            const urlButton = new ButtonBuilder()
            .setEmoji('<:chain:1140525058780049529>')
            .setLabel('ㅤㅤView Profileㅤㅤ')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/users/${accountData.DiscordID}`)

            const actionRow = new ActionRowBuilder()
            .addComponents(likeButton, urlButton)

            await submitted.deferReply({ ephemeral: true })

            const msg = await submitted.editReply({ embeds: [embed], components: [actionRow], ephemeral: true })

            const buttonCollector = msg.createMessageComponentCollector({ filter: int => client.user.id === '1120021233971503276' });

            buttonCollector.on('collect', async i => {
                try {
                    if (accountData.Liked.includes(i.user.id)) {
                        const index = accountData.Liked.indexOf(i.user.id);
                        if (index !== -1) {
                            accountData.Liked.splice(index, 1);
                            accountData.Likes--;
                            accountData.DailyLikes--;
                            accountData.WeeklyLikes--;
                            await accountData.save();
                            await i.deferUpdate();
                            const embed2 = new EmbedBuilder()
                            .setColor(accountData.Color)
                            .setAuthor({ name: `${accountData.Username}`, iconURL: accountData.Image })
                            .addFields(
                                { name: `<:mention:1348697599393398805> Username`, value: `${accountData.Username}${space}${emoji1}${emoji2}` },
                                { name: `<:stars:1140524749500465234> Biography`, value: `\`\`\`${accountData.Description}\`\`\`` }, 
                                { name: `<:thumb:1140523687456542840> Likes`, value: `\`\`\`${accountData.Likes}\`\`\``, inline: true }, 
                                { name: `<:team:1140523980235735040> Clubs`, value: `\`\`\`${Clubs}\`\`\``, inline: true }, 
                                { name: `<:lightining:1140524539437121606> Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` }, 
                                { name: `<:partner:1140527513836199946> Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` }
                            )
                            await submitted.editReply({ embeds: [embed2], components: [actionRow] })
                            try {
                                const accountUser = await client.users.fetch(accountData.DiscordID)
                                await accountUser.send({ content: `<:thumbs_down:1140523745451200583> **Like Alert** \`${i.user.username} (${i.user.id})\` has removed a Like from your Account! _${accountData.Likes} Likes_` })
                            } catch (err) {
                                return;
                            }
                        }
        
                    } else {
                        accountData.Liked.push(i.user.id);
                        accountData.Likes++;
                        accountData.DailyLikes++;
                        accountData.WeeklyLikes++;
                        await accountData.save();
                        await i.deferUpdate();
                        const embed2 = new EmbedBuilder()
                        .setColor(accountData.Color)
                        .setAuthor({ name: `${accountData.Username}`, iconURL: accountData.Image })
                        .addFields(
                            { name: `<:mention:1348697599393398805> Username`, value: `${accountData.Username}${space}${emoji1}${emoji2}` },
                            { name: `<:stars:1140524749500465234> Biography`, value: `\`\`\`${accountData.Description}\`\`\`` }, 
                            { name: `<:thumb:1140523687456542840> Likes`, value: `\`\`\`${accountData.Likes}\`\`\``, inline: true }, 
                            { name: `<:team:1140523980235735040> Clubs`, value: `\`\`\`${Clubs}\`\`\``, inline: true }, 
                            { name: `<:lightining:1140524539437121606> Account ID`, value: `\`\`\`${accountData.UserID}\`\`\`` }, 
                            { name: `<:partner:1140527513836199946> Discord ID`, value: `\`\`\`${accountData.DiscordID}\`\`\`` }
                        )
                        await submitted.editReply({ embeds: [embed2], components: [actionRow] })
                        try {
                            const accountUser = await client.users.fetch(accountData.DiscordID)
                            await accountUser.send({ content: `<:thumbs_up:1140523687456542840> **Like Alert** \`${i.user.username} (${i.user.id})\` has added a Like to your Account! _${accountData.Likes} Likes_` })
                        } catch (err) {
                            return;
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
            })
        }
    }
}