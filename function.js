const { EmbedBuilder } = require("discord.js");
const cron = require("node-cron");
const fs = require('fs');
require("dotenv").config();
const upgrades = JSON.parse(fs.readFileSync('./configs/upgrades.json', 'utf8'));
const badges = JSON.parse(fs.readFileSync('./configs/badges.json', 'utf8'));

function assignRandomMission(user) {
    const missionTypes = ["0", "1"];
    const randomMissionType = String(missionTypes[Math.floor(Math.random() * missionTypes.length)]);

    if (randomMissionType === '0') {
        const casualLikes = Number(Math.floor(Math.random() * 3) + 1);
        const casualPrize = Number(Math.floor(Math.random() * 5) + 1);
        const startDate = new Date();
        user.Missions.push({ type: randomMissionType, start: startDate, likes: casualLikes, prize: casualPrize, status: "0" });
        console.log(user.DiscordID + " " + "Missione Creata!");
    } else if (randomMissionType === '1') {
        const casualLikes = Number(Math.floor(Math.random() * (10 - 3 + 1)) + 3);
        const casualPrize = Number(Math.floor(Math.random() * (7 - 3 + 1)) + 3);
        const startDate = new Date();
        user.Missions.push({ type: randomMissionType, start: startDate, likes: casualLikes, prize: casualPrize, status: "0" });
        console.log(user.DiscordID + " " + "Missione Creata!");
    }
}

async function checkMissions(schema, client) {
    try {
        const users = await schema.find({});

        users.forEach(async (user) => {
            if (user.Missions.length < 1) {
                user.DailyLikes = 0;
                user.WeeklyLikes = 0;
                assignRandomMission(user);
            }
            user.Missions.forEach(async (mission) => {
                if (mission.status === "0") {
                    if (mission.type === "0") {
                        const currentDate = new Date();
                        const missionStartDate = new Date(mission.start);
                        const missionDuration = 24 * 60 * 60 * 1000;
                        if (currentDate - missionStartDate < missionDuration) {
                            if (user.DailyLikes >= mission.likes) {
                                mission.status = "1";
                                user.Likes + mission.prize;
                                user.DailyLikes = 0;
                                assignRandomMission(user);
                                const userDM = await client.users.fetch(user.DiscordID);
                                const embed = new EmbedBuilder()
                                .setColor(user.Color)
                                .setTitle("<:chain:1140525058780049529> Mission Completed!")
                                .setDescription(`Type: **Daily**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>`)
                                try {
                                    await userDM.send({ embeds: [embed] });
                                } catch (err) {
                                    return console.error(err);
                                }
                            }
                        } else {
                            mission.status = '2';
                            user.DailyLikes = 0;
                            assignRandomMission(user);
                        }
                    } else if (mission.type === "1") {
                        const currentDate = new Date();
                        const missionStartDate = new Date(mission.start);
                        const missionDuration = 7 * 24 * 60 * 60 * 1000;
                        if (currentDate - missionStartDate < missionDuration) {
                            if (user.WeeklyLikes >= mission.likes) {
                                mission.status = "1";
                                user.Likes + mission.prize;
                                user.WeeklyLikes = 0;
                                assignRandomMission(user);
                                const userDM = await client.users.fetch(user.DiscordID);
                                const embed = new EmbedBuilder()
                                .setColor(user.Color)
                                .setTitle("<:chain:1140525058780049529> Mission Completed!")
                                .setDescription(`Type: **Weekly**\nGoal: **${mission.likes}** Likes\nPrize: **${mission.prize}** Likes\nStart: <t:${Math.floor(mission.start.getTime() / 1000)}:d>`)
                                try {
                                    await userDM.send({ embeds: [embed] });
                                } catch (err) {
                                    return console.error(err);
                                }
                            }
                        } else {
                            mission.status = '2';
                            user.WeeklyLikes = 0;
                            assignRandomMission(user);
                        }
                    }
                }
            });
    
            await user.save();
        });
    } catch (err) {
        return console.error(err);
    }
}

async function checkStaff(schema, client) {
    try {
        const users = await schema.find({});

        const guild = client.guilds.cache.get(process.env.MainServer)
        if (!guild) return console.error("Errore nel trovare il server!");

        const role = guild.roles.cache.get(process.env.StaffRole);
        if (!role) return console.error("Errore nel trovare il ruolo!");

        users.forEach(async (user) => {
            const member = guild.members.cache.get(user.DiscordID);
      
            if (member) {
                if (user.Staff) {
                    if (!member.roles.cache.has(role.id)) {
                        user.Staff = false;
                        await user.save();
                        console.log(`Staff status removed from ${member.user.username}`)
                    }
                } else {
                    if (member.roles.cache.has(role.id)) {
                        user.Staff = true;
                        await user.save();
                        console.log(`Staff status added to ${member.user.username}`)
                    }
                }
            }
        })
    } catch (err) {
        return console.error(err);
    }
}

