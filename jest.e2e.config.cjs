module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/e2e/**/*.test.ts', '**/e2e/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/src/test/fileMock.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2020',
          jsx: 'react-jsx',
          esModuleInterop: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
  clearMocks: true,
  testTimeout: 10000,
};
