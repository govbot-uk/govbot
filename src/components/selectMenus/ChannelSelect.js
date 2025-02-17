const { StringSelectMenuBuilder } = require("@discordjs/builders");
const { initialize } = require("./RoleSelect");

module.exports = {
    customId: 'feeds:select',
    initialize(feeds) {
        return new StringSelectMenuBuilder()
            .setCustomId(this.customId)
            .setPlaceholder('Select feeds to subscribe to')
            .setMinValues(1)
            .setMaxValues(feeds.size)
            .addOptions(
                Array.from(feeds.values()).map(feed => ({
                    label: feed.name,
                    value: feed.id,
                    description: `Subscribe to ${feed.name}`
                }))
            );
    },
    async execute(interaction) {
        interaction.client.logger.debug('ChannelSelect executing with data:', {
            customId: interaction.customId,
            values: interaction.values
        });

        const priorData = await interaction.client.services.cache.get(
            `feedsetup:${interaction.guildId}`
        );

        if (!priorData || priorData.userId !== interaction.user.id) {
            return await interaction.reply({
                content: 'This channel setup session has expired or belongs to another user.',
                flags: ['Ephemeral']
            });
        }

        priorData.selectedChannels = interaction.values;
        await interaction.client.services.cache.set(
            `feedsetup:${interaction.guildId}`,
            priorData,
            300
        );

        await interaction.update({
            content: `Selected ${interaction.values.length} channels. Click Confirm to create the menu or Cancel to abort.`
        });
    }
};