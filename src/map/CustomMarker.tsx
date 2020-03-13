// @flow

import React, { PureComponent } from 'react';
import {
  AnimatedRegion, LatLng, Marker, Point,
} from 'react-native-maps';
import isEqual from 'lodash.isequal';
import FastImage from 'react-native-fast-image';
import { ViewStyle } from 'react-native';

export interface MarkerProps{
    imageStyle? : ViewStyle,
    src : any,
    coordinate: LatLng
    onPress?:()=>void,
    title?: string,
    description?: string,
    anchor?: Point,
    rotation?: number,
    key:string
}
export default class CustomMarker extends PureComponent<MarkerProps> {

    state = {
      tracksViewChanges: true,
    };

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<MarkerProps>, nextContext: any): void {
      if (!isEqual(this.props, nextProps)) {
        this.setState(() => ({
          tracksViewChanges: true,
        }));
      }
    }

    componentDidUpdate() {
      const { tracksViewChanges } = this.state;
      if (tracksViewChanges) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(() => ({
          tracksViewChanges: false,
        }));
      }
    }

    render() {
      const { tracksViewChanges } = this.state;
      const { src, imageStyle,style } = this.props;
      return (
        <Marker
          tracksViewChanges={tracksViewChanges}
          {...this.props}
        >

          <FastImage
            source={src}
            style={Object.assign({width: 50, height: 50},imageStyle)}
            resizeMode="stretch"
            onLoad={() => {
              this.setState(() => ({
                tracksViewChanges: false,
              }));
            }}
          />

        </Marker>

      );
    }
}
