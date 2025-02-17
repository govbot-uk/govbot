module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'],
    verbose: false,
    testTimeout: 10000,
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/',
        '/dist/'
    ]
};