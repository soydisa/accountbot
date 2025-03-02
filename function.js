const { EmbedBuilder } = require("discord.js");
const cron = require("node-cron");
require("dotenv").config();

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
                                await userDM.send({ embeds: [embed] });
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
                                await userDM.send({ embeds: [embed] });
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
  

module.exports = { assignRandomMission, checkMissions, resetChannel }