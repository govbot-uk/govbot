const mongoose = require('mongoose');

const channelSubscriptionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    feeds: [{ type: String, required: true }]
});

module.exports = mongoose.model('ChannelSubscription', channelSubscriptionSchema);
