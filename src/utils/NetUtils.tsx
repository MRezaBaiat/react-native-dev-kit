import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import {
  NetInfoState,
} from '@react-native-community/netinfo/src/internal/types';
import ArrayList from '../objects/ArrayList';

let isNetworkConnected = false;
let connectionType: NetInfoStateType.unknown | NetInfoStateType.none | NetInfoStateType.cellular | NetInfoStateType.wifi | NetInfoStateType.bluetooth | NetInfoStateType.ethernet | NetInfoStateType.wimax | NetInfoStateType.vpn | NetInfoStateType.other = NetInfoStateType.none;

export default class NetUtils {

    static initialized = false;

    static listeners = new ArrayList<(isConnected : boolean) => void>();

    static init() {

      if (this.initialized) {
        return;
      }

      this.initialized = true;

      NetInfo.addEventListener((connInfo: NetInfoState) => {
        const isNowConnected = connInfo.isConnected;
        connectionType = connInfo.type;

        if (isNowConnected === isNetworkConnected) {
          return;
        }

        isNetworkConnected = isNowConnected;

        for (const listener of this.listeners) {
          try {
            listener(isNetworkConnected);
          } catch (e) {
            console.log(e);
          }
        }
      });

      NetUtils.listenIsConnected(((isConnected) => {
        isNetworkConnected = isConnected;
      }));
    }

    static listenIsConnected(listener: (isConnected : boolean) => void) {

      NetInfo.fetch().then((res) => {
        listener(res.isConnected);
      });
    }

    static isConnected() {
      return isNetworkConnected;
    }

    static getConnectionType(): NetInfoStateType.unknown | NetInfoStateType.none | NetInfoStateType.cellular | NetInfoStateType.wifi | NetInfoStateType.bluetooth | NetInfoStateType.ethernet | NetInfoStateType.wimax | NetInfoStateType.vpn | NetInfoStateType.other {
      return connectionType;
    }

    static addListener(listener : (isConnected : boolean)=>void) {
      this.listeners.add(listener);
    }

    static removeListener(listener : (isConnected : boolean)=>void) {
      this.listeners.removeValue(listener);
    }


}
