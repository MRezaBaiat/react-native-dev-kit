// eslint-disable-next-line max-classes-per-file
import React from 'react';
import {
  Dimensions,
} from 'react-native';
import { Marker, Point, Region } from 'react-native-maps';
import SuperCluster from 'supercluster';
import GeoViewport from '@mapbox/geo-viewport';
import { GeoJSON } from 'geojson';
import MarkerLayer from './MarkerLayer';
import MapManager from './MapManager';
import CustomMarker from './CustomMarker';

interface ClusterProps<T>{
  mapManager : MapManager,
  data : ClusterData<T>[],
  renderMarker : (data:ClusterData<T>)=>Marker,
  renderCluster : (cluster : {pointCount : number, coordinate: {latitude : number, longitude : number}, clusterId:string})=>Marker
  radius? : number,
  preserveClusterPressBehavior? : boolean,
}

export class ClusterData<T> {
  public location:{latitude:number, longitude:number};
  public payload:T;
}

export default class MapClusterer<T> {

  private mSuperCluster : SuperCluster;
  private props : ClusterProps<T>;
  private mMapManager : MapManager;
  private mMarkerLayer : MarkerLayer;
  private dimensions : [number, number];

  constructor(props : ClusterProps<T>) {
    this.props = props;

    this.dimensions = [Dimensions.get('window').width, Dimensions.get('window').height];

    this.mMapManager = this.props.mapManager;
    this.mMarkerLayer = this.mMapManager.createMarkerLayer();

    this.mMapManager.addCameraIdleListener({
      onStarCameraChange: null,
      onCameraIdle: () => {
        this.onRegionChangeComplete();
      },
    });

    if (this.props.data && this.props.data.length > 0) {
      this.clusterize(this.props.data);
    }
  }

  public setData = (data : ClusterData<T>[]) => {
    this.props.data = data;
    this.clusterize(this.props.data);
  }

  private onRegionChangeComplete = () => {
    if (this.mMapManager.getCenterCoordinate().longitudeDelta <= 80) {
      this.setClusters(this.getClusters());
    }
  };

  private setClusters = (data : any[]) => {
    if (!data) {
      return;
    }
    const markers : Marker[] = [];
    data.forEach(
      // @ts-ignore
      (d) => {
        if (d.properties.point_count === 0) {
          markers.push(this.props.renderMarker(d.properties.item));
        } else {
          const cluster = {
            pointCount: d.properties.point_count,
            coordinate: { latitude: d.geometry.coordinates[1], longitude: d.geometry.coordinates[0] },
            clusterId: d.properties.cluster_id,
          };
          markers.push(this.props.renderCluster(cluster));
        }
      },
    );
    this.mMarkerLayer.setMarkers(markers);
  }

  componentWillReceiveProps(nextProps : ClusterProps<T>) {
    if (this.props.data !== nextProps.data) this.clusterize(nextProps.data);
  }

  getClusteringEngine = () => this.mSuperCluster;

  clusterize = (dataset : any) => {
    if (!dataset) {
      return;
    }
    this.mSuperCluster = new SuperCluster({ // eslint-disable-line new-cap
      extent: 512,
      minZoom: 1,
      maxZoom: 16,
      radius: this.props.radius || (this.dimensions[0] * 0.045), // 4.5% of screen width
    });

    // get formatted GeoPoints for cluster
    const rawData = dataset.map(itemToGeoJSONFeature);

    // load geopoints into SuperCluster
    this.getClusteringEngine().load(rawData);

    this.setClusters(this.getClusters());
  };

  getClusters = () => {
    if (!this.getClusteringEngine()) {
      return null;
    }
    const region = this.mMapManager.getCenterCoordinate();
    const bbox = regionToBoundingBox(region);
    const viewport = (region.longitudeDelta) >= 40 ? { zoom: 1 } : GeoViewport.viewport(bbox, this.dimensions);
    return this.getClusteringEngine().getClusters(bbox, viewport.zoom);
  };

  public createMarker(latitude:number, longitude:number, title : string, description : string, anchor : Point, width:number, height:number, imgSrc:string, rotation : number = 0, onPress? : ()=>void, ref? : (marker : CustomMarker)=>void) : Marker {
    return this.mMapManager.createMarker(latitude, longitude, title, description, anchor, width, height, imgSrc, rotation, this.mMarkerLayer.mLayerId, onPress, ref);
  }

  public createClusterMarker(latitude:number, longitude:number, title : string, description : string, anchor : Point, rotation : number = 0, onRenderChild : ()=>JSX.Element, onPress? : ()=>void, ref? : (marker : Marker)=>void) : Marker {
    // @ts-ignore
    return (
      <Marker
        ref={ref}
        key={`${latitude},${longitude},${rotation},${this.mMarkerLayer.mLayerId}`}
        onPress={onPress}
        coordinate={{
          latitude,
          longitude,
        }}
        title={title}
        description={description}
        anchor={anchor}
        rotation={rotation}
      >
        {
            onRenderChild()
          }
      </Marker>
    );
  }

}


/**
 * Compute bounding box for the given region
 * @param {Object} region - Google Maps/MapKit region
 * @returns {Object} - Region's bounding box as WSEN array
 */
const regionToBoundingBox = (region : Region): GeoJSON.BBox => {
  let lngD;
  if (region.longitudeDelta < 0) lngD = region.longitudeDelta + 360;
  else lngD = region.longitudeDelta;

  return ([
    region.longitude - lngD, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + lngD, // eastLng - max lng
    region.latitude + region.latitudeDelta, // northLat - max lat
  ]);
};

/**
 * Calculate region from the given bounding box.
 * Bounding box must be represented as WSEN:
 * {
 *   ws: { longitude: minLon, latitude: minLat }
 *   en: { longitude: maxLon, latitude: maxLat }
 * }
 * @param {Object} bbox - Bounding box
 * @returns {Object} - Google Maps/MapKit compliant region
 */
export const boundingBoxToRegion = (bbox : any) => {
  const minLon = (bbox.ws.longitude * Math.PI) / 180;
  const maxLon = (bbox.en.longitude * Math.PI) / 180;

  const minLat = (bbox.ws.latitude * Math.PI) / 180;
  const maxLat = (bbox.en.latitude * Math.PI) / 180;

  const dLon = maxLon - minLon;
  const dLat = maxLat - minLat;

  const x = Math.cos(maxLat) * Math.cos(dLon);
  const y = Math.cos(maxLat) * Math.sin(dLon);

  const latRad = Math.atan2(Math.sin(minLat) + Math.sin(maxLat), Math.sqrt((Math.cos(minLat) + x) * (Math.cos(minLat) + x) + y * y));
  const lonRad = minLon + Math.atan2(y, Math.cos(minLat) + x);

  const latitude = (latRad * 180) / Math.PI;
  const longitude = (lonRad * 180) / Math.PI;

  return {
    latitude,
    longitude,
    latitudeDelta: (dLat * 180) / Math.PI,
    longitudeDelta: (dLon * 180) / Math.PI,
  };
};

/**
 * Compute a RFC-compliant GeoJSON Feature object
 * from the given JS object
 * RFC7946: https://tools.ietf.org/html/rfc7946#section-3.2
 * @param {Object} item - JS object containing marker data
 * @returns {Object} - GeoJSON Feature object
 */
export const itemToGeoJSONFeature = (item : any) => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [item.location.longitude, item.location.latitude],
  },
  properties: { point_count: 0, item }, // eslint-disable-line camelcase
});
