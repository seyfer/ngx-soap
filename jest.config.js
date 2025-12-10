module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/e2e/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/projects/ngx-soap/node_modules/'
  ],
  haste: {
    // Avoid naming collision between root and library package.json
    forceNodeFilesystemAPI: true,
    throwOnModuleCollision: false,
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    'projects/**/*.ts',
    '!src/**/*.spec.ts',
    '!projects/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/*.ts'
  ],
  moduleNameMapper: {
    '^ngx-soap$': '<rootDir>/projects/ngx-soap/src/public_api.ts'
  },
  transform: {
    '^.+\\.(ts|js|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],
  testMatch: [
    '**/*.spec.ts'
  ]
};

