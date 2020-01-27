import Geolocation, { GeoError, GeoPosition } from 'react-native-geolocation-service';
import LocationListener from './LocationListener';
import ArrayList from '../objects/ArrayList';
import Coordinates from './Coordinates';

export default class GPSManager {

    public static ACCURACY_ANY = 5000;
    public static ACCURACY_MEDIUM = 70;
    public static ACCURACY_HIGH = 60;
    public static ACCURACY_MAXIMUM = 20;// 17
    private static watchId = 0;
    private static bearing : number;
    private static lastKnownLocation : Coordinates;
    private static listenersList : ArrayList<LocationListener> = new ArrayList();
    private static locationsHistory : ArrayList<Coordinates> = new ArrayList();
    private static gpsRunning : boolean;

    /** *
     *
     Name	             Type	  Default	Description
     timeout	          ms	    --	     Request timeout
     maximumAge	          ms	  INFINITY	 How long previous location will be cached
     enableHighAccuracy	 bool	   false	 Use high accuracy mode
     distanceFilter	      m	         0	     Minimum displacement in meters
     showLocationDialog	 bool	    true	 whether to ask to enable location in Android
     *
     */
    public static forceNewLocationFix() {
      Geolocation.getCurrentPosition(
        (position : GeoPosition) => {
          this.locationUpdated(position.coords);
        },
        (error : GeoError) => {
          // See error code charts below.
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }

    static addLocationListener(listener : LocationListener) {
      if (this.listenersList.contains(listener)) {
        return;
      }
      this.listenersList.add(listener);
      this.handleGpsState();
    }

    static removeLocationListener(listener : LocationListener) {
      if (!this.listenersList.contains(listener)) {
        return;
      }
      this.listenersList.removeValue(listener);
      this.handleGpsState();
    }

    static handleGpsState() {
      if (this.listenersList.isEmpty()) {
        if (this.gpsRunning) {
          this.stopGps();
        }
        return;
      }
      if (!this.listenersList.isEmpty()) {
        if (!this.gpsRunning) {
          this.startGps();
        }
      }
    }

    /**
     Name	              Type	 Default	   Description
     enableHighAccuracy	  bool	  false	        Use high accuracy mode
     distanceFilter	       m	   100	        Minimum displacement between location updates in meters
     interval	           ms	  10000	        Interval for active location updates
     fastestInterval	   ms	  5000	        Fastest rate at which your application will receive location updates, which might be faster than interval in some situations (for example, if other applications are triggering location updates)
     showLocationDialog	  bool	  true	        whether to ask to enable location in Android
     *
     */
    static startGps() {
      if (this.watchId !== 0) {
        return;
      }
      this.watchId = Geolocation.watchPosition(
        (position : GeoPosition) => {
          this.locationUpdated(position.coords);
        },
        (error : GeoError) => {
          // See error code charts below.
        },
        { enableHighAccuracy: true, distanceFilter: 0, interval: 5000 },
      );

      GPSManager.gpsRunning = true;
    }

    static stopGps() {
      Geolocation.clearWatch(this.watchId);
      this.watchId = 0;
      GPSManager.gpsRunning = false;
    }

    static locationUpdated(coordinate : Coordinates) {
      GPSManager.bearing = this.calculatedBearing(this.lastKnownLocation, coordinate);
      this.lastKnownLocation = coordinate;

      GPSManager.listenersList.forEach((listener) => {
        if (listener != null && coordinate.accuracy <= listener.accuracy && GPSManager.isLocationAcceptableAccordingToHistory(coordinate)) {

          listener.callBack(coordinate);

          if (!listener.isPersistent || listener.isEndedCallBack()) {
            GPSManager.removeLocationListener(listener);
          }
        }
      });
    }

    static isLocationAcceptableAccordingToHistory(newLocation : Coordinates) : boolean {

      if (GPSManager.locationsHistory.size() < 10) {
        GPSManager.locationsHistory.add(newLocation);
        return true;
      }

      if (newLocation.accuracy === 0) {
        return true;
      }

      let accuracy = 0;

      GPSManager.locationsHistory.forEach((history) => {
        accuracy += history.accuracy;
      });

      accuracy /= GPSManager.locationsHistory.size();

      GPSManager.locationsHistory.add(newLocation);
      GPSManager.locationsHistory.removeIndex(0);

      if (accuracy - newLocation.accuracy < -10) {
        console.log(`Location Declined By History Filter , Sum was ${accuracy} but got a ${newLocation.accuracy}`);
        return false;
      }

      return accuracy - newLocation.accuracy >= -10;
    }


    static calculatedBearing = (coordinate1 : Coordinates, coordinate2 : Coordinates) : number => {
      if (!coordinate1 || !coordinate2) {
        return 0;
      }
      if (coordinate1.latitude === coordinate2.latitude && coordinate1.longitude === coordinate2.longitude) {
        return GPSManager.bearing;
      }
      const dLon = (coordinate2.longitude - coordinate1.longitude);
      const y = Math.sin(dLon) * Math.cos(coordinate2.latitude);
      const x = Math.cos(coordinate1.latitude) * Math.sin(coordinate2.latitude) - Math.sin(coordinate1.latitude) * Math.cos(coordinate2.latitude) * Math.cos(dLon);
      const brng = GPSManager._toDeg(Math.atan2(y, x));
      return 360 - ((brng + 360) % 360);
    }

    static _toDeg = (rad : number) => rad * 180 / Math.PI
}
