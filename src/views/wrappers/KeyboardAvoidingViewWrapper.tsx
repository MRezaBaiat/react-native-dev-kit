import React, { Component } from 'react';
import {
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface Props{

}
export default class KeyboardAvoidingViewWrapper extends Component<Props> {

  render() {
    const { props } = this;
    return (

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollView}
        bounces={false}
      >
        {
            props.children
        }
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
