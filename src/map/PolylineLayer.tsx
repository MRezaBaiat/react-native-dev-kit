import PolyLine from 'react-native-maps';
import isEqual from 'lodash.isequal';
import MapManager from './MapManager';
import ArrayList from '../objects/ArrayList';

export default class PolylineLayer {

    lines = new ArrayList();

    mapManager : MapManager;

    constructor(mapManager : MapManager) {
      this.mapManager = mapManager;
    }

    setLines(lines : PolyLine[] | ArrayList<PolyLine>) {
      if (isEqual(lines, this.lines)) {
        return;
      }

      this.lines.clear();
      this.lines.addAll(lines);
      this.mapManager.forceUpdate();
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
