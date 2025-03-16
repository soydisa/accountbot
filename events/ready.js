const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const MongoDBUrl = process.env.MongoDBUrl;
require('dotenv').config();
const publicAccount = require("../schemas/publicAccount")
const managerMembers = require("../schemas/managerMembers")
const club = require("../schemas/club");
const { assignRandomMission, checkMissions, resetChannel, checkStaff, checkBadges, wait } = require('../function');
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

            setInterval(async () => {
                const accounts = await publicAccount.countDocuments();

                client.user.setActivity({
                    name: `/register • ${accounts} Accounts • v${process.env.Version}`,
                    type: ActivityType.Custom
                
                });
            }, 5000);
            

            setInterval(async () => {
                await checkMissions(publicAccount, client);

                wait(5000)

                await checkStaff(publicAccount, client);

                wait(5000)

                await checkBadges(publicAccount, managerMembers, club, client);
            }, 5 * 60 * 1000);

            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() < 10) {
              console.log("Cleaning pre-downtime messages in SelfAdv");
              await resetChannel(client);
            }

            cron.schedule("00 23 * * *", async () => {
              await resetChannel(client);
            });
          
            console.log("SelfAdv cleaning scheduler activated");
            
            console.log("Startup completed!");

            await publicAccount.updateMany(
                { ClubEverJoined: { $exists: false } },
                { $set: { ClubEverJoined: false } }
            );
            
        } catch (err) {
            if (err.code === '11000') {
                console.log('This IP is not whitelisted on our database!')
            } else {
                console.log(err)
            }
        }
    }
}