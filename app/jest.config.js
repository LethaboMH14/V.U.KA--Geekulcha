module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // phosphor-react-native and react-native-svg ship untranspiled ES modules.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|phosphor-react-native|react-native-svg)/)',
  ],
};
