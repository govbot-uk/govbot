const logger = require('../utils/Logger');

class ErrorHandler {
    constructor(client) {
        this.client = client;
        this.setupErrorHandlers();
    }

    setupErrorHandlers() {
        // Discord.js specific errors
        this.client.on('error', error => {
            logger.error('Discord client error:', error);
        });

        this.client.on('shardError', error => {
            logger.error('WebSocket connection error:', error);
        });

        this.client.on('warn', warning => {
            logger.warn('Discord client warning:', warning);
        });

        // Process-wide error handling
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            this.handleFatalError(error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection:', reason);
            this.handleFatalError(reason);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.handleGracefulShutdown());
        process.on('SIGINT', () => this.handleGracefulShutdown());
    }

    handleFatalError(error) {
        logger.error('Fatal error occurred:', error);
        
        // Attempt to notify developers/admins here
        // Could use a webhook or other notification system
        
        // Gracefully shutdown after fatal error
        this.handleGracefulShutdown();
    }

    async handleGracefulShutdown() {
        logger.info('Initiating graceful shutdown...');

        try {
            // Perform cleanup tasks
            if (this.client.isReady()) {
                await this.client.destroy();
            }

            logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }

    async handleError(error, context = '') {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            context: context
        };

        logger.error('Error occurred:', errorDetails);

        // Could add additional error handling logic here
        // Such as reporting to an error tracking service
    }
}

module.exports = ErrorHandler;