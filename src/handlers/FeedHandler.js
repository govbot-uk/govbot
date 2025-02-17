const apiService = require('../services/ApiService');

class FeedHandler {
    constructor(client) {
        this.client = client;
        this.feedsMap = {};
    }

    async loadFeeds() {
        try {
            const baseUrl = this.client.config.api.baseUrl;
            const response = await apiService.getRaw(`${baseUrl}/feeds`);
            
            if (response.status !== 200) {
                throw new Error(`Failed to load feeds: ${response.status}`);
            }

            const feeds = Object.values(response.data);
            this.client.feeds = new Map(feeds.map(feed => [feed.id, feed]));
            this.client.logger.info(`Loaded ${feeds.length} feeds`);
        } catch (error) {
            this.client.logger.error('Error loading feeds:', error);
            throw error;
        }
    }
}

module.exports = FeedHandler;