const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Check the latency of the bot"),
    
    async execute(interaction, client) {
        const botPing = Date.now() - interaction.createdTimestamp;
        const apiPing = client.ws.ping;

        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        const dbPing = Date.now() - start;

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        let uptimeFormatted = "";

        if (days > 0) uptimeFormatted += `${days}d `;
        if (hours > 0 || days > 0) uptimeFormatted += `${hours}h `;
        uptimeFormatted += `${minutes}m`;

        const embed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle('<:clouds:1140524016537436171> Ping')
            .setDescription(`<:robot:1348696785794764820> Bot latency: \`${botPing}ms\`\n<:mention:1348697599393398805> Discord API: \`${apiPing}ms\`\n<:space_rocket:1140523561681956974> Database: \`${dbPing}ms\`\n\n<:compass:1348698313704214680> Uptime: \`${uptimeFormatted.trim()}\``);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
