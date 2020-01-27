import { Marker } from 'react-native-maps';
import isEqual from 'lodash.isequal';
import MapManager from './MapManager';
import ArrayList from '../objects/ArrayList';

export default class MarkerLayer {

    markers = new ArrayList();

    mapManager : MapManager;

    mLayerId = Date.now();

    constructor(mapManager : MapManager) {
      this.mapManager = mapManager;
    }


    setMarkers(markers : Marker[] | ArrayList<Marker>) {
      if (isEqual(markers, this.markers)) {
        return;
      }
      this.markers.clear();
      this.markers.addAll(markers);
      this.mapManager.forceUpdate();
    }

    addMarker(marker : Marker) {
      if (this.markers.contains(marker)) {
        return;
      }
      this.markers.add(marker);
      this.mapManager.forceUpdate();
    }

    addMarkers(markers : Marker[] | ArrayList<Marker>) {
      markers.forEach((marker) => {
        if (this.markers.contains(marker)) {
          return;
        }
        this.markers.add(marker);
      });
      this.mapManager.forceUpdate();
    }

    removeMarker(marker : Marker) {
      if (!this.markers.contains(marker)) {
        return;
      }
      this.markers.removeValue(marker);
      this.mapManager.forceUpdate();
    }

    clear() {
      this.markers.clear();
      this.mapManager.forceUpdate();
    }
}
