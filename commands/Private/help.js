const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription("Get help with the bot")
    .addSubcommand(subcommand => 
        subcommand
        .setName('commands')
        .setDescription("Get a list of commands")
    )
    .addSubcommand(subcommand => 
        subcommand
        .setName('support')
        .setDescription("Get support for the bot")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName('invite')
        .setDescription("Add or invite the bot to your server")
    ),
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        switch (sub) {
            case 'commands':
                await interaction.deferReply({ ephemeral: true });
                Lista = [];
                const commands = await client.application.commands.fetch();
                commands.forEach(cmd => {
                    Lista.push(`\`/${cmd.name}\`: ${cmd.description}`)
                });
        
                const embed = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("<:question_point:1140524059017363586> Commands | Help")
                    .setDescription(`${Lista.join("\n")}`)
        
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            break;

            case 'support':
                await interaction.deferReply({ ephemeral: true });

                const embed2 = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("<:question_point:1140524059017363586> Support | Help")
                    .setDescription(`You can join our [Support Server](https://discord.gg/ZJjcKfFjVJ) to get help with the bot!`)

                await interaction.editReply({ embeds: [embed2], ephemeral: true });
            break;

            case 'invite':
                await interaction.deferReply({ ephemeral: true });

                const embed3 = new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle("<:question_point:1140524059017363586> Invite | Help")
                    .setDescription(`You can add the bot to your DMs by clicking [this link](https://discord.com/oauth2/authorize?client_id=1120021233971503276&integration_type=1&scope=applications.commands)\n\nYou can invite the bot to your server by clicking [this link](https://discord.com/oauth2/authorize?client_id=1120021233971503276&permissions=28031067352311&integration_type=0&scope=bot+applications.commands)`)

                await interaction.editReply({ embeds: [embed3], ephemeral: true });
            break;
        }
    }
}