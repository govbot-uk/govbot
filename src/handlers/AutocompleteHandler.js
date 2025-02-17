const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/Logger');

class AutocompleteHandler {
    constructor(client) {
        this.client = client;
        this.autocompleteHandlers = new Map();
    }

    async loadAutocomplete() {
        try {
            const autocompletePath = path.join(__dirname, '..', 'components', 'autocomplete');
            const files = await fs.readdir(autocompletePath);

            for (const file of files) {
                if (!file.endsWith('.js')) continue;

                const filePath = path.join(autocompletePath, file);
                delete require.cache[require.resolve(filePath)];
                const autocomplete = require(filePath);

                if ('commandName' in autocomplete && 'optionName' in autocomplete && 'execute' in autocomplete) {
                    const key = `${autocomplete.commandName}:${autocomplete.optionName}`;
                    this.autocompleteHandlers.set(key, autocomplete.execute);
                    logger.debug(`Loaded autocomplete handler: ${key}`);
                }
            }

            logger.info(`Loaded ${this.autocompleteHandlers.size} autocomplete handlers`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                logger.warn('Autocomplete directory not found, creating...');
                await fs.mkdir(path.join(__dirname, '..', 'components', 'autocomplete'), { recursive: true });
            } else {
                throw error;
            }
        }
    }

    registerAutocomplete(commandName, optionName, handler) {
        const key = `${commandName}:${optionName}`;
        this.autocompleteHandlers.set(key, handler);
        logger.debug(`Registered autocomplete handler: ${key}`);
    }

    async handleAutocomplete(interaction) {
        const { commandName } = interaction;
        const focusedOption = interaction.options.getFocused(true);
        const key = `${commandName}:${focusedOption.name}`;

        const handler = this.autocompleteHandlers.get(key);
        if (!handler) {
            logger.warn(`No autocomplete handler found for: ${key}`);
            return;
        }

        try {
            const choices = await handler(interaction, focusedOption.value);
            await interaction.respond(
                choices.slice(0, 25).map(choice => {
                    return typeof choice === 'string' 
                        ? { name: choice, value: choice }
                        : choice;
                })
            );
        } catch (error) {
            logger.error(`Error in autocomplete handler for ${key}:`, error);
            await interaction.respond([]);
        }
    }
}

module.exports = AutocompleteHandler;
