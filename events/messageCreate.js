const { Events, EmbedBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const club = require('../schemas/club');
require('dotenv').config();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute (message, client) {
        if (message.guild && message.channel.id === '1163181331635773482') {
            if (!message.content.startsWith('!add-role') && !message.author.bot) await message.delete();
        }
        if (message.guild && message.guild.id === process.env.ClubGuildID && message.channel.id === '1163181331635773482' && !message.author.bot) {
            if (message.content.startsWith('!add-role')) {
                await message.delete();
                const user = message.mentions.users.first()?.id
                if (!user) return;
                const schemaData = await club.findOne({ President: message.author.id })
                if (!schemaData) return await message.channel.send({ content: `Hey ${message.author}! You aren't a President of a Club` })
                if (!schemaData.Members.includes(user)) {                            
                    return await message.channel.send({ 
                        content: `Hey ${message.author}! <@${user}> isn't a member of your club!` 
                    }).then(msg => {
                        setTimeout(() => msg.delete().catch(console.error), 5000);
                    });
                }

                const isThereRole = message.guild.roles.cache.some(role => role.name === `Account ${schemaData.Name}`)
                if (isThereRole) {
                    try {
                        const role = message.guild.roles.cache.find(role => role.name === `Account ${schemaData.Name}`)
 
                        const member = message.guild.members.cache.get(user)
                        if (!member) {                            
                            return await message.channel.send({ 
                                content: `Hey ${message.author}! <@${user}> isn't on this server!` 
                            }).then(msg => {
                                setTimeout(() => msg.delete().catch(console.error), 5000);
                            });
                        }

                        if (member.roles.cache.has(role.id)) {
                            return await message.channel.send({ 
                                content: `Hey ${message.author}! <@${user}> already has your club's role!` 
                            }).then(msg => {
                                setTimeout(() => msg.delete().catch(console.error), 5000);
                            });
                            
                        }

                        await member.roles.add(role);
                        const msg = await message.channel.send(`${role} has been added to ${member.user}`)
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000)

                        const channel = message.guild.channels.cache.find(c => c.name === `🍻-${schemaData.Name.toLowerCase()}`);
                        if (channel) {
                            await channel.send({ content: `🎉 **Welcome <@${member.user.id}> to the Account ${schemaData.Name} club!**` })
                        } else {
                            const mess = await message.channel.send({ content: `I haven't found the club's chat channel, i haven't sent the welcome message.` })
                            setTimeout(async () => {
                                await mess.delete();
                            }, 5000)
                        }

                    } catch (err) {
                        const msg = await message.channel.send(`An error occured while adding the role`)
                        console.log(err)
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000)
                    }
                } else {
                    try {
                        const member = message.guild.members.cache.get(user)
                        if (!member) {                            
                            return await message.channel.send({ 
                                content: `Hey ${message.author}! <@${user}> isn't on this server!` 
                            }).then(msg => {
                                setTimeout(() => msg.delete().catch(console.error), 5000);
                            });
                        }


                        const role = await message.guild.roles.create({ name: `Account ${schemaData.Name}`, color: schemaData.Color, hoist: true, permissions: [PermissionsBitField.Flags.CreateInstantInvite] });

                        const category = await message.guild.channels.create({
                            name: `Account ${schemaData.Name}`,
                            type: ChannelType.GuildCategory,
                        });

                        const channel1 = await message.guild.channels.create({
                            type: ChannelType.GuildText,
                            name: `🍻-${schemaData.Name.toLowerCase()}`,
                            parent: category,
                            permissionOverwrites: [
                                {
                                    id: role.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                },
                                {
                                    id: message.guild.roles.everyone.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel]
                                },
                                {
                                    id: message.author.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel]
                                }
                            ]
                        });

                        const channel2 = await message.guild.channels.create({
                            type: ChannelType.GuildText,
                            name: `🎯-${schemaData.Name.toLowerCase()}`,
                            parent: category,
                            permissionOverwrites: [
                                {
                                    id: role.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages]
                                },
                                {
                                    id: message.guild.roles.everyone.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel]
                                },
                                {
                                    id: message.author.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                }
                            ]
                        });

                        await channel1.send({ content: `# Chat` })

                        await channel2.send({ content: `# Announcements` })

                        await member.roles.add(role);

                        const msg = await message.channel.send(`${role} has been added to ${member.user}`)
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000)

                        await channel1.send({ content: `🎉 **Welcome <@${member.user.id}> to the Account ${schemaData.Name} club!**` })
                    } catch (err) {
                        const msg = await message.channel.send(`An error occured while adding the role`)
                        console.log(err)
                        setTimeout(async () => {
                            await msg.delete();
                        }, 5000)
                    }
                }
            }
        }
    }
}