const { createMockInteraction } = require('../utils/testUtils');
const feedbackCommand = require('../../src/commands/assistance/feedback');
const { describe, beforeEach, it, expect } = require('@jest/globals');

describe('Feedback Command', () => {
    let interaction;

    beforeEach(() => {
        const mockClient = createMockInteraction().client;
        mockClient.handlers = {
            components: {
                registry: {
                    create: jest.fn().mockReturnValue({
                        title: 'Submit Feedback',
                        description: 'Please provide your feedback below',
                        custom_id: 'feedback-modal'
                    })
                }
            }
        };

        interaction = createMockInteraction({
            commandName: 'feedback',
            client: mockClient
        });
    });

    it('should show the feedback modal', async () => {
        await feedbackCommand.execute(interaction);
        
        expect(interaction.showModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Submit Feedback',
                description: 'Please provide your feedback below',
                custom_id: 'feedback-modal'
            })
        );
    });
});