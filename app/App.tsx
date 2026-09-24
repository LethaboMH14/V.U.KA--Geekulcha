/**
 * VIGIL — release-pipeline shell.
 *
 * This build proves the signed-release path only (docs/VUKA-2-SPEC.md §14,
 * D1): no sensing, no network, no product code. The screens are rebuilt in
 * app/src/ui/ from the prototype reference (prototype/).
 */
import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F3EC" />
      <View style={styles.card}>
        <Text style={styles.title}>VIGIL</Text>
        <Text style={styles.body}>
          Release pipeline check. This build has no product features yet.
        </Text>
        <Text style={styles.tag}>SIMULATED · pipeline build 0.0.1</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6F3EC',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E4DFD4',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E2C46',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3B4250',
    marginBottom: 16,
  },
  tag: {
    fontSize: 13,
    color: '#636870',
  },
});

export default App;
