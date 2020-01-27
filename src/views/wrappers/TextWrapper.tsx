import React from 'react';
import { Text } from 'native-base';
import { TextProps, TextStyle } from 'react-native';
import SmartComponent from '../SmartComponent';
import ViewUtils from '../../utils/ViewUtils';

export interface Props extends TextProps{
    text: any,
    fontColor?: any,
    backgroundColor?: any,
    fontSize?: any,
    style? : TextStyle,
    shadow? : {size:number, radius:number},
    fontFamily? : string,
    uppercase? : boolean,
    textAlign? : 'auto' | 'left' | 'right' | 'center' | 'justify'
}
export default class TextWrapper extends SmartComponent<Props> {

    static defaultProps = {
      shadow: { size: 0, radius: 0 },
    };

    render() {
      const {
        style, textAlign, fontFamily, fontSize, fontColor, backgroundColor, shadow, text,
      } = this.props;

      let newStyle = style;

      if (textAlign === 'center') {
        newStyle = ViewUtils.safeAssignStyles(style || {}, { paddingLeft: 'auto', paddingRight: 'auto' });
      } else if (textAlign === 'left') {
        newStyle = ViewUtils.safeAssignStyles(style || {}, { paddingRight: 'auto' });
      } else if (textAlign === 'right') {
        newStyle = ViewUtils.safeAssignStyles(style || {}, { paddingLeft: 'auto' });
      }

      // ,textAlign: "center",textAlignVertical: "center"
      return (
        <Text
          {...this.props}
          style={ViewUtils.safeAssignStyles({
            textAlign,
            fontFamily,
            fontSize,
            color: fontColor,
            backgroundColor,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: -shadow.size, height: shadow.size },
            textShadowRadius: shadow.radius,
          }, newStyle)}
        >
          {text}
        </Text>
      );
    }
}
