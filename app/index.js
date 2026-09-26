/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerKeepAlive} from './src/sensors/location';
import {registerGuardianBackgroundHandler} from './src/api/push';

// Guardian push (FCM) in the background or with the app closed: must be set
// before the app registers. Does nothing in a build without Firebase.
registerGuardianBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
// Keeps timers running in the background for the location window and a guardian's standby.
registerKeepAlive();
