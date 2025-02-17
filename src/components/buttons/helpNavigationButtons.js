module.exports = {
    customId: 'help_navigation',
    
    async execute(interaction) {
        const cacheKey = `help:${interaction.user.id}`;
        const cached = await interaction.client.services.cache.get(cacheKey);
        
        if (!cached) {
            return interaction.reply({
                content: 'Help session expired. Please run the help command again.',
                ephemeral: true
            });
        }

        const { pages, currentPage } = cached;
        const action = interaction.customId.split(':')[1];
        const newPage = action === 'next'
            ? (currentPage + 1) % pages.length
            : (currentPage - 1 + pages.length) % pages.length;

        await interaction.client.services.cache.set(
            cacheKey,
            { pages, currentPage: newPage },
            300
        );

        await interaction.update({
            embeds: [pages[newPage].setFooter({ text: `Page ${newPage + 1}/${pages.length}` })]
        });
    }
};
