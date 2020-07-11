import RNFetchBlob from 'rn-fetch-blob';
import ImagePersistentCache from './ImagePersistentCache';
import ImageMemoryCache from './ImageMemoryCache';
import HashMap from '../../objects/HashMap';
import { defaultImageTypes } from './CacherImageView';

const SHA1 = require('js-sha1');

const tempsCacheDir = `${RNFetchBlob.fs.dirs.CacheDir}/TempImages/`;

RNFetchBlob.fs.unlink(tempsCacheDir);
RNFetchBlob.fs.mkdir(tempsCacheDir);


export default class ImagesCache {

    private static underDownloadsMap = new HashMap<string, ImageRequest[]>();

    public static load(request : ImageRequest) {

      if (!request.url || request.url.toString() !== request.url) {
        request.onFail && request.onFail(Error('no url.'));
        return;
      }

      ImagePersistentCache.get(request.url, request.diskCache ? request.diskCache.duration : -1).then((src) => {

        if (src) {
          request.onSuccess && request.onSuccess(src);
        } else {
          ImageMemoryCache.get(request.url).then((path) => {
            if (path) {
              if (request.diskCache) {
                ImagePersistentCache.save(request.url, path).then((newPath) => {
                  request.onSuccess && request.onSuccess(newPath);
                });
                return;
              }
              request.onSuccess && request.onSuccess(path);
            } else {

              const images = this.underDownloadsMap.get(request.url);
              if (images) {
                images.push(request);
                return;
              }
              this.underDownloadsMap.put(request.url, [request]);
              request.onDownloading && request.onDownloading();
              this.queueDownload(request.url, request.headers);

            }
          });
        }
      });

    }


    private static queueDownload(url : string, headers : { [key: string]: string }) {

      const tempCacheFile = this._getTempFilename(url);
      this._unlinkFile(tempCacheFile);
      RNFetchBlob.config({
        // response data will be saved to this path if it has access right.
        path: tempCacheFile,
        timeout: 7000,
      })
        .fetch(
          'GET',
          url,
          headers,
        )
        .then(async (res) => {

          if (res && res.respInfo && res.respInfo.headers && !res.respInfo.headers['Content-Encoding'] && !res.respInfo.headers['Transfer-Encoding'] && res.respInfo.headers['Content-Length']) {
            const expectedContentLength = res.respInfo.headers['Content-Length'];
            let actualContentLength;

            try {
              const fileStats = await RNFetchBlob.fs.stat(res.path());

              if (!fileStats || !fileStats.size) {
                throw new Error(`FileNotFound:${url}`);
              }

              actualContentLength = fileStats.size;
            } catch (error) {
              throw new Error(`DownloadFailed:${url}`);
            }

            if (expectedContentLength !== actualContentLength) {
              throw new Error(`DownloadFailed:${url}`);
            }
          }

          const requests = this.underDownloadsMap.get(url);
          this.underDownloadsMap.remove(url);

          for (const rq of requests) {
            if (rq.diskCache) {
              ImagePersistentCache.save(url, tempCacheFile).then((path) => {
                for (const request of requests) {
                  request.onSuccess(path);
                }
              });
              return;
            }
          }

          ImageMemoryCache.save(url, tempCacheFile).then((path) => {
            for (const rq of requests) {
              rq.onSuccess(path);
            }
          });
        })
        .catch(async (error) => {
          this._unlinkFile(tempCacheFile);
          const requests = this.underDownloadsMap.get(url);
          this.underDownloadsMap.remove(url);
          for (const rq of requests) {
            rq.onFail(error);
          }
        });
    }

    private static _getTempFilename(url : string) {

      if (!url || url.toString() !== url) return '';

      let ext = url.replace(/.+\./, '').toLowerCase();
      if (defaultImageTypes.indexOf(ext) === -1) ext = 'png';
      const hash = SHA1(url);
      return `${tempsCacheDir + hash}.${ext}.tmp`;
    }

    private static async _unlinkFile(file : string): Promise<void> {
      return await RNFetchBlob.fs.unlink(file);
    }
}


export class ImageRequest {

    public url : string;
    public onSuccess : (filePath : string)=>void;
    public onFail : (error : Error)=>void;
    public onDownloading : ()=>void;
    public diskCache : {duration : number};
    public headers : { [key: string]: string };

    public constructor(url : string, diskCache : {duration : number}, headers : { [key: string]: string }, onDownloading : ()=>void, onSuccess : (filePath : string)=>void, onFail : (error : Error)=>void) {
      this.url = url;
      this.onSuccess = onSuccess;
      this.onFail = onFail;
      this.onDownloading = onDownloading;
      this.diskCache = diskCache;
      this.headers = headers;
    }

}
