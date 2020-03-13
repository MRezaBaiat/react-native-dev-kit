/*
import PolyLine from 'react-native-maps';
import MapManager from './MapManager';
import ArrayList from '../objects/ArrayList';

export default class PolylineLayer {
    lines : PolyLine[] = [];
    onChange: ()=>void;

    constructor(onChange: ()=>void) {
      this.onChange = onChange;
    }

    addPolyLine(line : PolyLine) {
      if (this.lines.contains(line)) {
        return;
      }
      this.lines.add(line);
      this.mapManager.forceUpdate();
    }

    addPolyLines(lines : PolyLine[] | ArrayList<PolyLine>) {
      lines.forEach((line) => {
        if (this.lines.contains(line)) {
          return;
        }
        this.lines.add(line);
      });
      this.mapManager.forceUpdate();
    }

    removePolyLine(line : PolyLine) {
      if (!this.lines.contains(line)) {
        return;
      }
      this.lines.removeValue(line);
      this.mapManager.forceUpdate();
    }

    clear() {
      this.lines.clear();
      this.mapManager.forceUpdate();
    }
}
*/
