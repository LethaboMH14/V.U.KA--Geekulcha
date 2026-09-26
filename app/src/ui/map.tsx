/**
 * The guardian's map of an alert (ADR-0048, PROPOSED): a pin at the member's
 * last fix, its accuracy circle and the short trail. MapLibre GL JS is
 * bundled in the app (android_asset/map, BSD-3-Clause): no remote code. Map
 * tiles come from OpenFreeMap, which sees the map area requested (named in
 * the guardian's consent). "Open in Maps" hands the point to the phone's own
 * maps app.
 */
import React, {useEffect, useRef} from 'react';
import {Linking, Platform, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import type {GuardianAlert} from '../api/device';
import {Key} from './components';
import {colors, radii, space, type} from './theme';

type Loc = NonNullable<GuardianAlert['location']>;

const deg = (e7: number) => (e7 / 1e7).toFixed(6);

export function openInMaps(loc: Loc, label: string) {
  const lat = deg(loc.last.lat_e7);
  const lon = deg(loc.last.lon_e7);
  const url =
    Platform.OS === 'android'
      ? `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(label)})`
      : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  void Linking.openURL(url).catch(() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`));
}

export function AlertMap({loc, who}: {loc: Loc; who: string}) {
  const view = useRef<WebView>(null);
  const ready = useRef(false);
  const payload = JSON.stringify(loc);
  const push = () => view.current?.injectJavaScript(`window.vukaShow && window.vukaShow(${payload}); true;`);
  useEffect(() => {
    if (ready.current) push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);
  return (
    <View style={{marginTop: space.md}}>
      <View style={styles.frame} accessible accessibilityLabel={`Map of where ${who}'s phone was last seen`}>
        {Platform.OS === 'android' ? (
          <WebView
            ref={view}
            source={{uri: 'file:///android_asset/map/index.html'}}
            originWhitelist={['file://*', 'https://*']}
            allowFileAccess
            javaScriptEnabled
            onLoadEnd={() => {
              ready.current = true;
              push();
            }}
            style={{backgroundColor: colors.bgBase}}
          />
        ) : (
          <Text style={[type.caption, {padding: space.md}]}>The map shows on the phone.</Text>
        )}
      </View>
      <Key label="Open in Maps" variant="guardianPlain" arrow onPress={() => openInMaps(loc, who)} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {height: 240, borderRadius: radii.md, overflow: 'hidden', marginBottom: space.sm, backgroundColor: colors.bgBase},
});
