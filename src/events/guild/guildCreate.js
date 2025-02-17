module.exports = {
    name: 'guildCreate',
    execute(client, guild) {
        client.logger.info(`Bot joined a new guild: ${guild.name} (${guild.id})`);
    }
};
