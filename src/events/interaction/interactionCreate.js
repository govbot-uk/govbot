module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const client = interaction.client;
        
        try {
            if (!client.handlers) {
                throw new Error('Handlers not initialized');
            }

            if (interaction.isChatInputCommand()) {
                await client.handlers.commands.handleCommand(interaction);
            } else if (interaction.isButton()) {
                await client.handlers.components.handleButton(interaction);
            } else if (interaction.isAnySelectMenu()) {
                await client.handlers.components.handleSelectMenu(interaction);
            } else if (interaction.isModalSubmit()) {
                await client.handlers.components.handleModal(interaction);
            } else if (interaction.isAutocomplete()) {
                await client.handlers.autocomplete.handleAutocomplete(interaction);
            }
        } catch (error) {
            client.logger.error('Error handling interaction:', error);
            
            const errorMessage = 'An error occurred while processing your interaction.';
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({
                        content: errorMessage,
                        flags: ['Ephemeral']
                    });
                } else {
                    await interaction.reply({
                        content: errorMessage,
                        flags: ['Ephemeral']
                    });
                }
            } catch (e) {
                client.logger.error('Error sending error message:', e);
            }
        }
    }
};