const { Events, EmbedBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const club = require('../schemas/club');
const publicAccount = require('../schemas/publicAccount');
require('dotenv').config();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute (message, client) {
        if (!message.author.bot && message.guild && message.guild.id === process.env.MainServer && message.member.roles.cache.some(role => role.id === process.env.ManagementRole)) {
            if (message.content.startsWith('!suspend')) {
                await message.delete();
                const args = message.content.split(' ');
                const schemaData = await publicAccount.findOne({ DiscordID: args[1] })
                if (!schemaData) {
                    return await message.channel.send({ content: `The Account has not been found` });
                }
                if (schemaData.Suspended) {
                    schemaData.Suspended = false;
                    await schemaData.save();
                    const msg = await message.channel.send({ content: `The Account now is not Suspended` });
                    setTimeout(async () => {
                        return await msg.delete();
                    }, 5000)
                } else if (!schemaData.Suspended) {
                    schemaData.Suspended = true;
                    await schemaData.save();
                    const msg = await message.channel.send({ content: `The Account has been Suspended` });
                    setTimeout(async () => {
                        return await msg.delete();
                    }, 5000)
                }
            } else if (message.content === '!selfadv-instructions') {
                await message.delete();
                if (message.channel.id === process.env.ChannelSelfAdv) {
                    await message.channel.send({ content: "**__<:partner:1140527513836199946> ISTRUZIONI SELF ADV__**\n\n•  `1` <:forward:1141603712809316392>  Si possono cercare **staff**, __membri__ per i **club**, **manager** per il vostro **server __personale__** o per il vostro **club**.  Si possono mettere queste cose soltanto in questo canale.\n\n•  `2` <:forward:1141603712809316392>  Si può **scrivere** fino ad un **massimo** di **__15__ righe**.\n\n•  `3` <:forward:1141603712809316392>  __Vietato__ inviare **link**.\n\n•  `4` <:forward:1141603712809316392>  __Vietato__ usare il **simbolo** __`#`__  a **scopo** di far diventare i __propri__ messaggi più **rilevanti**.\n\n•  `5` <:forward:1141603712809316392>  Evita **contenuti** che potrebbero risultare **offensivi**.\n\n" })
                };
            } else if (message.content === '!listcommands') {
                await message.delete();
                let Lista = [];
                const commands = await client.application.commands.fetch();
                commands.forEach(cmd => {
                    Lista.push(`${cmd.name}: ${cmd.id}`)
                });
                await message.channel.send(Lista.join(",\n"))
            }
        }
    }
}