const { 
    ButtonBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ModalBuilder, 
    TextInputBuilder 
} = require('discord.js');

class ComponentBuilders {
    constructor(registry) {
        this.registry = registry;
    }

    button(options) {
        const button = new ButtonBuilder()
            .setCustomId(options.customId)
            .setLabel(options.label)
            .setStyle(options.style);

        if (options.emoji) button.setEmoji(options.emoji);
        if (options.disabled) button.setDisabled(true);

        return button;
    }

    selectMenu(options) {
        return new StringSelectMenuBuilder()
            .setCustomId(options.customId)
            .setPlaceholder(options.placeholder)
            .setOptions(options.options)
            .setMinValues(options.minValues || 1)
            .setMaxValues(options.maxValues || 1)
            .setDisabled(options.disabled || false);
    }

    modal(options) {
        const modal = new ModalBuilder()
            .setCustomId(options.customId)
            .setTitle(options.title);

        if (options.components) {
            modal.addComponents(options.components);
        }

        return modal;
    }

    textInput(options) {
        return new TextInputBuilder()
            .setCustomId(options.customId)
            .setLabel(options.label)
            .setStyle(options.style)
            .setPlaceholder(options.placeholder)
            .setRequired(options.required ?? true)
            .setMinLength(options.minLength || 0)
            .setMaxLength(options.maxLength || 4000);
    }

    actionRow(components) {
        return new ActionRowBuilder().addComponents(components);
    }

    createComponent(type, customId, options = {}) {
        return this.registry.create(type, customId, options);
    }
}

module.exports = ComponentBuilders;