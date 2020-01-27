import React from 'react';
import {
  SafeAreaView, ViewProps, View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SmartComponent from '../SmartComponent';

export interface Props extends ViewProps{
    keyboardAwareEnabled: boolean,
    safeAreaEnabled: boolean
}
export default class ContainerWrapper extends SmartComponent<Props> {

  render() {
    const {
      style, keyboardAwareEnabled, safeAreaEnabled, children,
    } = this.props;
    let views = <View style={style}>{children}</View>;
    if (keyboardAwareEnabled) {
      views = keyboardAwareHoc(views, { flex: 1 });
    }
    if (safeAreaEnabled) {
      views = safeAreaHoc(views, { flex: 1 });
    }
    return views;
  }

}

function keyboardAwareHoc(children: any, style: any) {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={style}
      bounces={false}
    >
      {
        children
      }
    </KeyboardAwareScrollView>
  );
}

function safeAreaHoc(children: any, style: any) {
  return (
    <SafeAreaView style={style}>
      {
        children
      }
    </SafeAreaView>
  );
}
