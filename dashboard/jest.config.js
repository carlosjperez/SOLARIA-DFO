/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '\\.ts$'
    ],
    modulePathIgnorePatterns: ['/node_modules/'],
    transformIgnorePatterns: [
        'node_modules/(?!(@octokit)/)'
    ],
    collectCoverageFrom: [
        'server.js',
        '!node_modules/**'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 30000
};
