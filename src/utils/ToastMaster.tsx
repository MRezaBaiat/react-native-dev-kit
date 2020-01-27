// import Toast from 'react-native-root-toast';
import Toast from 'react-native-simple-toast';

export default class ToastMaster {
//

  static makeText(text : string, duration : number = Toast.LONG, position = Toast.CENTER) {

    Toast.showWithGravity(text, duration, position);
    /*
                let toast = Toast.show(text, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                    onShow: () => {
                        // calls on toast\`s appear animation start
                    },
                    onShown: () => {
                        // calls on toast\`s appear animation end.
                    },
                    onHide: () => {
                        // calls on toast\`s hide animation start.
                    },
                    onHidden: () => {
                        // calls on toast\`s hide animation end.
                    }
                }); */
  }


  // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
  /*  setTimeout(function () {
          Toast.hide(toast);
      }, 500); */

}
