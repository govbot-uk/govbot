const axios = require('axios');
const logger = require('../utils/Logger');
const CacheService = require('../services/CacheService');

class APIService {
    static instance = null;

    static getInstance() {
        if (!APIService.instance) {
            APIService.instance = new APIService();
        }
        return APIService.instance;
    }

    constructor() {
        if (APIService.instance) {
            return APIService.instance;
        }

        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': `${process.env.npm_package_name}/${process.env.npm_package_version}`,
            'X-Api-Key': process.env.API_KEY || '' // Added API Key header
        };

        this.axios = axios.create({
            timeout: 10000,
            headers: this.defaultHeaders
        });

        this.cache = new CacheService();
        this.setupInterceptors();
        APIService.instance = this;
    }

    setupInterceptors() {
        this.axios.interceptors.response.use(
            this.handleSuccess.bind(this),
            this.handleError.bind(this)
        );
    }

    setDefaultHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
        this.axios.defaults.headers = this.defaultHeaders;
    }

    mergeOptions(options = {}) {
        return {
            ...options,
            headers: {
                ...this.axios.defaults.headers,
                ...options.headers || {}
            }
        };
    }

    handleSuccess(response) {
        logger.debug('API Request Success', {
            url: response.config.url,
            method: response.config.method,
            status: response.status
        });
        return response;
    }

    handleError(error) {
        logger.error('API Request Error', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            error: error.message
        });
        throw error;
    }

    async get(url, options = {}) {
        const cacheKey = url;
        const cached = await this.cache.get(cacheKey, 'api');
        
        if (cached && !options.bypass) {
            return cached;
        }

        const mergedOptions = this.mergeOptions(options);

        const response = await this.axios.get(url, mergedOptions);
        
        if (options.cache !== false) {
            await this.cache.set(cacheKey, response.data, options.ttl, 'api');
        }

        return response.data;
    }

    async post(url, data, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.post(url, data, mergedOptions);
        return response.data;
    }

    async put(url, data, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.put(url, data, mergedOptions);
        return response.data;
    }

    async delete(url, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.delete(url, mergedOptions);
        return response.data;
    }

    async getRaw(url, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.get(url, mergedOptions);
        return response;
    }

    async postRaw(url, data, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.post(url, data, mergedOptions);
        return response;
    }

    async putRaw(url, data, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.put(url, data, mergedOptions);
        return response;
    }

    async deleteRaw(url, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const response = await this.axios.delete(url, mergedOptions);
        return response;
    }
}

module.exports = APIService.getInstance();