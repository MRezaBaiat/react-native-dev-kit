import Marker from './Marker';
import {MarkerProps} from "./CustomMarker";

export default class MarkerLayer {
    markers: Marker[] = [];
    onChange: ()=>void;

    constructor(onChange: ()=>void) {
      this.onChange = onChange;
    }

    addMarker = (props: MarkerProps) => {
      if (!props.key) {
        props.key = String(Math.random());
      }
      let marker = this.findMarker(props.key);
      if (!marker) {
        marker = new Marker({ ...props });
        this.markers.push(marker);
        this.onChange();
      }
      return marker;
    };

    findMarker(key: string) {
      return this.markers.find((value) => value.key === key);
    }

    getMarkers(): Marker[] {
      return this.markers;
    }

    clear() {
      this.markers = [];
      this.onChange();
    }

    removeMarker(key: string) {
      const marker = this.findMarker(key);
      if (key) {
        this.markers.splice(this.markers.indexOf(marker), 1);
        this.onChange();
      }
    }
}
