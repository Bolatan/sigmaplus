module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    'react-dnd': '<rootDir>/__mocks__/react-dnd.js',
    'react-dnd-html5-backend': '<rootDir>/__mocks__/react-dnd-html5-backend.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|dnd-core|@react-dnd))'
  ],
  setupFilesAfterEnv: ['./jest.setup.frontend.js'],
};
