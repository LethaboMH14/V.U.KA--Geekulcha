/**
 * VIGIL — member app entry.
 *
 * The screens are rebuilt in app/src/ui/ from the prototype reference
 * (prototype/). Data is SIMULATED until the native modules (Keystore signer,
 * foreground service) and the contract v2 client land.
 */
import React from 'react';
import {StatusBar, View} from 'react-native';
import {VigilApp} from './src/ui/screens';
import {colors} from './src/ui/theme';

function App(): React.JSX.Element {
  return (
    <View style={{flex: 1, backgroundColor: colors.bgBase}}>
      {/* Edge to edge: screens draw under the bar and pad by its height. */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <VigilApp />
    </View>
  );
}

export default App;
