/**
 * Smoke test: the app renders, effects run inside act, and it unmounts cleanly.
 */
import 'react-native';
import React from 'react';
import App from '../App';
import renderer, {act} from 'react-test-renderer';

it('renders and unmounts cleanly', async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(<App />);
  });
  expect(tree!.toJSON()).toBeTruthy();
  await act(async () => {
    tree!.unmount();
  });
});
