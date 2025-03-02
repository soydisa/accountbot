require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

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

const rest = new REST().setToken(process.env.Token);

(async () => {
	try {
		console.log(`Registering ${commands.length} commands on the Client`);
		const data = await rest.put(
            Routes.applicationCommands(process.env.ClientID),
            { body: commands },        
		);

		console.log(`Registered ${data.length} commands on the Client`);
	} catch (error) {
		console.error(error);
	}
})();