// React Native's own BackHandler mock (the preset's default lacks addEventListener).
jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  require('react-native/Libraries/Utilities/__mocks__/BackHandler'),
);
