import React from 'react';
import { ViewStyle } from 'react-native';
import SmartImageView, { SmartImageViewState, Props as SmartImageViewProps } from '../../cachers/imagecachers/SmartImageView';
import SmartComponent from '../SmartComponent';
import ViewUtils from '../../utils/ViewUtils';


export interface Props extends SmartImageViewProps{
    defaultImageSrc? : number | string,
    opacity?: number, // 0.0 : 1.0
}

export default class ImageWrapper extends SmartComponent<Props> {

    static defaultProps = {
      opacity: 1.0,
    };

    state = {
      displayDefaultImage: false,
    };

    shouldComponentUpdate(nextProps: Props, nextState: any, nextContext: any): boolean {

      const should = super.shouldComponentUpdate(nextProps, nextState, nextContext);
      if (should && nextProps.src !== this.props.src) {
        this.state.displayDefaultImage = false;
      }
      return should;
    }

    render() {
      const {
        defaultImageSrc, opacity, style, src,
      } = this.props;
      const { displayDefaultImage } = this.state;

      return (
        <SmartImageView
          {...this.props}
          style={ViewUtils.safeAssignStyles(style, { opacity })}
          src={(displayDefaultImage && defaultImageSrc) ? defaultImageSrc : src}
          stateListener={this.stateListener}
        />
      );
    }

    stateListener = (newState : SmartImageViewState) => {
      const { displayDefaultImage } = this.state;
      switch (newState) {
        case SmartImageViewState.DOWNLOADING:
          this.setState((prevState : any) => ({
            ...prevState,
            displayDefaultImage: true,
          }));
          break;
        case SmartImageViewState.LOADED:
          if (displayDefaultImage) {
            this.setState((prevState : any) => ({
              ...prevState,
              displayDefaultImage: false,
            }));
          }
          break;
        case SmartImageViewState.FAILED:
          this.setState((prevState : any) => ({
            ...prevState,
            displayDefaultImage: true,
          }));
          break;
      }
    }
}

/**
 *  {...props}
 source={src}
 resizeMode={resizeMode}
 * @param url
 * @param useCache
 */

export const createUrl = (url : string) => SmartImageView.createUri(url);

export const createBase64 = (data : string, imageType : string = 'jpeg') => ({ uri: `data:image/${imageType};base64,{${data}}` });
