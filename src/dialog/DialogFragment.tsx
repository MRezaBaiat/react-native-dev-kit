import React, { Component } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import RootSiblings from 'react-native-root-siblings';
import Dialog, {
  DialogContent, ScaleAnimation, FadeAnimation, SlideAnimation,
} from 'react-native-popup-dialog';
import SmartComponent from '../views/SmartComponent';

export {
    SlideAnimation,
    FadeAnimation,
    ScaleAnimation,
}

/** *
 *
 visible	boolean	false
 rounded	boolean	true
 useNativeDriver	boolean	true
 children	any
 dialogTitle?	React Element		You can pass a DialogTitle component or pass a View for customizing titlebar
 width?	Number	Your device width	The Width of Dialog, you can use fixed width or use percentage. For example 0.5 it means 50%
 height?	Number	300	The Height of Dialog, you can use fixed height or use percentage. For example 0.5 it means 50%
 dialogAnimation?		FadeAnimation	animation for dialog
 dialogStyle?	any
 containerStyle?	any	null	For example: { zIndex: 10, elevation: 10 }
 animationDuration?	Number	200
 overlayPointerEvents?	String		Available option: auto, none
 overlayBackgroundColor? String	#000
 overlayOpacity?	Number	0.5
 hasOverlay?	Boolean	true
 onShow?	Function		You can pass shown function as a callback function, will call the function when dialog shown
 onDismiss?	Function		You can pass onDismiss function as a callback function, will call the function when dialog dismissed
 onTouchOutside?	Function	() => {}
 onHardwareBackPress?	Function	() => true	Handle hardware button presses
 footer?	React Element	null	for example: <View><Button text="DISMISS" align="center" onPress={() => {}}/></View>
 *
 *
 * new FadeAnimation({
  toValue: 0, // optional
  animationDuration: 150, // optional
  useNativeDriver: true, // optional
})

 new ScaleAnimation({
  toValue: 0, // optional
  useNativeDriver: true, // optional
})

 new SlideAnimation({
  toValue: 0, // optional
  slideFrom: 'bottom', // optional
  useNativeDriver: true, // optional
})
 */

export interface DialogProperties {
    dialogStyle? : ViewStyle,
    dialogAnimation : ScaleAnimation|FadeAnimation|SlideAnimation,
    animationDuration? : number,
    toValue? : number,
    slideFrom?:'bottom'|'top'|'left'|'right'
    rounded? : boolean,
    overlayPointerEvents? : 'auto'|'none',
    overlayBackgroundColor? : string,
    overlayOpacity? : number,
    dismissOnHardwareBackPress? : boolean
    dismissOnTouchOutside? : boolean,
    onTouchOutside? : ()=>void,
    hasOverlay? : boolean,
    onShown? : ()=>void,
    width:number | string,
    height:number | string,
    children : JSX.Element
}

export default class DialogFragment<T> extends SmartComponent<T> {

  // private ref : Dialog;
  // private mSubling : RootSiblings;

  protected static showDialog(properties : DialogProperties, callBack? : ()=>void) {
    /* let dialogComponent = <DialogComponent
             {
               ...properties
             }
             onDismissed={() => {this.destroy()}}
             dismissOnHardwareBackPress={true}
             onHardwareBackPress={()=>{this.destroy()}}
         />; */

    let mSubling : RootSiblings;

    let dismissed = false;

    const isDismissed = () => dismissed;
    let rref : Dialog;
    const dismiss = () => {
      dismissed = true;
      rref.destroyDialog();
      mSubling.update(
        <Dialog
          visible={false}
          show={false}
        >
          {
                        null
                    }
        </Dialog>,
        () => {
          // mSubling.destroy();
        },
      );


    };

    const dialogComponent = (
      <Dialog
        ref={(ref : Dialog) => { rref = ref; }}
        {
                    ...properties
                }
        visible
        show
        onHardwareBackPress={() => { dismiss(); return true; }}
        onDismiss={() => { dismiss(); }}
        onDismissed={() => { dismiss(); }}
      >
        {
                    // @ts-ignore
                    React.cloneElement(
                      properties.children,
                      {
                        dismiss,
                        isDismissed,
                      },
                    )
                }
      </Dialog>
    );

    mSubling = new RootSiblings(dialogComponent, callBack);
  }

    dismiss = () => {
      this.props.dismiss();
    }

    isDismissed =() => this.props.isDismissed()
}


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
