import RNFetchBlob from 'rn-fetch-blob';
import { defaultImageTypes } from './CacherImageView';

const SHA1 = require('crypto-js/sha1');

const cacheDir = `${RNFetchBlob.fs.dirs.CacheDir}/MemoryCacheImages/`;

RNFetchBlob.fs.unlink(cacheDir);
RNFetchBlob.fs.mkdir(cacheDir);

export default class ImageMemoryCache {

  public static async get(url : string) : Promise<string> {
    const cacheFile = this._getCacheFilename(url);
    return await RNFetchBlob.fs.stat(cacheFile)
      .then(() => cacheFile)
      .catch(() => null);// doesnt exist
  }

  public static delete(url : string) : Promise<void> {
    const cacheFile = this._getCacheFilename(url);
    return new Promise((resolve) => {
      RNFetchBlob.fs.unlink(cacheFile)
        .then(resolve)
        .catch(resolve);
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
