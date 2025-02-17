const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ChannelSubscription = require('../../database/models/ChannelSubscription');

module.exports = {
    customId: 'channelselect',

    initialize() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(this.customId + ':confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(this.customId + ':cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );
    },

    async execute(interaction) {
        const [_, action] = interaction.customId.split(':');
        
        const setupData = await interaction.client.services.cache.get(
            `feedsetup:${interaction.guildId}`
        );

        if (!setupData || setupData.userId !== interaction.user.id) {
            return await interaction.reply({
                content: 'This setup session has expired or belongs to another user.',
                flags: ['Ephemeral']
            });
        }

        if (action === 'cancel') {
            await interaction.client.services.cache.delete(`feedsetup:${interaction.guildId}`);
            return await interaction.update({
                content: 'Channel subscription setup cancelled.',
                components: []
            });
        }

        if (action === 'confirm' && setupData.selectedChannels?.length) {
            // Save to database
            await interaction.client.services.database.create(ChannelSubscription, {
                guildId: interaction.guildId,
                channelId: setupData.channelId,
                feeds: setupData.selectedChannels
            });

            await interaction.update({
                content: `Channel has been subscribed to ${setupData.selectedChannels.length} feeds!`,
                components: []
            });

            await interaction.client.services.cache.delete(`feedsetup:${interaction.guildId}`);
        }
    }
};