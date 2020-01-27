import RNFetchBlob from 'rn-fetch-blob';
import FileUtils from '../utils/FileUtils';
import File from '../objects/File';

export default class FileDownloader {

    filePath : string;

    url : string;

    onFileDownloadedListener = (file : File) => {};

    onDownloadFailedListener = () => {};

    constructor(url : string, filePath = `${RNFetchBlob.fs.dirs.CacheDir}/${FileUtils.replaceInvalidFileNameCharacters(url)}`) {
      this.url = url;
      this.filePath = filePath;
    }

    setOnFileDownloadedListener(listener : (file : File)=>void) : FileDownloader {
      this.onFileDownloadedListener = listener;
      return this;
    }

    setOnFailedListener(listener : ()=>void) : FileDownloader {
      this.onDownloadFailedListener = listener;
      return this;
    }

    download() {

      try {
        RNFetchBlob
          .config({
            // response data will be saved to this path if it has access right.
            path: this.filePath,
          })
          .fetch('GET', this.url, {
            // some headers ..
          })
          .then((res) => {
            this.onFileDownloadedListener(new File(res.path()));
          })
          .catch(() => {
            this.onDownloadFailedListener();
          });
      } catch (e) {
        this.onDownloadFailedListener();
      }
    }

}
