const { Collection } = require('discord.js');
const crypto = require('node:crypto');

function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(length = 10) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return {
        days,
        hours,
        minutes,
        seconds,
        toString() {
            const parts = [];
            if (days) parts.push(`${days}d`);
            if (hours) parts.push(`${hours}h`);
            if (minutes) parts.push(`${minutes}m`);
            if (seconds) parts.push(`${seconds}s`);
            return parts.join(' ') || '0s';
        }
    };
}

function paginate(items, page = 1, pageSize = 10) {
    const maxPage = Math.ceil(items.length / pageSize);
    const adjustedPage = Math.min(Math.max(page, 1), maxPage);

    const startIndex = (adjustedPage - 1) * pageSize;

    return {
        currentPage: page,
        maxPage,
        pageSize,
        items: items.slice(startIndex, startIndex + pageSize)
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

module.exports = {
    chunk,
    delay,
    generateId,
    formatDuration,
    paginate,
    randomInt,
    shuffleArray
};