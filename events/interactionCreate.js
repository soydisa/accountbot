const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute (interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`Command ${interaction.commandName} not found`);
                return;
            }
        
            try {
                await command.execute(interaction, client);
            } catch (err) {
                if (interaction.replied || interaction.deferred) {
                    console.log(err)
                    const erroreembed1 = new EmbedBuilder()
                    .setTitle(`<:cross:1143156155586199602> Error`)
                    .setColor("Red")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    await interaction.followUp({ embeds: [erroreembed1], ephemeral: true });
                } else {
                    console.log(err)
                    const erroreembed2 = new EmbedBuilder()
                    .setTitle(`<:cross:1143156155586199602> Error`)
                    .setColor("Red")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    await interaction.reply({ embeds: [erroreembed2], ephemeral: true });
                }
            }
        }
    }
}