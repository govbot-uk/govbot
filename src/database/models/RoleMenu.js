const mongoose = require('mongoose');

const roleMenuSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    roles: [{ type: String, required: true }]
}, {
    timestamps: true
});

module.exports = mongoose.model('RoleMenu', roleMenuSchema);
