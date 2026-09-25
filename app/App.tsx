/**
 * VIGIL — member app entry.
 *
 * The screens are rebuilt in app/src/ui/ from the prototype reference
 * (prototype/). Data is SIMULATED until the native modules (Keystore signer,
 * foreground service) and the contract v2 client land.
 */
import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {VigilApp} from './src/ui/screens';
import {colors} from './src/ui/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.bgBase}}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgBase} />
      <VigilApp />
    </SafeAreaView>
  );
}

export default App;
