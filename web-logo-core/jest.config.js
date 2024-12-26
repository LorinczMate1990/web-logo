module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.test.ts'], // Only run tests from the dist folder
    transform: {
      '^.+\\.ts$': 'ts-jest', // Transpile TypeScript files
    },
    moduleFileExtensions: ['ts', 'js'],
    clearMocks: true,
  };