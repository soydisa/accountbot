const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

const mode = process.argv[2];
const token = mode === "test" ? process.env.TestToken : process.env.Token;

const client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration
	],
    partials: [
		Partials.Channel,
		Partials.Message
	]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`The file ${filePath} is missing something`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

	const filePath = path.join(eventsPath, file);

	const event = require(filePath);

	if (event.once) {

		client.once(event.name, (...args) => event.execute(...args, client));

	} else {

		client.on(event.name, (...args) => event.execute(...args, client));

	}

}



client.login(token);