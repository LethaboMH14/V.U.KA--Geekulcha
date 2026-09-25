module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // shared/ (the canonicaliser) lives outside app/; resolve its helpers from here.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  // phosphor-react-native and react-native-svg ship untranspiled ES modules.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|phosphor-react-native|react-native-svg)/)',
  ],
};
