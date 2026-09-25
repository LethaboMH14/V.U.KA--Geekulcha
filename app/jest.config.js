module.exports = {
  preset: 'react-native',
  // The App smoke test renders the whole tree; on a loaded machine (an emulator
  // running) it can pass 5 s, so allow more rather than flake.
  testTimeout: 20000,
  setupFiles: ['<rootDir>/jest.setup.js'],
  // shared/ (the canonicaliser) lives outside app/; resolve its helpers from here.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  // phosphor-react-native and react-native-svg ship untranspiled ES modules.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|phosphor-react-native|react-native-svg)/)',
  ],
};
