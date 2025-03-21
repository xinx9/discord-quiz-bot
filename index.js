const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { service: 'index' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `console.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'console.log' }),
	  new transports.Console()
    ]
  });



const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Bot ready...');
	logger.info('Started!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;

	if (interaction.customId == `answer-done`) {
		logger.info(`🤌`);
		const command = client.commands.get(`quiz`);
		try {
			await command.execute(interaction);
		} catch (error) {
			logger.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	
	logger.info(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	logger.info(command);

	if (!command) return;

	try {
		logger.info(interaction);
		await command.execute(interaction);
	} catch (error) {
		logger.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);