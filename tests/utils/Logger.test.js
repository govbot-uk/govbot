// Mock logger instance that will be used across tests
const mockLoggerInstance = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
};

// Mock winston
jest.mock('winston', () => ({
    createLogger: jest.fn(() => mockLoggerInstance),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        errors: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn()
    }
}));

// Set test environment
process.env.NODE_ENV = 'test';

// Clear module cache and reset mocks before each test
beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});

describe('Logger', () => {
    let Logger;

    afterEach(() => {
        // Cleanup any logger instance
        const logger = require('../../src/utils/Logger');
        logger.cleanup();
    });

    describe('Singleton Pattern', () => {
        it('should create only one instance', () => {
            const Logger1 = require('../../src/utils/Logger');
            const Logger2 = require('../../src/utils/Logger');
            expect(Logger1).toBe(Logger2);
        });

        it('should throw error when using new keyword', () => {
            const LoggerClass = require('../../src/utils/Logger').constructor;
            expect(() => new LoggerClass()).toThrow('Use Logger.getInstance() instead of new Logger()');
        });
    });

    describe('Logging Methods', () => {
        beforeEach(() => {
            Logger = require('../../src/utils/Logger');
        });

        it('should log info messages', () => {
            const message = 'Test info';
            const meta = { test: true };
            Logger.info(message, meta);
            expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, meta);
        });

        it('should log warning messages', () => {
            const message = 'Test warning';
            const meta = { test: true };
            Logger.warn(message, meta);
            expect(mockLoggerInstance.warn).toHaveBeenCalledWith(message, meta);
        });

        it('should log error messages with Error object', () => {
            const message = 'Test error';
            const error = new Error('Test error message');
            Logger.error(message, error);
            expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, {
                error: {
                    message: error.message,
                    stack: error.stack
                }
            });
        });

        it('should log debug messages', () => {
            const message = 'Test debug';
            const meta = { test: true };
            Logger.debug(message, meta);
            expect(mockLoggerInstance.debug).toHaveBeenCalledWith(message, meta);
        });
    });

    describe('Duplicate Error Handling', () => {
        let nowMock;

        beforeEach(() => {
            // Mock Date.now
            nowMock = jest.spyOn(Date, 'now').mockReturnValue(1000);
            Logger = require('../../src/utils/Logger');
        });

        afterEach(() => {
            nowMock.mockRestore();
        });

        it('should not log duplicate errors within 5 minutes', () => {
            const error = new Error('Duplicate error');
            
            Logger.error('First error', error);
            Logger.error('Second error', error);
            
            expect(mockLoggerInstance.error).toHaveBeenCalledTimes(1);
        });

        it('should log same error after cleanup', () => {
            const error = new Error('Test error');
            
            // First error at t=1000
            Logger.error('First error', error);
            
            // Advance time by 6 minutes (360000ms)
            nowMock.mockReturnValue(361000);
            
            Logger.cleanupOldErrors();
            Logger.error('Second error', error);
            
            expect(mockLoggerInstance.error).toHaveBeenCalledTimes(2);
        });
    });

    describe('Command and Event Logging', () => {
        beforeEach(() => {
            Logger = require('../../src/utils/Logger');
        });

        it('should log command execution', () => {
            const command = { name: 'test' };
            const user = { id: '123', tag: 'user#1234' };
            const guild = { id: '456', name: 'Test Guild' };

            Logger.logCommand(command, user, guild, true);

            expect(mockLoggerInstance.info).toHaveBeenCalledWith('Command Executed', {
                command: 'test',
                user: { id: '123', tag: 'user#1234' },
                guild: { id: '456', name: 'Test Guild' },
                success: true
            });
        });

        it('should log events', () => {
            const eventName = 'testEvent';
            const eventData = { test: true };

            Logger.logEvent(eventName, eventData);

            expect(mockLoggerInstance.debug).toHaveBeenCalledWith('Event Triggered', {
                event: eventName,
                data: eventData
            });
        });
    });
});