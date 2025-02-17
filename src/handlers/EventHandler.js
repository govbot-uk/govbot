const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/Logger");

class EventHandler {
    constructor(client) {
        this.client = client;
        this.events = new Map();
    }

    async loadEvents() {
        try {
            const eventsPath = path.join(__dirname, "..", "events");
            const eventFolders = await fs.readdir(eventsPath);

            for (const folder of eventFolders) {
                const folderPath = path.join(eventsPath, folder);
                const stat = await fs.stat(folderPath);
                
                if (!stat.isDirectory()) continue;

                const eventFiles = (await fs.readdir(folderPath))
                    .filter(file => file.endsWith(".js"));

                for (const file of eventFiles) {
                    const filePath = path.join(folderPath, file);
                    delete require.cache[require.resolve(filePath)];
                    const event = require(filePath);

                    if (event.once) {
                        this.client.once(event.name, (...args) =>
                            this.handleEvent(event, ...args));
                    } else {
                        this.client.on(event.name, (...args) =>
                            this.handleEvent(event, ...args));
                    }

                    this.events.set(event.name, event);
                    logger.debug(`Loaded event: ${event.name}`);
                }
            }

            logger.info(`Loaded ${this.events.size} events`);
        } catch (error) {
            logger.error("Error loading events:", error);
            throw error;
        }
    }

    async handleEvent(event, ...args) {
        try {
            await event.execute(...args);
            logger.logEvent(event.name);
        } catch (error) {
            logger.error(`Error handling event ${event.name}:`, error);
        }
    }
}

module.exports = EventHandler;