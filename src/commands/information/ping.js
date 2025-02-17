// src/commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns the bot and API latency'),
    /**
    * Execute the command logic
    * @param {*} interaction
    * @return {Promise<void>}
    */
    async execute(interaction) {
        try {
            await interaction.reply('Pinging...');

            try {
                const sent = await interaction.fetchReply();
                const latency = sent.createdTimestamp - interaction.createdTimestamp;
                const apiLatency = interaction.client.ws.ping;

                await interaction.editReply({
                    content: `Bot Latency: ${latency}ms\nAPI Latency: ${apiLatency}ms`
                });
            } catch (error) {
                interaction.client.logger?.error('Error checking latency:', error);
                if (interaction.replied) {
                    await interaction.editReply({
                        content: 'An error occurred while checking latency.'
                    });
                }
            }
        } catch (error) {
            interaction.client.logger?.error('Error in ping command:', error);
            await interaction.reply({
                content: 'An error occurred while checking latency.',
                ephemeral: true
            });
        }
    }
};