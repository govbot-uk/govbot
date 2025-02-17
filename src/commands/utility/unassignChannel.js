const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const ChannelSubscription = require('../../database/models/ChannelSubscription');
const channelSchema = require('../../database/models/Channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Unsubscribe a channel from receiving feed updates.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to unsubscribe')
                .setRequired(true)),
        
    async execute(interaction) {
        if (!interaction.guild) {
            return await interaction.reply({
                content: 'This command can only be used in a server.',
                flags: ['Ephemeral']
            });
        }

        const channel = interaction.options.getChannel('channel');
        const subscription = await ChannelSubscription.findOne({
            guildId: interaction.guildId,
            channelId: channel.id
        });

        if (!subscription) {
            return await interaction.reply({
                content: 'Channel is not subscribed to any feed.',
                flags: ['Ephemeral']
            });
        }

        await ChannelSubscription.deleteOne({ _id: subscription._id });
        await channelSchema.deleteOne({
            _id: subscription.channelId
        });

        await interaction.reply({
            content: `Channel ${channel} has been unsubscribed.`,
            ephemeral: true
        });
    }
};