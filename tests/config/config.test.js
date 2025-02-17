describe('Environment Config', () => {
    it('should throw warning if required environment variables are missing', () => {
        const originalEnv = process.env;
        delete process.env.BOT_TOKEN;
        delete process.env.CLIENT_ID;

        expect(() => require('../../config')).toThrow('Missing environment variables: BOT_TOKEN, CLIENT_ID');

        process.env = originalEnv;
    });

    it('should load environment variables', () => {
        const originalEnv = process.env;
        
        delete process.env.BOT_TOKEN;
        delete process.env.CLIENT_ID;

        process.env.BOT_TOKEN = 'mock-token';
        process.env.CLIENT_ID = 'mock-id';
        
        const config = require('../../config');
        expect(config.bot.token).toBe('mock-token');
        expect(config.bot.clientId).toBe('mock-id');

        process.env = originalEnv;
    });
});