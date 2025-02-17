const {
    isValidUrl,
    isValidEmail,
    isValidHexColor,
    isValidUsername,
    isValidDiscordId,
    isValidPermission
} = require('../../src/utils/Validators');

describe('Validators', () => {
    describe('isValidUrl', () => {
        test('should return true for valid URLs', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://localhost:3000')).toBe(true);
        });

        test('should return false for invalid URLs', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        test('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        test('should return false for invalid emails', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
        });
    });

    describe('isValidHexColor', () => {
        test('should return true for valid hex colors', () => {
            expect(isValidHexColor('#123456')).toBe(true);
            expect(isValidHexColor('#abc')).toBe(true);
        });

        test('should return false for invalid hex colors', () => {
            expect(isValidHexColor('123456')).toBe(false);
            expect(isValidHexColor('#12345')).toBe(false);
        });
    });

    describe('isValidUsername', () => {
        test('should return true for valid usernames', () => {
            expect(isValidUsername('user123')).toBe(true);
            expect(isValidUsername('User_123')).toBe(true);
        });

        test('should return false for invalid usernames', () => {
            expect(isValidUsername('ab')).toBe(false);
            expect(isValidUsername('user@123')).toBe(false);
        });
    });

    describe('isValidDiscordId', () => {
        test('should return true for valid Discord IDs', () => {
            expect(isValidDiscordId('123456789012345678')).toBe(true);
            expect(isValidDiscordId('999999999999999999')).toBe(true);
        });

        test('should return false for invalid Discord IDs', () => {
            expect(isValidDiscordId('12345')).toBe(false);
            expect(isValidDiscordId('abcdefghijklmnopqr')).toBe(false);
        });
    });

    describe('isValidPermission', () => {
        test('should return true for valid permissions', () => {
            expect(isValidPermission('SEND_MESSAGES')).toBe(true);
            expect(isValidPermission('BAN_MEMBERS')).toBe(true);
        });

        test('should return false for invalid permissions', () => {
            expect(isValidPermission('invalid_permission')).toBe(false);
            expect(isValidPermission('Send_Messages')).toBe(false);
        });
    });
});
