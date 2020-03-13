import { MapEvent } from 'react-native-maps';

export default interface CameraChangeListener {
    onStartCameraChange : (event : MapEvent)=>void;
    onCameraIdle : ()=>void;
};
