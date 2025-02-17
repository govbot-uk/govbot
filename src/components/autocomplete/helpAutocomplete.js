module.exports = {
    commandName: 'help',
    optionName: 'command',

    async execute(interaction, value) {
        const commands = Array.from(interaction.client.handlers.commands.commands.values());
        const searchValue = value.toLowerCase();
        
        return commands
            .filter(cmd => cmd.data.name.toLowerCase().includes(searchValue))
            .map(cmd => ({
                name: cmd.data.name,
                value: cmd.data.name
            }))
            .slice(0, 25);
    }
};
