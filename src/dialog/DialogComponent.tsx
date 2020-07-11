import React, { Component } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import PopupDialog, { DialogProps } from 'react-native-popup-dialog';


const { width: screenWidth } = Dimensions.get('window');

const ANIMATION_DURATION: number = 200;
const DEFAULT_WIDTH: number = screenWidth;
const DEFAULT_HEIGHT: number = null;

const styles = StyleSheet.create({
  dialog: {
    elevation: 5,
    minHeight: 96,
    borderRadius: 0,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 1,
      height: 2,
    },
  },
  dialogContainer: {
    flex: 1,
  },
});

export class DialogComponent extends Component<DialogProps> {

  private popupDialog: PopupDialog;

  static defaultProps = {
    animationDuration: ANIMATION_DURATION,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  };

  constructor(props: DialogProps) {
    super(props);

    this.show = this.show.bind(this);
    this.dismiss = this.dismiss.bind(this);
  }

  show(onShown: ()=>void) {
    this.popupDialog.show(onShown);
  }

  dismiss(onDismissed: ()=>void) {
    this.popupDialog.dismiss(onDismissed);
  }

  render() {
    const {
      children, width, height, dialogAnimation, dialogStyle, dismissOnTouchOutside, haveOverlay, show, onShown, onDismissed, actions,
      animationDuration, overlayPointerEvents, overlayBackgroundColor, overlayOpacity, dismissOnHardwareBackPress,
    } = this.props;

    return (
      <PopupDialog
        ref={(popupDialog: any) => { this.popupDialog = popupDialog; }}
        width={width}
        height={height}
        dialogAnimation={dialogAnimation}
        dialogStyle={[styles.dialog, dialogStyle]}
        animationDuration={animationDuration}
        overlayPointerEvents={overlayPointerEvents}
        overlayBackgroundColor={overlayBackgroundColor}
        overlayOpacity={overlayOpacity}
        dismissOnHardwareBackPress={dismissOnHardwareBackPress}
        dismissOnTouchOutside={dismissOnTouchOutside}
        haveOverlay={haveOverlay}
        show={show}
        onShown={onShown}
        onDismissed={onDismissed}
        actions={actions}
        {
          ...this.props
        }
      >
        {children}
      </PopupDialog>
    );
  }
}

export default DialogComponent;
