const { delay, chunk, generateId, formatDuration, paginate, randomInt, shuffleArray } = require('../../src/utils/Helpers');

describe('Helpers', () => {
    it('should split into chunks', () => {
        const array = Array.from({ length: 100 }, (_, i) => i);
        const chunks = chunk(array, 10);

        expect(chunks).toHaveLength(10);
        for (const chunk of chunks) {
            expect(chunk).toHaveLength(10);
        }
    });

    it('should delay for the specified time', async () => {
        const start = Date.now();
        await delay(1000);
        const end = Date.now();

        expect(end - start).toBeGreaterThanOrEqual(1000);
    });

    it('should generate a random id of set length', () => {
        const id = generateId(10);

        // check it returns a hex string
        expect(id).toMatch(/^[0-9a-f]+$/);

        // check it returns the correct length
        expect(id).toHaveLength(10);
    });

    it('should format a duration', () => {
        const duration = formatDuration(123456789);

        expect(duration.days).toBe(1);
        expect(duration.hours).toBe(10);
        expect(duration.minutes).toBe(17);
        expect(duration.seconds).toBe(36);
        expect(duration.toString()).toBe('1d 10h 17m 36s');
    });

    it('should paginate items', () => {
        const items = Array.from({ length: 100 }, (_, i) => i);
        const paginated = paginate(items, 3, 10);

        expect(paginated.currentPage).toBe(3);
        expect(paginated.maxPage).toBe(10);
        expect(paginated.pageSize).toBe(10);
        expect(paginated.items).toHaveLength(10);
        expect(paginated.items[0]).toBe(20);
        expect(paginated.items[9]).toBe(29);
    });

    it('should generate a random integer between min and max', () => {
        const min = 5;
        const max = 10;
        const random = randomInt(min, max);
        
        // check random is within the range
        expect(random).toBeGreaterThanOrEqual(min);
        expect(random).toBeLessThanOrEqual(max);
    });

    it('should shuffle an array', () => {
        const array = Array.from({ length: 100 }, (_, i) => i);
        const shuffled = shuffleArray(array);

        expect(shuffled).toHaveLength(100);
        expect(shuffled).not.toEqual(array);
        expect(shuffled).toEqual(expect.arrayContaining(array));
    });
});