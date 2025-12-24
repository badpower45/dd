/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    roots: ['<rootDir>/server', '<rootDir>/client'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        'server/**/*.ts',
        'client/components/**/*.tsx',
        'client/lib/**/*.ts',
        '!**/__tests__/**',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
};

module.exports = config;
