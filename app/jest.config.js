module.exports = {
  preset: 'react-native',
  // phosphor-react-native and react-native-svg ship untranspiled ES modules.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|phosphor-react-native|react-native-svg)/)',
  ],
  // phosphor-react-native 2.1.0's "main" points at lib/commonjs/lib/index.js,
  // which exports only the base Icon. The icon barrel is lib/commonjs/index.js.
  // (Metro reads the package's "react-native" source field and is unaffected.)
  moduleNameMapper: {
    '^phosphor-react-native$': '<rootDir>/node_modules/phosphor-react-native/lib/commonjs/index.js',
  },
};
