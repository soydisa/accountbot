const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const MongoDBUrl = process.env.MongoDBUrl;
require('dotenv').config();
const publicAccount = require("../schemas/publicAccount")
const club = require("../schemas/club");
const { assignRandomMission, checkMissions, resetChannel } = require('../function');
const cron = require("node-cron");

module.exports = {
    name: Events.ClientReady,
    once: false,
    async execute (client) {
        
        try {

            require('../commandLoader')

            await mongoose.connect(MongoDBUrl || '', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
        
            if (mongoose.connect) {
                console.log('Database connected!');
            }

            const accounts = await publicAccount.countDocuments();

            client.user.setActivity({
                name: `/register • ${accounts} Accounts v${process.env.Version}`,
                type: ActivityType.Playing,
            });

            await publicAccount.updateMany(
                { Club: { $exists: false } },
                { $set: { Club: [] } }
            );

            await publicAccount.updateMany(
                { Suspended: { $exists: false } },
                { $set: { Suspended: false } }
            );

            await club.updateMany(
                { LastAdvertised: { $exists: false } },
                { $set: { LastAdvertised: '2011-09-15T06:00:00.000Z' } }
            );

            setInterval(async () => {
                await checkMissions(publicAccount, client);
            }, 3000);

            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() < 10) {
              console.log("Cleaning pre-downtime messages in SelfAdv");
              await resetChannel(client);
            }

            cron.schedule("59 23 * * *", async () => {
              await resetChannel(client);
            });
          
            console.log("SelfAdv cleaning scheduler activated");
        } catch (err) {
            if (err.code === '11000') {
                console.log('This IP is not whitelisted on our database!')
            } else {
                console.log(err)
            }
        }

    }
}