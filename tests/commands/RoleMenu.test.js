const mongoose = require('mongoose');
const RoleMenu = require('../../src/database/models/RoleMenu');

describe('RoleMenu Model', () => {
    it('should create a new role menu', async () => {
        const validRoleMenu = {
            guildId: '1234567890',
            channelId: '1234567890',
            messageId: '1234567890',
            roles: ['1234567890', '1234567890'],
        };
        
        const roleMenu = await RoleMenu.create(validRoleMenu);

        expect(roleMenu.guildId).toBe(validRoleMenu.guildId);
        expect(roleMenu.channelId).toBe(validRoleMenu.channelId);
        expect(roleMenu.messageId).toBe(validRoleMenu.messageId);
        expect(roleMenu.roles).toEqual(expect.arrayContaining(validRoleMenu.roles));
    });

    it('should fail validation when required fields are missing', async () => {
        const invalidRoleMenu = {
            roles: ['1234567890', '1234567890'],
        };

        await  expect(RoleMenu.create(invalidRoleMenu))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });
});