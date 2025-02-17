const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    channelId: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    guildId: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    feeds: {
        type: [String],
        index: true,
        default: []
    }
});

module.exports = mongoose.model('Channel', channelSchema);