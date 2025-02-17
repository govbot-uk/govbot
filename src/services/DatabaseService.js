const mongoose = require('mongoose');
const logger = require('../utils/Logger');
const { database } = require('../../config');

class DatabaseService {
    constructor(cacheService) {
        if (!cacheService) {
            throw new Error('CacheService must be provided to DatabaseService');
        }
        this.cache = cacheService;
        this.options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            tls: true,
            tlsCAFile: database.sslCA,
            tlsCertificateKeyFile: database.sslCert,
        };

        mongoose.connection.on('connected', () => {
            logger.info('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        process.on('SIGINT', this.cleanup.bind(this));
        process.on('SIGTERM', this.cleanup.bind(this));
    }

    async connect() {
        try {
            await mongoose.connect(database.uri, this.options);
            return true;
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async findById(model, id, useCache = true) {
        try {
            if (useCache) {
                const cached = await this.cache.get(id, model.modelName);
                if (cached) return cached;
            }

            const document = await model.findById(id);
            if (document && useCache) {
                await this.cache.set(id, document, 300, model.modelName);
            }

            return document;
        } catch (error) {
            logger.error(`Error finding ${model.modelName} by ID:`, error);
            throw error;
        }
    }

    async findOne(model, query, useCache = true) {
        try {
            const queryString = JSON.stringify(query);
            if (useCache) {
                const cached = await this.cache.get(queryString, model.modelName);
                if (cached) return cached;
            }

            const document = await model.findOne(query);
            if (document && useCache) {
                await this.cache.set(queryString, document, 300, model.modelName);
            }

            return document;
        } catch (error) {
            logger.error(`Error finding ${model.modelName}:`, error);
            throw error;
        }
    }

    async create(model, data) {
        try {
            const document = new model(data);
            await document.save();
            await this.cache.flush(model.modelName);
            return document;
        } catch (error) {
            logger.error(`Error creating ${model.modelName}:`, error);
            throw error;
        }
    }

    async exists(model, query) {
        try {
            return await model.exists(query);
        } catch (error) {
            logger.error(`Error checking if ${model.modelName} exists:`, error);
            throw error;
        }
    }

    async cleanup() {
        try {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        } catch (error) {
            logger.error('Error during MongoDB cleanup:', error);
            process.exit(1);
        }
    }
}

module.exports = DatabaseService;