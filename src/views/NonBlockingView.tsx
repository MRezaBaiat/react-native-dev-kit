import React from 'react';
import { View, ViewProps } from 'react-native';
import SmartComponent from './SmartComponent';

export default class NonBlockingView extends SmartComponent<ViewProps> {

  render() {
    return (
      <View
        pointerEvents="box-none"
        {...this.props}
      >
          {
            this.props.children
          }
      </View>
    );
  }
}
