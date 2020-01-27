import React from 'react';
import {
  View,
  Image,
  ImageBackground,
} from 'react-native';
import SmartComponent from '../../views/SmartComponent';
import ImagePersistentCache from './ImagePersistentCache';
import ImageMemoryCache from './ImageMemoryCache';
import ImagesCache, { ImageRequest } from './ImagesCache';

export const defaultImageTypes = ['png', 'jpeg', 'jpg', 'gif', 'bmp', 'tiff', 'tif'];

interface Props {
    source: any,
    defaultSource?: any,
    style?: any,
    resizeMode?: string,
    diskCache?: {duration:number},
    activityIndicator?: JSX.Element,
    onDownloadStarted? : ()=>void,
    onDownloaded?: () => void,
    headers? : { [key: string]: string }
    onError?: (error: Error) => void,
}
export default class CacherImageView extends SmartComponent<Props> {

    static defaultProps = {
      activityIndicator: null as any, // do not show an activity indicator by default
    };

    state={
      source: undefined as string,
    };

    private _useDefaultSource = false;

    private _mounted = false;

    constructor(props : Props) {
      super(props);
      this.state = {
        source: null,
      };
      this._useDefaultSource = false;
    }

    componentDidMount() {
      this._mounted = true;
    }

    componentWillUnmount() {
      this._mounted = false;
    }


    render() {

      if (this.props.source && this.props.source.uri) {
        if (!this.state.source) {

          const request = new ImageRequest(this.props.source.uri, this.props.diskCache, this.props.headers, this.props.onDownloadStarted,
            (filePath : string) => {

              if (this.props.source.uri !== request.url) {
                return;
              }

              setTimeout(() => {
                if (this._mounted) {
                  this.setState({ source: { uri: `file://${filePath}` } });
                } else {
                  // @ts-ignore
                  this.state.source = { uri: `file://${filePath}` };
                }

                this.props.onDownloaded && this.props.onDownloaded();

              }, 0);

            }, (error : Error) => {

              if (this.props.source.uri !== request.url) {
                return;
              }

              // cache failed use original source
              if (this._mounted) {
                this.setState({ source: this.props.source });
              }

              this.props.onError && this.props.onError(error);

            });

          ImagesCache.load(request);
        }
      } else {
        this.state.source = this.props.source;
      }

      if (this.state.source) {

        // @ts-ignore
        const renderImage = (props, children) => (children
          ? <ImageBackground {...props}>{children}</ImageBackground>
          : <Image {...props} />);

        const result = renderImage({
          ...this.props,
          source: this.state.source,
          onError: (error : Error) => {
            // error happened, delete cache
            if (this.props.source && this.props.source.uri) {
              deleteCache(this.props.source.uri);
            }
            if (this.props.onError) {
              this.props.onError(error);
            } else if (!this._useDefaultSource && this.props.defaultSource) {
              this._useDefaultSource = true;
              setTimeout(() => {
                this.setState({ source: this.props.defaultSource });
              }, 0);
            }
          },
        }, this.props.children);

        return (result);
      }
      return (
        <View
          {...this.props}
          style={this.props.style ? [this.props.style, {
            alignItems: 'center',
            justifyContent: 'center',
          }] : { alignItems: 'center', justifyContent: 'center' }}
        >
          {this.props.activityIndicator}
        </View>
      );

    }
}

/**
 * deletes the cache file related to the given raw url
 * @param url
 */
export function deleteCache(url : string) {
  ImagePersistentCache.delete(url);
  ImageMemoryCache.delete(url);
}
