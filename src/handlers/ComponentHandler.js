const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/Logger');
const ComponentRegistry = require('./ComponentRegistry');
const ComponentBuilders = require('./ComponentBuilders');

class ComponentHandler {
    constructor(client) {
        this.client = client;
        this.buttons = new Map();
        this.selectMenus = new Map();
        this.modals = new Map();
        
        // Initialize registry and builders
        this.registry = new ComponentRegistry();
        this.builders = new ComponentBuilders(this.registry);
    }

    async loadComponents() {
        try {
            const componentsPath = path.join(__dirname, '../components');
            const types = ['buttons', 'selectMenus', 'modals'];

            for (const type of types) {
                const typePath = path.join(componentsPath, type);

                try {
                    const files = await fs.readdir(typePath);

                    for (const file of files) {
                        if (!file.endsWith('.js')) continue;

                        const filePath = path.join(typePath, file);
                        delete require.cache[require.resolve(filePath)];
                        const component = require(filePath);

                        if ('customId' in component && 'execute' in component) {
                            switch (type) {
                                case 'buttons':
                                    this.buttons.set(component.customId, component);
                                    break;
                                case 'selectMenus':
                                    this.selectMenus.set(component.customId, component);
                                    break;
                                case 'modals':
                                    this.modals.set(component.customId, component);
                                    // Register modal with the registry
                                    this.registry.register({
                                        type: 'MODAL',
                                        customId: component.customId,
                                        create: component.create
                                    });
                                    break;
                            }
                            this.client.logger.debug(`Loaded ${type} component: ${component.customId}`);
                        } else {
                            this.client.logger.warn(`Invalid component file structure: ${filePath}`);
                        }
                    }
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        await fs.mkdir(typePath);
                        this.client.logger.debug(`Created ${type} directory`);
                    } else {
                        throw error;
                    }
                }
            }

            this.client.logger.info(
                `Loaded ${this.buttons.size} buttons, ${this.selectMenus.size} select menus, and ${this.modals.size} modals`
            );
        } catch (error) {
            this.client.logger.error('Error loading components:', error);
            throw error;
        }
    }

    async handleButton(interaction) {
        const baseId = interaction.customId.split(':')[0];
        const button = this.buttons.get(baseId);
        
        if (!button) {
            this.client.logger.warn(`Button not found: ${interaction.customId}`);
            return;
        }

        try {
            await button.execute(interaction);
        } catch (error) {
            this.client.logger.error(`Error handling button ${interaction.customId}:`, error);
            await interaction.reply({ 
                content: 'There was an error processing this button!', 
                flags: ['Ephemeral']
            });
        }
    }

    async handleSelectMenu(interaction) {
        const fullId = interaction.customId;
        const baseId = interaction.customId.split(':')[0];
        const menu = this.selectMenus.get(fullId) || this.selectMenus.get(baseId);
        
        if (!menu) {
            this.client.logger.warn(`Select menu not found: ${interaction.customId}`);
            return;
        }

        try {
            await menu.execute(interaction);
        } catch (error) {
            this.client.logger.error(`Error handling select menu ${interaction.customId}:`, error);
            await interaction.reply({ 
                content: 'There was an error processing this selection!', 
                flags: ['Ephemeral']
            });
        }
    }

    async handleModal(interaction) {
        const baseId = interaction.customId.split(':')[0];
        const modal = this.modals.get(baseId);
        
        if (!modal) {
            this.client.logger.warn(`Modal not found: ${interaction.customId}`);
            return;
        }

        try {
            await modal.execute(interaction);
        } catch (error) {
            this.client.logger.error(`Error handling modal ${interaction.customId}:`, error);
            await interaction.reply({ 
                content: 'There was an error processing this form!', 
                flags: ['Ephemeral']
            });
        }
    }
}

module.exports = ComponentHandler;