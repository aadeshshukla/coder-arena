module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/shared'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'server/src/**/*.ts',
    'shared/**/*.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
