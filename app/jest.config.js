module.exports = {
  preset: 'react-native',
  // phosphor-react-native and react-native-svg ship untranspiled ES modules.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|phosphor-react-native|react-native-svg)/)',
  ],
};
