const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { afterEach } = require('node:test');

let mongod;

// Connect to in-memory database before running any tests
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

// Clear the database between each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

// Disconnect and close after all tests are done
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});