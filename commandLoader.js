require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const mode = process.argv[2] || 'main';
const token = mode === 'test' ? process.env.TestToken : process.env.Token;
const clientId = mode === 'test' ? process.env.TestClientID : process.env.ClientID;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`The file ${filePath} is missing something`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Registering ${commands.length} commands on the ${mode} bot`);
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log(`Successfully registered ${data.length} commands on the ${mode} bot`);
	} catch (error) {
		console.error('Error while registering commands:', error);
	}
})();
