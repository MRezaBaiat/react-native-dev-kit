import { Permission, PermissionsAndroid, Platform } from 'react-native';

export default class PermissionsManager {

  static async isPermissionGranted(permission : Permission) : Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }
    const granted = await PermissionsAndroid.check(permission);

    return granted;
  }

  // example : PermissionsAndroid.PERMISSIONS.CAMER
  static async requestPermission(permission : Permission) : Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        permission,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

}
