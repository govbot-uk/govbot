module.exports = {
    customId: 'pagination',

    async execute(interaction) {
        const [_, action, currentPage, maxPages] = interaction.customId.split(':');
        const page = parseInt(currentPage);
        const max = parseInt(maxPages);

        // Calculate new page
        let newPage = action === 'next' ? page + 1 : page - 1;
        newPage = Math.max(1, Math.min(newPage, max));

        // Get cached pagination handler
        const cacheKey = `pagination:${interaction.message.id}`;
        const handlerData = await interaction.client.services.cache.get(cacheKey);

        if (!handlerData) {
            await interaction.reply({
                content: 'This pagination has expired. Please run the command again.',
                flags: ['Ephemeral']
            });
            return;
        }

        // Execute the stored handler function
        try {
            // The handler should be a function that returns the page data
            const pageData = await handlerData.handler(newPage, handlerData.data);
            await interaction.update(pageData);
            
            // Update cache with new page number
            handlerData.currentPage = newPage;
            await interaction.client.services.cache.set(cacheKey, handlerData, 300);
        } catch (error) {
            interaction.client.logger.error('Error handling pagination:', error);
            await interaction.reply({
                content: 'An error occurred while updating the page.',
                flags: ['Ephemeral']
            });
        }
    }
};