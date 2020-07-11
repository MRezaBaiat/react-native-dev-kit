import { Dimensions, ViewStyle } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const { width, height } = Dimensions.get('window');

/*
	fully visible

	100% - FF
	95% - F2
	90% - E6
	85% - D9
	80% - CC
	75% - BF
	70% - B3
	65% - A6
	60% - 99
	55% - 8C
	50% - 80
	45% - 73
	40% - 66
	35% - 59
	30% - 4D
	25% - 40
	20% - 33
	15% - 26
	10% - 1A
	5% - 0D
	0% - 00

	invisible
	*/

export default class ViewUtils {

  static getScreenWidth() {
    return width;
  }

  static getScreenHeight() {
    return height - this.getStatusbarHeight();
  }

  static getStatusbarHeight() {
    return getStatusBarHeight();
  }

  public static safeAssignStyles = (style: object | object[], ...toAdd:(object | object[])[]):ViewStyle => {
    const newStyle = {};
    if (Array.isArray(style)) {
      style.forEach((st) => {
        Object.assign(newStyle, st);
      });
    } else {
      Object.assign(newStyle, style);
    }

    if (!toAdd) {
      return newStyle;
    }

    toAdd.forEach((star) => {
      if (Array.isArray(star)) {
        star.forEach((st) => {
          Object.assign(newStyle, st);
        });
      } else {
        Object.assign(newStyle, star);
      }
    });
    return newStyle;
  }
}
