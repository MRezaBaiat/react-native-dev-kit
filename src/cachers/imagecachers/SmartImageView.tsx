import React from 'react';
import { ViewStyle } from 'react-native';
import FastImage, { FastImageSource } from 'react-native-fast-image';
import SmartComponent from '../../views/SmartComponent';
import CacherImageView, { deleteCache } from './CacherImageView';

export {
  deleteCache,
};

export enum SmartImageViewState{
  DOWNLOADING = 'DOWNLOADING',
  LOADED = 'LOADED',
  FAILED = 'FAILED'
}

export interface Props{
  src: number | string,
  resizeMode?: FastImage.ResizeMode,
  style: ViewStyle | ViewStyle[],
  blurRadius? : number,
  fadeDuration? : number,
  diskCache?: {duration : number},
  headers?: { [key: string]: string }
  stateListener?: (state : SmartImageViewState) => void
}
export default class SmartImageView extends SmartComponent<Props> {

  static defaultProps = {
    resizeMode: 'stretch',
  };

  render() {
    const { src,diskCache,headers } = this.props;

    if (typeof src === 'string') {
      if ((src as string).startsWith('http')) {
        return (
            <CacherImageView
                {...this.props}
                onDownloaded={this.createStateChangeFunc(SmartImageViewState.LOADED)}
                onDownloadStarted={this.createStateChangeFunc(SmartImageViewState.DOWNLOADING)}
                onError={this.createStateChangeFunc(SmartImageViewState.FAILED)}
                source={SmartImageView.createUri(src)}
                diskCache={diskCache}
                headers={headers}
            />
        );
      }
      if (this.isBase64(src)) {
        return (
            <FastImage
                {...this.props}
                source={SmartImageView.createBase64(src)}
            />
        );
      }
      return (
          <FastImage
              {...this.props}
              source={SmartImageView.createUri(src)}
          />
      );
    }
    return (
        <FastImage
            {...this.props}
            source={src}
        />
    );

  }

  private createStateChangeFunc = (newstate: SmartImageViewState) => () => {
    this.props.stateListener && this.props.stateListener(newstate);
  };

  private isBase64(text : string) : boolean {
    return !!(text && text.match(/^data:/));
  }

  public static createUri = (url : string) : FastImageSource => ({ uri: url, priority: 'normal' });

  public static createBase64 = (data : string, imageType : string = 'jpeg') => ({ uri: `data:image/${imageType};base64,{${data}}` });

}
