const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const ChannelSubscription = require('../../database/models/ChannelSubscription');
const channelSchema = require('../../database/models/Channel');
const { ActionRowBuilder } = require('@discordjs/builders');
const ChannelSelect = require('../../components/selectMenus/ChannelSelect');
const ChannelSelectButton = require('../../components/buttons/ChannelSelectButton');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe a channel to receive feed updates.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to subscribe')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply({
                content: 'This command can only be used in a server.',
                flags: ['Ephemeral']
            });
        }

        interaction.client.logger.debug('All feeds:',
            Array.from(interaction.client.feeds.values())
                .map(f => ({
                    label: f.name,
                    value: f.id,
                    description: `Subscribe to ${f.name}`
                }))
        );

        if (!interaction.client.feeds.size) {
            return await interaction.reply({
                content: 'No feeds available to subscribe to.',
                flags: ['Ephemeral']
            });
        }

        interaction.client.logger.debug('All channels:',
            Array.from(interaction.guild.channels.cache.values())
                .map(c => ({
                    name: c.name,
                    type: c.type
                }))
        );

        const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);

        if (!textChannels.size) {
            return await interaction.reply({
                content: 'No text channels available to subscribe to.',
                flags: ['Ephemeral']
            });
        }

        const existingSubscriptions = await ChannelSubscription.find({
            guildId: interaction.guildId,
            channelId: interaction.options.getChannel('channel').id
        });

        if (existingSubscriptions.length) {
            return await interaction.reply({
                content: 'This channel is already subscribed to feeds.',
                flags: ['Ephemeral']
            });
        }

        const channel = interaction.options.getChannel('channel');
        const selectMenu = ChannelSelect.initialize(interaction.client.feeds);
        const buttonRow = ChannelSelectButton.initialize();

        await interaction.reply({
            content: `Setting up feed subscriptions for ${channel}. Select the feeds you want to subscribe to:`,
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                buttonRow
            ],
            flags: ['Ephemeral']
        });

        await interaction.client.services.cache.set(
            `feedsetup:${interaction.guildId}`,
            {
                userId: interaction.user.id,
                channelId: channel.id,
                selectedChannels: []
            },
            300
        );
    }
};