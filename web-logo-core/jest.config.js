export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1' // if you're using .js extensions in imports
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  }
};