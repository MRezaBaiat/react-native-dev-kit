import { StyleSheet } from 'react-native';

export default class ShadowUtils {

  static getShadowStyle(radius : number) {
    return {
      elevation: radius,
      shadowColor: '#757575',
      shadowOpacity: 0.8,
      shadowRadius: radius,
      shadowOffset: {
        height: radius,
        width: radius,
      },
    };

  }

}
