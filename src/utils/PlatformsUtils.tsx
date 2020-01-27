import { Platform } from 'react-native';

export default class PlatformsUtils {

  static isAndroid() {
    return Platform.OS === 'android';
  }

  static isIOS() {
    return Platform.OS === 'ios';
  }
}
