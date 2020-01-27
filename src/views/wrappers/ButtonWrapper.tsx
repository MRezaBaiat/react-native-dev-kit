import React from 'react';
import { Button, Text } from 'native-base';
import { ViewStyle } from 'react-native';
import SmartComponent from '../SmartComponent';
import ImageWrapper from './ImageWrapper';

export interface Props {
  text: string,
  fontColor?: string,
  backgroundColor?: string,
  onPress : ()=>void,
  style? : ViewStyle,
  fontSize? : number,
  iconRight? : {resource: number, style:ViewStyle},
  uppercase? : boolean,
}
export default class ButtonWrapper extends SmartComponent<Props> {

  static defaultProps = {
    fontColor: 'white',
    text: '',
    backgroundColor: 'white',
    fontSize: 15,
  };

  render() {

    const {
      style, backgroundColor, text, fontColor, uppercase, iconRight, onPress, fontSize,
    } = this.props;

    return (
      <Button
        {...this.props}
        onPress={onPress}
        delayLongPress={20000}
        style={[{ backgroundColor }, style]}
        block
      >
        <Text
          uppercase={uppercase}
          style={{ color: fontColor, fontSize }}
        >
          {text}
        </Text>
        {
          iconRight ? (
            <ImageWrapper
              src={iconRight.resource}
              style={[{ marginTop: 'auto', marginBottom: 'auto' }, iconRight.style]}
            />
          ) : null
        }
      </Button>
    );
  }

}
