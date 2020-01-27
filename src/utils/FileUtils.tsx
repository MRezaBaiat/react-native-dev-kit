export default class FileUtils {

    static mReservedChars = ['|', '\\', '?', '*', '<', '"', ':', '>'];

    static replaceInvalidFileNameCharacters(fileName : string) {
      FileUtils.mReservedChars.forEach((c) => {
        fileName = fileName.replace(c, ' ');
      });
      return fileName;
    }

}
