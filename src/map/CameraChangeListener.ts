import { MapEvent } from 'react-native-maps';

export default class CameraChangeListener {

    onStarCameraChange : (event : MapEvent)=>void;

    onCameraIdle : ()=>void;

    constructor(onStartCameraChange : ()=>void, onCameraIdle : ()=>void) {
      this.onStarCameraChange = onStartCameraChange;
      this.onCameraIdle = onCameraIdle;
    }

}
