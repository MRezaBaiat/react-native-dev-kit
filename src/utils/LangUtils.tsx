
const englishDigits = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const persianMap = persianDigits.split('');

export default class LangUtils {

  static convertToEnglishNumber(input : string) {
    input = String(input);
    // @ts-ignore
    return input.replace(/[\u06F0-\u06F90]/g, (m) => persianDigits.indexOf(m));
  }

  static convertToPersianNumber(input : string) : String {
    input = String(input);
    return input.replace(/\d/g, (m) => persianMap[parseInt(m)]);
  }

  static containsEnglish(s : string) : boolean {
    if (!s) {
      return false;
    }
    s = s.toLowerCase();
    for (const index in englishDigits) {
      if (s.indexOf(englishDigits[index]) !== -1) {
        return true;
      }
    }
    return false;
  }

}
