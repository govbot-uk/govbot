require('dotenv').config();

const config = {
    bot: {
        token: process.env.BOT_TOKEN,
        clientId: process.env.CLIENT_ID,
        prefix: process.env.PREFIX || '',
        devs: (process.env.DEV_IDS || '').split(',').filter(Boolean),
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-bot',
        sslCA: process.env.MONGODB_SSL_CA,
        sslCert: process.env.MONGODB_SSL_CERT,
    },
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        key: process.env.API_KEY,
    },
    env: process.env.NODE_ENV || 'development',
}

const required = ['BOT_TOKEN', 'CLIENT_ID', 'API_KEY'];
const missing = required.filter(key => !process.env[key]);

if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

module.exports = config;