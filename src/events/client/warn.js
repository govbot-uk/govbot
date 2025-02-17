module.exports = {
    name: 'warn',
    execute(client, info) {
        client.logger.warn('Warning:', info);
    }
};