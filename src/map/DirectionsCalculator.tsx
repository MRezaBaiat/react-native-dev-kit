import ArrayList from '../objects/ArrayList';
import Gson from '../objects/Gson';
import Route from './directions/Route';
import PolyLine from './directions/PolyLine';
import { decode } from './directions/PolyLineCoder';

export default class DirectionsCalculator {

    private static BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json?origin=';

    public static calculate(pickup : {latitude : number, longitude : number}, destinations : ArrayList<{latitude : number, longitude : number}>, optimize : boolean, apiKey : String, callback = (route : Route) => {}, failCallBack = (e : Error) => {}) {

      destinations = Gson.copy(destinations, ArrayList.prototype);

      const lastDestination = destinations[destinations.length - 1];

      destinations.splice(destinations.length - 1, 1);

      let url : string = `${DirectionsCalculator.BASE_URL + pickup.latitude},${pickup.longitude}&destination=${lastDestination.latitude},${lastDestination.longitude}`;

      if (destinations.length !== 0) {
        url += '&waypoints=';
        if (optimize) {
          url += 'optimize:true|';
        }
        for (const ltLng of destinations) {
          url += `via:${ltLng.latitude},${ltLng.longitude}|`;
        }
      }

      url += `&departure_time=now&key=${apiKey}`;

      this.doFetch(url)
        .then((res) => {
          if (!res || !res.ok) {
            return null;
          }
          return res.json();
        }).then((resJson) => {
          if (!resJson) {
            failCallBack(null);
            return;
          }
          callback(Gson.cast(resJson, Route.prototype));
        }).catch((e) => {
          failCallBack(e);
        });

    }

    static decodeData(route : Route) : ArrayList<{latitude : number, longitude : number}> {

      const coordinates = new ArrayList<{latitude : number, longitude : number}>();

      for (const direction of route.routes) {
        for (const leg of direction.legs) {
          for (const step of leg.steps) {
            const polyline : PolyLine = Gson.cast(step.polyline, PolyLine.prototype);

            const array = decode(polyline.points, null);
            for (const point of array) {
              coordinates.add({ latitude: point[0], longitude: point[1] });
            }
          }
        }
      }

      return coordinates;
    }

    static async doFetch(url : string) {
      return await fetch(url, {
        method: 'POST',
      });
    }

}
