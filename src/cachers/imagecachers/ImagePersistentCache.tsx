import RNFetchBlob from 'rn-fetch-blob';
import { defaultImageTypes } from './CacherImageView';

const SHA1 = require('js-sha1');

const cacheDir = `${RNFetchBlob.fs.dirs.CacheDir}/PersistentCacheImages/`;

RNFetchBlob.fs.exists(cacheDir).then((exists) => {
  !exists && RNFetchBlob.fs.mkdir(cacheDir);
});

export default class ImagePersistentCache {

  public static async get(url : string, duration : number = -1) : Promise<string> {
    const cacheFile = this._getCacheFilename(url);
    return await RNFetchBlob.fs.stat(cacheFile)
      .then((stats) => {

        if (duration !== -1 && (duration + Number(stats.lastModified) <= new Date().getTime())) {
          RNFetchBlob.fs.unlink(cacheFile).then(() => null);
        }

        return cacheFile;
      })
      .catch(() => null); // does not exist
  }

  public static delete(url : string) : Promise<void> {
    const cacheFile = this._getCacheFilename(url);
    return new Promise((resolve) => {
      RNFetchBlob.fs.unlink(cacheFile).then(() => {
        resolve();
      }).catch(() => {
        resolve();
      });
    });
  }

  public static async save(url : string, filePath : string) : Promise<string> {
    const cacheFile = this._getCacheFilename(url);
    return this.delete(url).then(() => RNFetchBlob.fs
      .mv(filePath, cacheFile)
      .then(() => cacheFile)
      .catch(async () => null));
  }

  private static _getCacheFilename(url : string) {

    if (!url || url.toString() !== url) return '';

    let ext = url.replace(/.+\./, '').toLowerCase();
    if (defaultImageTypes.indexOf(ext) === -1) ext = 'png';
    const hash = SHA1(url);
    return `${cacheDir + hash}.${ext}`;
  }
}
