import RNFetchBlob, { RNFetchBlobStat } from 'rn-fetch-blob';
import fileType from 'react-native-file-type';

const RNFS = require('react-native-fs');

export default class File {

    static dirs = RNFetchBlob.fs.dirs;

    filePath : string;

    constructor(filePath : string) {
      this.filePath = filePath;
    }

    public stats() : Promise<RNFetchBlobStat> {
      return RNFetchBlob.fs.stat(this.filePath);
    }

    size() : Promise<number|void> {
      return RNFetchBlob.fs.stat(this.filePath)
        .then((stats) => (stats.size ? Number.parseInt(stats.size) : -1))
        .catch((err) => {
          return -1;
        });
    }

    lastModified() : Promise<number|void> {
      return RNFetchBlob.fs.stat(this.filePath)
        .then((stats) => (stats.lastModified ? Number.parseInt(stats.lastModified) : -1))
        .catch((err) => {
        });
    }

    move(to : File) : Promise<void> {
      return RNFS.moveFile(this.filePath, to.filePath);
    }

    mkdirs() : Promise<void> {
      return RNFS.mkdir(this.filePath);
    }

    delete() {
      return this.exists().then((result : boolean) => {

        if (result) {
          return RNFS.unlink(this.filePath)
          // `unlink` will throw an error, if the item to unlink does not exist , so we catch it
            .catch((err : Error) => {

            });
        }
        return null;
      })
        .catch((err) => {
        });
    }

    exists() : Promise<boolean> {
      return RNFS.exists(this.filePath);
    }

    getAbsolutePath() : string {
      return this.filePath;
    }

    public async mimeTypeAndExtension() : Promise<{mime : string, extension : string}> {

      return fileType(this.filePath).then((type : any) => {
        if (!type) {
          const path = this.filePath.toLowerCase();
          if (path.endsWith('mp3')) {
            return { mime: 'audio/mp3', extension: 'mp3' };
          }
          if (path.endsWith('wav')) {
            return { mime: 'audio/wav', extension: 'wav' };
          }

          return { mime: null, extension: path.substr(path.lastIndexOf('.')) };
        }
        return { mime: type.mime, extension: type.ext };
      }).catch((err : Error) => null as any);
    }
}
