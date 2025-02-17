const { createMockInteraction } = require('../utils/testUtils');
const pingCommand = require('../../src/commands/information/ping');

describe('Ping Command', () => {
    let interaction;

    beforeEach(() => {
        interaction = createMockInteraction();
    });

    it('should successfully return latency information', async () => {
        // Execute command
        await pingCommand.execute(interaction);

        // Check initial reply
        expect(interaction.reply).toHaveBeenCalledWith('Pinging...');

        // Check edited reply format
        const editReplyCall = interaction.editReply.mock.calls[0][0];
        expect(editReplyCall.content).toMatch(/Bot Latency: \d+ms\nAPI Latency: \d+ms/);
    });

    it('should handle fetchReply error gracefully', async () => {
        // Set up interaction to show it has been replied to
        interaction.replied = true;
        
        // Mock fetchReply to throw an error
        interaction.fetchReply.mockRejectedValueOnce(new Error('Network error'));
        
        await pingCommand.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith('Pinging...');
        expect(interaction.editReply).toHaveBeenCalledWith({
            content: 'An error occurred while checking latency.'
        });
        expect(interaction.client.logger.error).toHaveBeenCalled();
    });

    it('should handle initial reply error gracefully', async () => {
        // Mock reply to throw an error
        interaction.reply.mockRejectedValueOnce(new Error('Network error'));
        
        await pingCommand.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith({
            content: 'An error occurred while checking latency.',
            ephemeral: true
        });
        expect(interaction.client.logger.error).toHaveBeenCalled();
    });
});
