/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerKeepAlive} from './src/sensors/location';

AppRegistry.registerComponent(appName, () => App);
// Keeps timers running in the background for the location window and a guardian's standby.
registerKeepAlive();
