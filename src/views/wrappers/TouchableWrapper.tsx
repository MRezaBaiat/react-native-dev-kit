import React from 'react';
import { ViewStyle, TouchableOpacity } from 'react-native';
import SmartComponent from '../SmartComponent';

export interface Props {
  style? : ViewStyle,
  children? : any,
  onPress : ()=>void,
  onLongPress? : ()=>void
}
export default class TouchableWrapper extends SmartComponent<Props> {

  render() {
    return (
      <TouchableOpacity
        {...this.props}
        delayLongPress={500}
      >
        {
          this.props.children
        }
      </TouchableOpacity>
    );
  }
}
