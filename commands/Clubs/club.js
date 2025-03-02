const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const club = require('../../schemas/club');
const publicAccount = require('../../schemas/publicAccount');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('club')
    .setDescription("Manage the Club")
    .addSubcommand(command => command.setName('create').setDescription("Create a Club"))
    .addSubcommand(command => command.setName('delete').setDescription("Delete your Club"))
    .addSubcommand(command => command.setName('join').setDescription("Join a Club"))
    .addSubcommand(command => command.setName('info').setDescription("View informations about a Club"))
    .addSubcommand(command => command.setName('leave').setDescription("Leave a Club"))
    .addSubcommand(command => command.setName('advertise').setDescription("Advertise your Club"))
    .addSubcommand(command => command.setName('kick').setDescription("Kick a member from your Club").addStringOption(option => option.setName('user').setDescription('Account ID / Username / Discord ID').setRequired(true)))
    .addSubcommand(command => command.setName('broadcast').setDescription("Broadcast something to your Club").addStringOption(option => option.setName('message').setDescription('The message to broadcast').setRequired(true))),
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'create':
            const schemaData = await club.findOne({ President: interaction.user.id })
            const schemaData2 = await publicAccount.findOne({ DiscordID: interaction.user.id })

            if (schemaData) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You already are a President of a Club`, ephemeral: true })
            if (!schemaData2) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
            if (schemaData2.Likes < 5) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You must have more than 5 Likes to create a Club`, ephemeral: true })

            if (schemaData2.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            const fields1 = {
                name: new TextInputBuilder()
                .setCustomId(`club-create-name`)
                .setLabel(`Chooose a Name`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(13),
                color: new TextInputBuilder()
                .setCustomId(`club-create-color`)
                .setLabel(`Select the Color`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(`Red, Green, Blue`)
                .setMinLength(2)
                .setMaxLength(8),
                private: new TextInputBuilder()
                .setCustomId(`club-create-private`)
                .setLabel(`Private Club`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(`True / False`)
                .setMinLength(4)
                .setMaxLength(5)
            }
              
            const modal1 = new ModalBuilder()
            .setCustomId(`club_create_modal`)
            .setTitle(`Create a Club`)
            .setComponents(
                new ActionRowBuilder().addComponents(fields1.name),
                new ActionRowBuilder().addComponents(fields1.color),
                new ActionRowBuilder().addComponents(fields1.private)
            )
              
            await interaction.showModal(modal1)
              
            const submitted = await interaction.awaitModalSubmit({
                time: 180000,
                filter: i => i.user.id === interaction.user.id
            }).catch(error => {
                console.error(error)
                return null
            })

            if (submitted) {
                const [ name, color, private ] = Object.keys(fields1).map(key => submitted.fields.getTextInputValue(fields1[key].data.custom_id))
                const supportedColors = ["Blue", "Blurple", "Red", "Green", "Purple", "Pink", "Black", "Yellow", "Orange"]
                const presidentID = interaction.user.id;
                if (!supportedColors.includes(color)) {
                    return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The Color ${color} isn't a valid Color`, ephemeral: true })
                }

                const splittedName = name.split(" ")
                if (splittedName && splittedName.length > 1) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The name must be only 1 Word!`, ephemeral: true })
    
                const nameVerify = await club.findOne({ Name: name });

                if (nameVerify) return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** A Club with this name already exist!`, ephemeral: true })

                if (private.toLowerCase() !== 'false' && private.toLowerCase() !== 'true') return await submitted.reply({ content: `<:cross:1143156155586199602> **Oh no!** The "Private" value must be True / False`, ephemeral: true })

                const buffer = crypto.randomBytes(2);
                const randomInt = buffer.readUInt16BE(0);
                const fourDigitCode = String(randomInt % 10000).padStart(4, '0');

                const clubID = "A" + name.charAt(0).toUpperCase() + "-" + fourDigitCode;

                await club.create({ President: interaction.user.id, Color: color, Name: name, ClubID: clubID, Private: Boolean(private) });
                const clubData = await club.findOne({ ClubID: clubID })
                clubData.Members.push(interaction.user.id)
                await clubData.save();
                schemaData2.Club.push(name);
                await schemaData2.save();

                await submitted.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The Club has been created`, ephemeral: true })
    
            }

            break;
            
            case 'delete':
            const schemaData3 = await club.findOne({ President: interaction.user.id })
            const schemaData4 = await publicAccount.findOne({ DiscordID: interaction.user.id })
    
            if (!schemaData4) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
            if (!schemaData3) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't are a President of a Club`, ephemeral: true })

            if (schemaData4.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            await club.deleteMany({ President: interaction.user.id });

            await publicAccount.updateMany(
                { Club: schemaData3.Name },
                { $pull: { Club: schemaData3.Name } }
            );
              
            
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The Club **Account ${schemaData3.Name}** has been deleted`, ephemeral: true })

            break;

            case 'join':
            const schemaData5 = await publicAccount.findOne({ DiscordID: interaction.user.id })
            if (!schemaData5) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })

            if (schemaData5.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            const fields2 = {
                id: new TextInputBuilder()
                .setCustomId(`club-join-id`)
                .setLabel(`Select a Club`)
                .setPlaceholder(`Club ID`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(13)
            }
              
            const modal2 = new ModalBuilder()
            .setCustomId(`club_join_modal`)
            .setTitle(`Join a Club`)
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

                const [ id ] = Object.keys(fields2).map(key => submitted2.fields.getTextInputValue(fields2[key].data.custom_id))

                const schemaData6 = await publicAccount.findOne({ DiscordID: interaction.user.id })

                const clubData2 = await club.findOne({ ClubID: id })

                if (!schemaData6) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })

                if (!clubData2) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Club cannot be found`, ephemeral: true })

                if (clubData2.Members.length >= 10) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Club is full!`, ephemeral: true })

                if (clubData2.Members.includes(interaction.user.id)) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** You are already a member of this Club`, ephemeral: true })

                if (clubData2.Private) {

                    await submitted2.reply({ content: `<:clouds:1140524016537436171> **Loading** I'm trying to send the Join Request...`, ephemeral: true })

                    try {
                        const user = await client.users.fetch(clubData2.President)

                        const button = new ButtonBuilder()
                        .setLabel('Accept')
                        .setCustomId('club-accept')
                        .setEmoji('<:verified_2:1140890170661548073>')
                        .setStyle(ButtonStyle.Primary)
    
                        const actionRow = new ActionRowBuilder()
                        .addComponents(button)
    
                        const msg2 = await user.send({ content: `<:space_rocket:1140523561681956974> **Join Request** \`${interaction.user.id} (${interaction.user.username})\` want to join your Club`, components: [actionRow], ephemeral: true })
                        const collector = msg2.createMessageComponentCollector({ time: 86400000 })

                        await submitted2.editReply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The request has been sent! You will be notified in DM if you get accepted`, ephemeral: true })

                        collector.on('collect', async but => {
                            clubData2.Members.push(interaction.user.id)
                            await clubData2.save();
                            schemaData6.Club.push(clubData2.Name);
                            await schemaData6.save();

                            await but.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have accepted the request succesfully` })
                            await msg2.edit({ content: `<:space_rocket:1140523561681956974> **Join Request** The request has been accepted`, components: [] })

                            try {
                                const userButton = await client.users.fetch(interaction.user.id)
                                await userButton.send({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your request for ${clubData2.Name} has been accepted`, ephemeral: true })
                            } catch (err) {
                                return;
                            }
                        })
                    } catch (err) {
                        await submitted2.editReply({ content: `<:cross:1143156155586199602> **Oh no!** An error occured while sending the Join Request`, ephemeral: true })
                        return console.log(err)
                    }

                } else {
                    clubData2.Members.push(interaction.user.id)
                    await clubData2.save();
                    schemaData6.Club.push(clubData2.Name);
                    await schemaData6.save();
    
                    await submitted2.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have joined the Club`, ephemeral: true })

                    try {
                        const user = await client.users.fetch(clubData2.President)
                        await user.send({ content: `<:verified_2:1140890170661548073> **New Member** \`${interaction.user} (${interaction.user.username})\` has joined your Club`, ephemeral: true })
                    } catch (err) {
                        return;
                    }
                }
    
            }

            break;

            case 'leave':
            const schemaData10 = await publicAccount.findOne({ DiscordID: interaction.user.id })
            if (!schemaData10) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
        
            if (schemaData10.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            const fields4 = {
                id: new TextInputBuilder()
                .setCustomId(`club-leave-id`)
                .setLabel(`Select a Club`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Club ID')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(13)
            }
                      
            const modal4 = new ModalBuilder()
            .setCustomId(`club_join_modal`)
            .setTitle(`Leave a Club`)
            .setComponents(
                new ActionRowBuilder().addComponents(fields4.id)
            )
                      
            await interaction.showModal(modal4)
                      
            const submitted4 = await interaction.awaitModalSubmit({
                time: 180000,
                filter: i => i.user.id === interaction.user.id
            }).catch(error => {
                console.error(error)
                return null
            })
        
            if (submitted4) {

                const [ id ] = Object.keys(fields4).map(key => submitted4.fields.getTextInputValue(fields4[key].data.custom_id))

                const schemaData10 = await publicAccount.findOne({ DiscordID: interaction.user.id })

                const clubData4 = await club.findOne({ ClubID: id })

                if (!schemaData10) return await submitted4.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })

                if (!clubData4) return await submitted4.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Club cannot be found`, ephemeral: true })

                if (clubData4.President === interaction.user.id) return await submitted4.reply({ content: `<:cross:1143156155586199602> **Oh no!** The President of the Club can't leave it`, ephemeral: true })

                if (!clubData4.Members.includes(interaction.user.id)) return await submitted4.reply({ content: `<:cross:1143156155586199602> **Oh no!** You aren't a member of this Club`, ephemeral: true })

                await club.updateMany(
                    { President: clubData4.President },
                    { $pull: { Members: interaction.user.id } }
                );
                
                await publicAccount.updateMany(
                    { Club: clubData4.Name },
                    { $pull: { Club: clubData4.Name } }
                );
    
                await submitted4.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have leaved the Club`, ephemeral: true })

                try {
                    const user = await client.users.fetch(clubData4.President)
                    await user.send({ content: `<:cross:1143156155586199602> **Member Lost** \`${interaction.user} (${interaction.user.username})\` has leaved your Club`, ephemeral: true })
                } catch (err) {
                    return;
                }
    
            }
    
            break;

            case 'info':
            const schemaData7 = await publicAccount.findOne({ DiscordID: interaction.user.id })
            if (!schemaData7) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })

            if (schemaData7.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })
    
            const fields3 = {
                id: new TextInputBuilder()
                .setCustomId(`club-info-id`)
                .setLabel(`Select a Club`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Club ID / Name')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(13)
            }
                  
            const modal3 = new ModalBuilder()
            .setCustomId(`club_info_modal`)
            .setTitle(`View a Club`)
            .setComponents(
                new ActionRowBuilder().addComponents(fields3.id)
            )
                  
            await interaction.showModal(modal3)
                  
            const submitted3 = await interaction.awaitModalSubmit({
                time: 180000,
                filter: i => i.user.id === interaction.user.id
            }).catch(error => {
                console.error(error)
                return null
            })
    
            if (submitted3) {
    
                let clubInfo;

                const [ id ] = Object.keys(fields3).map(key => submitted3.fields.getTextInputValue(fields3[key].data.custom_id))
    
                const schemaData7 = await publicAccount.findOne({ DiscordID: interaction.user.id })

                const idCheck = await club.findOne({ ClubID: id });
                const nameCheck = await club.findOne({ Name: id });
    
                if (idCheck) {
                    clubInfo = idCheck.ClubID
                } else if (nameCheck) {
                    clubInfo = nameCheck.ClubID
                } else if (!idCheck && !nameCheck) {
                    return await submitted3.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Club can't be found`, ephemeral: true });
                } else {
                    return await submitted3.reply({ content: `<:cross:1143156155586199602> **Oh no!** This Club can't be found`, ephemeral: true })
                }

                const clubData3 = await club.findOne({ ClubID: clubInfo })
    
                if (!schemaData7) return await submitted2.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })

                const embed = new EmbedBuilder()
                .setColor(clubData3.Color)
                .setAuthor({ name: `Account ${clubData3.Name}` })
                .addFields({ name: `Name`, value: `\`\`\`${clubData3.Name}\`\`\`` }, { name: `President`, value: `<@${clubData3.President}>` }, { name: `Club ID`, value: `\`\`\`${clubData3.ClubID}\`\`\`` }, { name: `Members`, value: `\`\`\`${clubData3.Members.length} / 10\`\`\`` }, { name: `Private Club`, value: `\`\`\`${clubData3.Private}\`\`\`` })
        
                await submitted3.reply({ embeds: [embed], ephemeral: true })
            }

            break;

            case 'broadcast':
            let broadcastCount = 0;
            const message = interaction.options.getString('message');
            const schemaData8 = await club.findOne({ President: interaction.user.id })
            const schemaData9 = await publicAccount.findOne({ DiscordID: interaction.user.id })
        
            if (!schemaData9) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
            if (!schemaData8) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't are a President of a Club`, ephemeral: true })

            if (schemaData8.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            schemaData8.Members.forEach(async ID => {
                try {
                    const userBroadcast = await client.users.fetch(ID);
                    const embed2 = new EmbedBuilder()
                    .setTitle('<:music_note:1140524683700215869> Broadcast')
                    .setAuthor({ name: `Account ${schemaData8.Name}` })
                    .setColor(schemaData8.Color)
                    .setDescription(`\`\`\`${message}\`\`\``)
                    await userBroadcast.send({ embeds: [embed2] })
                    broadcastCount = broadcastCount + 1;
                } catch (err) {
                    return;
                }
            })

            setTimeout(async () => {
                await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** The Broadcast has been sent to ${broadcastCount} / ${schemaData8.Members.length} Members`, ephemeral: true })
            }, 2000)

            break;

            case 'kick':
            const schemaData11 = await publicAccount.findOne({ DiscordID: interaction.user.id })
            if (!schemaData11) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
            const schemaData12 = await club.findOne({ President: interaction.user.id })
            if (!schemaData12) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You aren't the President of a Club`, ephemeral: true })
    
            if (schemaData11.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })
            
            const id = interaction.options.getString('user');

            let accountInfo;

            const usernameCheck = await publicAccount.findOne({ Username: id });
            const userCheck = await publicAccount.findOne({ UserID: id });
            const discordCheck = await publicAccount.findOne({ DiscordID: id });

            if (usernameCheck) {
                accountInfo = usernameCheck.DiscordID
            } else if (userCheck) {
                accountInfo = userCheck.DiscordID
            } else if (discordCheck) {
                accountInfo = discordCheck.DiscordID
            } else if (!discordCheck && !userCheck && !usernameCheck) {
                return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** This User can't be found`, ephemeral: true });
            } else {
                return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** This User can't be found`, ephemeral: true })
            }
    
            const schemaData13 = await publicAccount.findOne({ DiscordID: accountInfo })
    
            if (!schemaData13) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** This User cannot be found`, ephemeral: true })
    
            if (id === schemaData12.President) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You can't kick the President of the Club`, ephemeral: true })
    
            if (!schemaData12.Members.includes(interaction.user.id)) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** This User isn't a member of your Club`, ephemeral: true })
    
            await club.updateMany(
                { President: schemaData12.President },
                { $pull: { Members: accountInfo } }
            );
                    
            await publicAccount.updateOne( 
                { DiscordID: accountInfo },
                { $pull: { Club: schemaData12.Name } }
            );
        
            await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** You have kicked <@${accountInfo}> from the Club`, ephemeral: true })
    
            try {
                const user = await client.users.fetch(accountInfo)
                await user.send({ content: `<:cross:1143156155586199602> **Kicked** \`${interaction.user} (${interaction.user.username})\` has kicked you from **Account ${schemaData12.Name}**`, ephemeral: true })
            } catch (err) {
                return;
            }
        
            break;

            case 'advertise':
            const schemaData14 = await publicAccount.findOne({ DiscordID: interaction.user.id })
            if (!schemaData14) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You don't have an Account`, ephemeral: true })
            const schemaData15 = await club.findOne({ President: interaction.user.id })
            if (!schemaData15) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You aren't the President of a Club`, ephemeral: true })
        
            if (schemaData14.Suspended) return await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** Your Account is Suspended`, ephemeral: true })

            if (Date.now() - schemaData15.LastAdvertised.getTime() >= 24 * 60 * 60 * 1000) {
                const channel = client.channels.cache.get(process.env.ChannelAdvertise);
                const embed = new EmbedBuilder()
                .setColor(schemaData15.Color)
                .setTitle(`<:mail:1140524950030127155> Account ${schemaData15.Name}`)
                .setDescription(`**Account ${schemaData15.Name}** is looking for ${10 - schemaData15.Members.length} members!\n\n_Join now_ with \`/club join\`!`)
                const msg = await channel.send({ content: '@here', embeds: [embed] });
                await interaction.reply({ content: `<:verified_2:1140890170661548073> **Oh yes!** Your server has been advertised on our Main Server: ${msg.url}`, ephemeral: true });
                schemaData15.LastAdvertised = new Date();
                await schemaData15.save();
            } else {
                const cooldownDuration = 24 * 60 * 60 * 1000;

                const currentDate = new Date();

                const timePassed = currentDate - schemaData15.LastAdvertised;

                const timeDiff = cooldownDuration - timePassed;
                
                const hours = Math.floor(timeDiff / 3600000);
                const minutes = Math.floor((timeDiff % 3600000) / 60000);

                const timeLeft = `${hours}h ${minutes}m`;
                await interaction.reply({ content: `<:cross:1143156155586199602> **Oh no!** You can advertise your Club again in \`${timeLeft}\``, ephemeral: true });
            }

            break;
        }
    }
}

//questo è un piccolo easter egg che lascio a te disadattato così non ti dimenticherai di me