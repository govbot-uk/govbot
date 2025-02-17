const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with using the bot')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to get help for')
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const { commands } = interaction.client.handlers.commands;

        if (!commandName) {
            return this.showCommandCategories(interaction);
        }

        const command = commands.get(commandName);
        if (!command) {
            return interaction.reply({
                content: `❌ Command \`${commandName}\` not found`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ADEF')
            .setTitle(`Command: ${command.data.name}`)
            .addFields(
                { name: 'Description', value: command.data.description },
                { name: 'Category', value: this.getCommandCategory(command) }
            )
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },

    async showCommandCategories(interaction) {
        const commands = Array.from(interaction.client.handlers.commands.commands.values());
        const categories = this.groupCommandsByCategory(commands);
        
        const pages = Object.entries(categories).map(([category, cmds]) => {
            const embed = new EmbedBuilder()
                .setColor('#00ADEF')
                .setTitle(`${this.getCategoryEmoji(category)} ${category} Commands`)
                .setTimestamp();

            // Split commands into chunks for fields
            const chunks = this.chunkArray(cmds, 6);
            chunks.forEach(chunk => {
                const fieldContent = chunk
                    .map(cmd => `**${cmd.data.name}** - ${this.truncate(cmd.data.description, 60)}`)
                    .join('\n');
                embed.addFields({ name: '\u200B', value: fieldContent });
            });

            return embed;
        });

        if (pages.length === 0) {
            return interaction.reply({
                content: 'No commands available.',
                ephemeral: true
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('help_navigation:prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_navigation:next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await interaction.reply({
            embeds: [pages[0].setFooter({ text: `Page 1/${pages.length}` })],
            components: [row],
            ephemeral: true
        });

        // Store pages in cache for button handling
        await interaction.client.services.cache.set(
            `help:${interaction.user.id}`,
            { pages, currentPage: 0 },
            300 // 5 minutes
        );
    },

    getCommandCategory(command) {
        if (!command.filepath) {
            return 'Unknown';
        }
        const category = path.basename(path.dirname(command.filepath));
        return category.charAt(0).toUpperCase() + category.slice(1);
    },

    groupCommandsByCategory(commands) {
        return commands.reduce((acc, cmd) => {
            const category = this.getCommandCategory(cmd);
            if (!acc[category]) acc[category] = [];
            acc[category].push(cmd);
            return acc;
        }, {});
    },

    getCategoryEmoji(category) {
        const emojis = {
            'Information': 'ℹ️',
            'Utility': '🛠️',
            'Assistance': '🤝',
            'Admin': '⚡',
            'Configuration': '⚙️'
        };
        return emojis[category] || '📁';
    },

    truncate(str, length) {
        return str.length > length ? `${str.substring(0, length - 3)}...` : str;
    },

    chunkArray(array, size) {
        return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
            array.slice(i * size, i * size + size)
        );
    }
};