async function checkBadges(schema, schema2, schema3, client) {
    try {
        const badgeList = [
            "blue_headset",
            "gold_crown",
            "acid_shield",
            "purple_crown",
            "red_gavel",
            "red_code"
        ]

        const managerMembers = await schema2.findOne({ ID: 1 });

        const users = await schema.find({});
        const guild = client.guilds.cache.get(process.env.MainServer);
        const role = guild.roles.cache.get(process.env.OwnerRole);
        const role2 = guild.roles.cache.get(process.env.ClubOwnerRole);
        const role3 = guild.roles.cache.get(process.env.DeveloperRole);
        const role4 = guild.roles.cache.get(process.env.DeveloperCoordinatorRole);

        users.forEach(async (user) => {
            const member = guild.members.cache.get(user.DiscordID);

            if (!user.Badges.includes(badgeList[4])) {
                if (user.ClubKickedMembers.length >= 5) {
                    user.Badges.push(badgeList[4]);
                    await user.save();
                }
            } else {
                const index = user.Badges.indexOf(badgeList[4]);
                if (user.ClubKickedMembers.length < 5) {
                    user.Badges.splice(index, 1);
                    await user.save();
                }
            }

            if (user.Staff) {
                if (!user.Badges.includes(badgeList[0])) {
                    user.Badges.push(badgeList[0]);
                    await user.save();
                }
            } else {
                const index = user.Badges.indexOf(badgeList[0]);
                if (user.Badges.includes(badgeList[0])) {
                    user.Badges.splice(index, 1);
                    await user.save();
                }
            }
            
            const clubs = await schema3.find({}, 'President'); 
            const Presidents = clubs.map(club => club.President);

            if (user.Badges.includes(badgeList[3])) {
                if (!Presidents.includes(user.DiscordID)) {
                    const index = user.Badges.indexOf(badgeList[3]);
                    user.Badges.splice(index, 1);
                    await user.save();
                }
            } else {
                if (Presidents.includes(user.DiscordID)) {
                    user.Badges.push(badgeList[3]);
                    await user.save();
                }
            }

            if (member) {
                if (member.roles.cache.has(process.env.ClubOwnerRole)) {
                    if (!Presidents.includes(user.DiscordID)) {
                        await member.roles.remove(role2);
                    }
                } else {
                    if (Presidents.includes(user.DiscordID)) {
                        await member.roles.add(role2);
                    }
                }

                if (member.roles.cache.has(role.id)) {
                    if (!user.Badges.includes(badgeList[1])) {
                        user.Badges.push(badgeList[1]);
                        await user.save();
                    }
                } else {
                    const index = user.Badges.indexOf(badgeList[1]);
                    if (user.Badges.includes(badgeList[1])) {
                        user.Badges.splice(index, 1);
                        await user.save();
                    }
                }

                if (member.roles.cache.has(role3.id) || member.roles.cache.has(role4.id)) {
                    if (!user.Badges.includes(badgeList[5])) {
                        user.Badges.push(badgeList[5]);
                        await user.save();
                    }
                } else {
                    const index = user.Badges.indexOf(badgeList[5]);
                    if (user.Badges.includes(badgeList[5])) {
                        user.Badges.splice(index, 1);
                        await user.save();
                    }
                }
            }

            if (managerMembers.Staff.includes(user.DiscordID)) {
                if (!user.Badges.includes(badgeList[2])) {
                    user.Badges.push(badgeList[2]);
                    await user.save();
                }
            } else {
                const index = user.Badges.indexOf(badgeList[2]);
                if (user.Badges.includes(badgeList[2])) {
                    user.Badges.splice(index, 1);
                    await user.save();    
                }
            }
        })
    } catch (err) {
        return console.error(err);
    }
}

async function resetChannel(client) {
    try {
      const channel = await client.channels.fetch(process.env.ChannelSelfAdv);
      if (!channel) return
  
      const messages = await channel.messages.fetch();
      await channel.bulkDelete(messages, true);
  
      await channel.send({ content: "**__<:partner:1140527513836199946> ISTRUZIONI SELF ADV__**\n\n•  `1` <:forward:1141603712809316392>  Si possono cercare **staff**, __membri__ per i **club**, **manager** per il vostro **server __personale__** o per il vostro **club**.  Si possono mettere queste cose soltanto in questo canale.\n\n•  `2` <:forward:1141603712809316392>  Si può **scrivere** fino ad un **massimo** di **__15__ righe**.\n\n•  `3` <:forward:1141603712809316392>  __Vietato__ inviare **link**.\n\n•  `4` <:forward:1141603712809316392>  __Vietato__ usare il **simbolo** __`#`__  a **scopo** di far diventare i __propri__ messaggi più **rilevanti**.\n\n•  `5` <:forward:1141603712809316392>  Evita **contenuti** che potrebbero risultare **offensivi**.\n\n" });
    } catch (error) {
      console.error("Errore nella pulizia del canale ADV:", error);
    }
}

function upgradeEmbed(index, color) {
    if (index < 0 || index-1 >= upgrades.length) return null;

    return new EmbedBuilder()
        .setColor(color)
        .setTitle(upgrades[index].title)
        .addFields(
            { name: "<:stars:1140524749500465234> Price", value: `<:space:1140523440453988433> ${upgrades[index].price}`, inline: true },
            { name: "<:user:1140523944936493116> Member Slot", value: `<:space:1140523440453988433> ${upgrades[index].slots}`, inline: true }
        );
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

module.exports = { assignRandomMission, checkMissions, resetChannel, upgradeEmbed, checkStaff, checkBadges, wait }