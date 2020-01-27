export default class Coordinates {

    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;

    constructor(latitude : number, longitude : number) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
}
