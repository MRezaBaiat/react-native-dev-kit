import AsyncStorage from '@react-native-community/async-storage';
import HashMap from '../objects/HashMap';
import MapManager from '../map/MapManager';

export default class Info {

    static map : HashMap<string, string> = new HashMap();

    static async initialize(keys : string[]) : Promise<void> {
      await this.readFromDB(MapManager.SP_LAST_LOCATION_INDENTIFIER);

      for (const key of keys) {
        await this.readFromDB(key);
      }
    }

    static getLastKnownLocation() {
      if (!this.get(MapManager.SP_LAST_LOCATION_INDENTIFIER)) {
        return null;
      }

      const coord = JSON.parse(this.map.get(MapManager.SP_LAST_LOCATION_INDENTIFIER));

      return {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      };
    }

    static get(key : string) : string {
      if (!Info.map.containsKey(key)) {
        return null;
      }
      return Info.map.get(key);
    }

    static set(key : string, value : string) {
      Info.map.put(key, value);
      if (value === 'undefined' || value === null) {
        AsyncStorage.removeItem(key);
      } else {
        AsyncStorage.setItem(key, value);
      }
    }

    static async readFromDB(key : string) : Promise<void> {
      const value = await AsyncStorage.getItem(key);
      Info.map.put(key, value);
    }
}
