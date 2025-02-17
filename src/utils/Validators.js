function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

function isValidDiscordId(id) {
    return /^\d{17,19}$/.test(id);
}

function isValidPermission(permission) {
    return typeof permission === 'string' &&
        permission.toUpperCase() === permission &&
        permission.split('_').every(part => /^[A-Z0-9]+$/.test(part));
}

module.exports = {
    isValidUrl,
    isValidEmail,
    isValidHexColor,
    isValidUsername,
    isValidDiscordId,
    isValidPermission
};