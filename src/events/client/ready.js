const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const RoleMenu = require('../../database/models/RoleMenu');
const RoleSelect = require('../../components/selectMenus/RoleSelect');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.logger.info(`Logged in as ${client.user.tag}`);
        await this.loadModules(client);
    },
    async loadModules(client) {
        try {
            const modulesPath = path.join(__dirname, '..', '..', 'modules', 'ready');
            const moduleFiles = (await fs.readdir(modulesPath))
                .filter(file => file.endsWith('.js'));

            for (const file of moduleFiles) {
                if (!file.endsWith('.js')) continue;

                try {
                    const filePath = path.join(modulesPath, file);
                    delete require.cache[require.resolve(filePath)];
                    const module = require(filePath);

                    if ('initialize' in module) {
                        await module.initialize(client);
                        client.logger.debug(`Loaded module: ${file}`);
                    } else {
                        client.logger.warn(`Invalid module file structure: ${filePath}`);
                    }
                } catch (error) {
                    client.logger.error(`Error loading module: ${file}`, error);
                    throw error;
                }
            }
        } catch (error) {
            client.logger.error('Error loading modules:', error);
            throw error;
        }
    }
};