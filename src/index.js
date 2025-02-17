const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('../config');
const CommandHandler = require('./handlers/CommandHandler');
const EventHandler = require('./handlers/EventHandler');
const ComponentHandler = require('./handlers/ComponentHandler');
const ErrorHandler = require('./handlers/ErrorHandler');
const FeedHandler = require('./handlers/FeedHandler');
const AutocompleteHandler = require('./handlers/AutocompleteHandler');
const logger = require('./utils/Logger');
const DatabaseService = require('./services/DatabaseService');
const CacheService = require('./services/CacheService');

class Bot {
    constructor() {
        // Initialize services first
        const cacheService = new CacheService();
        
        this.services = {
            cache: cacheService,
            database: new DatabaseService(cacheService)
        };

        // Initialize Discord client
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember
            ],
            allowedMentions: {
                parse: ['users', 'roles'],
                repliedUser: false
            }
        });

        // Attach properties to client
        this.client.logger = logger;
        this.client.config = config;
        this.client.services = this.services;

        // Initialize handlers after client is created
        this.handlers = {
            commands: new CommandHandler(this.client),
            events: new EventHandler(this.client),
            components: new ComponentHandler(this.client),
            errors: new ErrorHandler(this.client),
            feeds: new FeedHandler(this.client),
            autocomplete: new AutocompleteHandler(this.client)
        };

        // Attach handlers to client after creation
        this.client.handlers = this.handlers;

        this.client.feeds = new Map();
    }

    async init() {
        try {
            logger.info('Initializing bot...');

            // Connect to database
            await this.services.database.connect();

            // Load all handlers
            await Promise.all([
                this.handlers.commands.loadCommands(),
                this.handlers.events.loadEvents(),
                this.handlers.components.loadComponents(),
                this.handlers.feeds.loadFeeds(),
                this.handlers.autocomplete.loadAutocomplete() // Add this line
            ]);

            // Login to Discord
            await this.client.login(config.bot.token);

            logger.info('Bot initialization complete');
        } catch (error) {
            logger.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.info('Shutting down bot...');

        try {
            // Cleanup tasks
            if (this.client.isReady()) {
                await this.client.destroy();
            }

            await this.services.database.cleanup();
            
            logger.info('Bot shutdown complete');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Create and start bot instance
const bot = new Bot();

// Handle process events
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    bot.shutdown();
});

// Start the bot
bot.init().catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
});