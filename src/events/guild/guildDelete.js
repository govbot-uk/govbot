module.exports = {
    name: 'guildDelete',
    execute(client, guild) {
        client.logger.info(`Bot removed from guild: ${guild.name} (${guild.id})`);
    }
};