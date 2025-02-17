// Remove sinon require since we'll use Jest mocks

const createMockClient = () => ({
    user: {
        tag: 'TestBot',
        id: '1234567890'
    },
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    },
    services: {
        cache: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn()
        },
        database: {
            create: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
        }
    },
    ws: {
        ping: 50
    },
    guilds: new Map(),
    emit: jest.fn()
});

const createMockInteraction = (options = {}) => ({
    reply: jest.fn().mockResolvedValue(undefined),
    editReply: jest.fn().mockResolvedValue(undefined),
    deferReply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
    showModal: jest.fn().mockResolvedValue(undefined),
    fetchReply: jest.fn().mockResolvedValue({
        createdTimestamp: Date.now() - 100,
    }),
    replied: options.replied || false,
    commandName: options.commandName || 'test',
    createdTimestamp: Date.now() - 100,
    options: {
        getChannel: jest.fn(),
        getString: jest.fn(),
        getInteger: jest.fn(),
        getBoolean: jest.fn(),
        getUser: jest.fn(),
        getRole: jest.fn(),
        getMentionable: jest.fn(),
        getSubcommand: jest.fn(),
    },
    user: {
        id: options.userId || '123456789',
        tag: options.userTag || 'TestUser'
    },
    guild: {
        id: options.guildId || '987654321',
        name: options.guildName || 'TestGuild',
        roles: {
            cache: new Map(),
            highest: { position: 100 }
        },
        channels: {
            cache: new Map(),
            fetch: jest.fn()
        }
    },
    member: {
        roles: {
            cache: new Map(),
            add: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined)
        }
    },
    client: options.client || createMockClient()
});

const createMockMessage = (options = {}) => ({
    content: options.content || 'Test message',
    author: {
        id: options.authorId || '123456789',
        tag: options.authorTag || 'TestUser',
        bot: options.isBot || false
    },
    guild: {
        id: options.guildId || '987654321',
        name: options.guildName || 'TestGuild',
    },
    channel: {
        id: options.channelId || '456789123',
        name: options.channelName || 'test-channel',
        send: jest.fn().mockResolvedValue(undefined),
    },
    reply: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    client: options.client || createMockClient()
});

module.exports = {
    createMockClient,
    createMockInteraction,
    createMockMessage
};