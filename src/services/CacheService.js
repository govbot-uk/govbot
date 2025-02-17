const NodeCache = require('node-cache');
const logger = require('../utils/Logger');

class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 300, // 5 minutes default
            checkperiod: 60,
            useClones: false
        });

        this.cache.on('expired', (key, value) => {
            logger.debug('Cache key expired', { key });
        });
    }

    async get(key, namespace = '') {
        try {
            const fullKey = this._buildKey(key, namespace);
            return this.cache.get(fullKey);
        } catch (error) {
            logger.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = 300, namespace = '') {
        try {
            const fullKey = this._buildKey(key, namespace);
            return this.cache.set(fullKey, value, ttl);
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    async delete(key, namespace = '') {
        try {
            const fullKey = this._buildKey(key, namespace);
            return this.cache.del(fullKey);
        } catch (error) {
            logger.error('Cache delete error:', error);
            return false;
        }
    }

    async flush(namespace = '') {
        try {
            if (namespace) {
                const keys = this.cache.keys().filter(key => key.startsWith(`${namespace}:`));
                keys.forEach(key => this.cache.del(key));
                return true;
            }
            return this.cache.flushAll();
        } catch (error) {
            logger.error('Cache flush error:', error);
            return false;
        }
    }

    async getStats() {
        return {
            keys: this.cache.keys(),
            stats: this.cache.getStats()
        };
    }

    _buildKey(key, namespace) {
        return namespace ? `${namespace}:${key}` : key;
    }
}

module.exports = CacheService;