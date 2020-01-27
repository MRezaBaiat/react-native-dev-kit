import DeviceInfo from 'react-native-device-info';

export default class UUIDUtils {

  static getDeviceUUID() : Promise<string> {
    return DeviceInfo.getUniqueId();
  }

  public static getNextGUID() : string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }
}
