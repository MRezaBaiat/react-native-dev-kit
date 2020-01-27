// @flow

import React, { PureComponent } from 'react';
import { AnimatedRegion, LatLng, Marker } from 'react-native-maps';
import isEqual from 'lodash.isequal';
import FastImage from 'react-native-fast-image';
import { ViewStyle } from 'react-native';

interface Props{
    imageStyle? : ViewStyle,
    src : any,
    coordinate: LatLng | AnimatedRegion
}

export default class CustomMarker extends PureComponent<Props> {

    state = {
      tracksViewChanges: true,
    };

    componentWillReceiveProps(nextProps: any) {
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
      const { src, imageStyle } = this.props;
      return (
        <Marker
          tracksViewChanges={tracksViewChanges}
          {...this.props}
        >

          <FastImage
            source={src}
            style={imageStyle}
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
