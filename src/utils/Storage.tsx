import AsyncStorage from '@react-native-community/async-storage';
import HashMap from '../objects/HashMap';

export default class Storage {

    static map : HashMap<string, string> = new HashMap();

    static async initialize() : Promise<void> {

      const keys = await AsyncStorage.getAllKeys();

      for (const key of keys) {
        await this.readFromDB(key);
      }
    }

    static get(key : string) : string {
      if (!Storage.map.containsKey(key)) {
        return null;
      }
      return Storage.map.get(key);
    }

    static set(key : string, value : string) {
      Storage.map.put(key, value);
      if (value === 'undefined' || value === null) {
        AsyncStorage.removeItem(key);
      } else {
        AsyncStorage.setItem(key, value);
      }
    }

    static remove(key: string) {
      AsyncStorage.removeItem(key);
      Storage.map.remove(key);
    }


    static async readFromDB(key : string) : Promise<void> {
      const value = await AsyncStorage.getItem(key);
      Storage.map.put(key, value);
    }
}
