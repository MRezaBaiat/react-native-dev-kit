export default class PhoneUtils {

    private static matcher = /[\\+]?[0-9.-]+/;

    public static isPhoneNumberValid(phoneNumber : string) : boolean {
      return this.matcher.test(phoneNumber);
    }

    public static convertPhoneIfNeeded(phoneNumber : string) : string {

      if (!phoneNumber || phoneNumber === '' || phoneNumber.length < 11) {
        return null;
      }

      try {
        phoneNumber = phoneNumber.replace('\\+', '').replace(' ', '').replace('\\-', '');

        if (!this.isPhoneNumberValid(phoneNumber)) {
          return null;
        }

        const phoneId = this.extractCodelessPhoneNumber(phoneNumber);
        let areaCode = this.extractPhoneNumberAreaCode(phoneNumber);

        if (areaCode === '' || areaCode === '0') {
          areaCode = '98';
        }

        return areaCode + phoneId;

      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public static extractCodelessPhoneNumber(phoneNumber : string) : string {
      return phoneNumber.substring(phoneNumber.length - 10, phoneNumber.length);
    }

    public static extractPhoneNumberAreaCode(phoneNumber : string) : string {
      const phoneId = this.extractCodelessPhoneNumber(phoneNumber);
      const areaCode = phoneId.length === phoneNumber.length ? '' : phoneNumber.substring(0, phoneNumber.length - 10);
      return areaCode.length > 3 ? '' : areaCode;
    }

}
