const isEqual = require('react-fast-compare');

export default class EqualUtils {

  public static isDeepEqual(object1 : any, object2 : any) {
    return isEqual(object1, object2);
  }

}
