module.exports = {
    name: 'error',
    execute(client, error) {
        client.logger.error('Client error:', error);
    }
};