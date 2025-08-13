module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFiles: ['./jest.setup.backend.js'],
  testMatch: ['**/server/**/*.test.js'],
};
