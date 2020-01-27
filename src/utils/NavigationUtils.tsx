import { Navigation } from 'react-native-navigation';
import { I18nManager } from 'react-native';
import { Options } from 'react-native-navigation/lib/src/interfaces/Options';
import NetUtils from '../utils/NetUtils';

const mOpenScreens : {componentId : string, componentName : string}[] = [];

// let mCurrentScreen: { componentId: any; componentName: any; } = null;

I18nManager.allowRTL(false);
NetUtils.init();
Navigation.setDefaultOptions({
  topBar: {
    visible: false,
    drawBehind: true,
    animate: false,
  },
});

Navigation.events().registerComponentDidDisappearListener((component) => {
  mOpenScreens.forEach((value, index) => {
    if (value.componentId === component.componentId) {
      mOpenScreens.splice(index, 1);
    }
  });
});

Navigation.events().registerComponentDidAppearListener((component) => {
  mOpenScreens.push({
    componentId: component.componentId,
    componentName: component.componentName,
  });
  /* mCurrentScreen = {
        componentId : component.componentId,
        componentName : component.componentName
    } */
});

export default class NavigationUtils {


  static getTopScreenName() : string {
    return mOpenScreens.length === 0 ? null : mOpenScreens[mOpenScreens.length - 1].componentName;
  }

  // returns componentId of the top screen
  static getTopScreenId() : string {
    return mOpenScreens.length === 0 ? null : mOpenScreens[mOpenScreens.length - 1].componentId;
  }

  // pushes a screen to the stack
  static navigateTo(component : string, props? : {}, options? : Options) {
    Navigation.push(this.getTopScreenId(), {
      component: {
        name: component,
        options: {
          ...options,
          topBar: {
            visible: false,
          },
        },
        passProps: props,
      },
    });
  }

  // clears stack and sets the root
  static setRoot(component : string, props? : {}, options? : Options) {
    Navigation.setRoot({
      root: {
        stack: {
          id: 'App',
          children: [
            {
              component: {
                name: component,
                passProps: props,
                options: {
                  ...options,
                  topBar: {
                    visible: false,
                  },
                },
              },
            },
          ],
        },
      },
    });
  }

  // returns name of top screen
  static getActiveScreenByName(componentName : string) : {componentId : string, componentName : string} {
    for (const component of mOpenScreens) {
      if (component.componentName === componentName) {
        return component;
      }
    }
    return null;
  }


  static goBack(componentId : string) : Promise<any> {
    return Navigation.pop(componentId);
  }

}
