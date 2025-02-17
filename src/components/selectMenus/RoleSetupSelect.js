module.exports = {
    customId: 'rolesetup:select',  // This should match exactly what's in the roles.js command

    async execute(interaction) {
        interaction.client.logger.debug('RoleSetupSelect executing with data:', {
            customId: interaction.customId,
            values: interaction.values
        });

        const setupData = await interaction.client.services.cache.get(
            `rolesetup:${interaction.guildId}`
        );

        if (!setupData || setupData.userId !== interaction.user.id) {
            return await interaction.reply({
                content: 'This setup session has expired or belongs to another user.',
                flags: ['Ephemeral']
            });
        }

        // Store selected roles
        setupData.selectedRoles = interaction.values;
        await interaction.client.services.cache.set(
            `rolesetup:${interaction.guildId}`,
            setupData,
            300
        );

        await interaction.update({
            content: `Selected ${interaction.values.length} roles. Click Confirm to create the menu or Cancel to abort.`
        });
    }
};