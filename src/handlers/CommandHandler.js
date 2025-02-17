const { Collection, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs').promises;
const path = require('path');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.rest = new REST({ version: '10' }).setToken(client.config.bot.token);
    }

    async loadCommands() {
        try {
            const commandsPath = path.join(__dirname, '..', 'commands');
            const commandFolders = await fs.readdir(commandsPath);

            for (const folder of commandFolders) {
                const folderPath = path.join(commandsPath, folder);
                const stat = await fs.stat(folderPath);

                if (!stat.isDirectory()) continue;

                const commandFiles = (await fs.readdir(folderPath))
                    .filter(file => file.endsWith('.js'));

                for (const file of commandFiles) {
                    const filePath = path.join(folderPath, file);
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if ('data' in command && 'execute' in command) {
                        command.filepath = filePath;
                        this.commands.set(command.data.name, command);
                        this.client.logger.debug(`Loaded command: ${command.data.name}`);
                    } else {
                        this.client.logger.warn(`Invalid command file structure: ${filePath}`);
                    }
                }
            }

            await this.registerCommands();
            this.client.logger.info(`Loaded ${this.commands.size} commands`);
        } catch (error) {
            this.client.logger.error('Error loading commands:', error);
            throw error;
        }
    }

    async registerCommands() {
        try {
            const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

            this.client.logger.info('Started refreshing application commands...');

            await this.rest.put(
                Routes.applicationCommands(this.client.config.bot.clientId),
                { body: commands },
            );

            this.client.logger.info('Successfully refreshed application commands');
        } catch (error) {
            this.client.logger.error('Error registering application commands:', error);
            throw error;
        }
    }

    async handleCommand(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            this.client.logger.warn(`Command not found: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
            this.client.logger.debug(`Command executed: ${interaction.commandName}`, {
                user: interaction.user.tag,
                guild: interaction.guild?.name
            });
        } catch (error) {
            this.client.logger.error(`Error executing command: ${interaction.commandName}`, error);
            const errorMessage = 'There was an error while executing this command!';

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, flags: ['Ephemeral'] });
            } else {
                await interaction.reply({ content: errorMessage, flags: ['Ephemeral'] });
            }
        }
    }
}

module.exports = CommandHandler;