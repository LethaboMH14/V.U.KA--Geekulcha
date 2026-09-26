// React Native's own BackHandler mock (the preset's default lacks addEventListener).
jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  require('react-native/Libraries/Utilities/__mocks__/BackHandler'),
);

// The blur view is native; in tests it is a plain view.
jest.mock('@react-native-community/blur', () => {
  const {View} = require('react-native');
  return {BlurView: View};
});
jest.mock('react-native-webview', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {WebView: React.forwardRef((props, ref) => React.createElement(View, props))};
});
