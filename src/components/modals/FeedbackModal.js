const { TextInputStyle } = require('discord.js');
const feedbackSchema = require('../../database/models/Feedback');

module.exports = {
    customId: 'feedback-modal',
    
    create(options = {}) {
        return {
            title: 'Submit Feedback',
            custom_id: `feedback-modal${options.suffix ? `:${options.suffix}` : ''}`,
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    custom_id: 'feedback-title',
                    label: 'Title',
                    style: TextInputStyle.Short,
                    placeholder: 'Brief title for your feedback',
                    min_length: 3,
                    max_length: 100,
                    required: true
                }]
            }, {
                type: 1,
                components: [{
                    type: 4,
                    custom_id: 'feedback-description',
                    label: 'Description',
                    style: TextInputStyle.Paragraph,
                    placeholder: 'Detailed feedback...',
                    min_length: 10,
                    max_length: 1000,
                    required: true
                }]
            }]
        };
    },

    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('feedback-title');
        const description = interaction.fields.getTextInputValue('feedback-description');

        if (!title || !description) {
            return await interaction.reply({
                content: 'Please fill out all fields.',
                flags: ['Ephemeral']
            });
        }

        await feedbackSchema.create({
            userId: interaction.user.id,
            title,
            feedback: description
        });
        
        await interaction.reply({
            content: 'Thank you for your feedback!',
            flags: ['Ephemeral']
        });
    }
};