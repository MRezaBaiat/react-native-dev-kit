import GPSManager from './GPSManager';
import Coordinates from './Coordinates';

export default class LocationListener {

    callBack : (location : Coordinates)=>void;
    isEndedCallBack : ()=>boolean;
    accuracy : number;
    isPersistent : boolean;

    constructor(accuracy : number = GPSManager.ACCURACY_MEDIUM, isPersistent : boolean, callBack : (location : Coordinates)=>void, isEndedCallBack : ()=>boolean) {
      this.accuracy = accuracy;
      this.callBack = callBack;
      this.isEndedCallBack = isEndedCallBack;
      this.isPersistent = isPersistent;
    }

}
