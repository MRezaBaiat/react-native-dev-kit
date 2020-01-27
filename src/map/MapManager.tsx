import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Shape,
  ViewStyle,
  AsyncStorage,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  LatLng,
  Point,
  MapEvent,
  Polyline,
  Region, Circle,
} from 'react-native-maps';
import geolib from 'geolib';
import MarkerLayer from './MarkerLayer';
import GPSManager from './GPSManager';
import ArrayList from '../objects/ArrayList';
import LocationListener from './LocationListener';
import ShadowUtils from '../utils/ShadowUtils';

import CustomMarker from './CustomMarker';
import PolylineLayer from './PolylineLayer';
import Coordinates from './Coordinates';
import SmartComponent from '../views/SmartComponent';
import CameraChangeListener from './CameraChangeListener';

const MY_LOCATION_IMAGE = require('../../assets/images/my_location_icon.png');
const NAVIGATION_IMAGE = require('../../assets/images/navigation.png');

interface MapManagerProps{
    panelMargins?: any,
    navigationMarginTop? : number
    initialRegion?: Region,
    style? : ViewStyle | ViewStyle[],
    navigationButton? : boolean,
    onMapReady? : (mapManager : MapManager)=>void
}
export default class MapManager extends SmartComponent<MapManagerProps> {

    static SP_LAST_LOCATION_INDENTIFIER = 'last_known_location';

    static DEFAULT_ZOOM : number = 0.003;

    centerRegion : Region = {
      latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0,
    };

    static lastKnownLocation : Coordinates = null;

    mCameraListeners : ArrayList<CameraChangeListener> = new ArrayList();

    mLongClickListeners : ArrayList<(coordinate: LatLng)=>void> = new ArrayList();

    mMapClickListeners : ArrayList<(event : MapEvent)=>void> = new ArrayList();

    lastCameraIdlePointCalled : LatLng = null;

    state = {
      markersList: new ArrayList<Marker>(),
      markerLayersList: new ArrayList<MarkerLayer>(),
      polylineLayersList: new ArrayList<PolylineLayer>(),
      polyLines: new ArrayList<Polyline>(),
      shapes: new ArrayList<Shape>(),
      focused: true,
      centerPointView: null as any,
      trafficEnabled: false,
      myLocationButtonVisible: true,
      navigating: false,
    };

    mapView : MapView;

    // eslint-disable-next-line no-useless-constructor
    constructor(props : MapManagerProps) {
      super(props);
    }

    componentDidMount(): void {
      this.props.onMapReady && this.props.onMapReady(this);
    }

    componentWillUnmount(): void {
      this.pause();
    }

    render() {

      const objectsCache : ArrayList<any> = new ArrayList();

      if (!this.state.markerLayersList.isEmpty()) {
        for (const layer of this.state.markerLayersList) {
          if (!layer.markers.isEmpty()) {
            for (const marker of layer.markers) {
              objectsCache.add(marker);
            }
          }
        }
      }

      if (!this.state.polylineLayersList.isEmpty()) {
        for (const layer of this.state.polylineLayersList) {
          if (!layer.lines.isEmpty()) {
            for (const line of layer.lines) {
              objectsCache.add(line);
            }
          }
        }
      }

      if (!this.state.shapes.isEmpty()) {
        for (const shape of this.state.shapes) {
          objectsCache.add(shape);
        }
      }

      if (!this.state.markersList.isEmpty()) {
        for (const marker of this.state.markersList) {
          objectsCache.add(marker);
        }
      }

      if (!this.state.polyLines.isEmpty()) {
        for (const line of this.state.polyLines) {
          objectsCache.add(line);
        }
      }

      const { panelMargins, navigationMarginTop, navigationButton } = this.props;

      const myLocationMarginTop = panelMargins ? panelMargins.top : 7;
      const myLocationMarginsRight = panelMargins ? panelMargins.right : 7;

      return (
        <View
          style={[styles.container, this.props.style, { zIndex: 0 }]}
        >
          <MapView
            initialRegion={this.props.initialRegion}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            showsMyLocationButton={false}
            followsUserLocation={false}
            showsPointsOfInterest={false}
            showsCompass={false}
            zoomEnabled
            rotateEnabled
            pitchEnabled
            zoomControlEnabled={false}
            cacheEnabled={false}
            moveOnMarkerPress
            showsScale
            showsBuildings
            showsIndoorLevelPicker
            liteMode={false}// for listview , freezes the map as an image
            ref={(ref) => { this.mapView = ref; }}
            onMarkerPress={() => {}}
            onMapReady={() => {}}
            onRegionChange={this.onRegionChange}
            onRegionChangeComplete={this.cameraChangeEnded}
            onPress={(event: MapEvent) => this.clickPerformed(event)}
            onPanDrag={(event: MapEvent) => { this.cameraChangeStarted(event); }}
            onLongPress={(event: MapEvent) => this.longPressPerformed(event)}
            showsTraffic={this.state.trafficEnabled}
            style={styles.map}
          >
            {
               objectsCache.map((object) => object)
            }

          </MapView>
          {
             this.state.centerPointView
          }

          <View style={{
            flex: 1, flexDirection: 'column', position: 'absolute', top: 0, right: 0, marginTop: myLocationMarginTop, marginRight: myLocationMarginsRight,
          }}
          >
            {
                        this.state.myLocationButtonVisible
                          ? (
                            <TouchableOpacity
                              style={[{
                                zIndex: 0, backgroundColor: this.state.focused ? 'white' : 'orange', borderRadius: 45, borderWidth: 2, borderColor: 'white',
                              }, ShadowUtils.getShadowStyle(5)]}
                              onPress={() => {
                                GPSManager.forceNewLocationFix();
                                this.setState((prevState : any) => ({
                                  ...prevState,
                                  focused: true,
                                }));
                              }}
                            >
                              <Image
                                source={MY_LOCATION_IMAGE}
                                resizeMode="contain"
                                style={{
                                  zIndex: 0, width: 25, height: 25, margin: 6,
                                }}
                              />

                            </TouchableOpacity>
                          ) : null
                    }

            {
                        navigationButton
                        && (
                        <TouchableOpacity
                          style={[{
                            zIndex: 0, backgroundColor: !this.state.navigating ? 'white' : 'orange', borderRadius: 45, borderWidth: 2, borderColor: 'white', marginTop: navigationMarginTop || 15,
                          }, ShadowUtils.getShadowStyle(5)]}
                          onPress={() => {

                            // TODO

                          }}
                        >
                          <Image
                            source={NAVIGATION_IMAGE}
                            resizeMode="contain"
                            style={{
                              zIndex: 0, width: 25, height: 25, margin: 6,
                            }}
                          />

                        </TouchableOpacity>
                        )
                    }
          </View>
          {
                    this.props.children
                }
        </View>
      );
    }

    onRegionChange = (region : Region) => {
      this.centerRegion = region;
    }

    getCenterCoordinate() : Region {
      return this.centerRegion;
    }

    clickPerformed(event : MapEvent) {
      if (this.mMapClickListeners.isEmpty()) {
        return;
      }
      this.mMapClickListeners.forEach((listener) => {
        listener(event);
      });
    }

    longPressPerformed(event: MapEvent) {
      if (this.mLongClickListeners.isEmpty()) {
        return;
      }
      this.mLongClickListeners.forEach((listener) => {
        listener(event.nativeEvent.coordinate);
      });
    }

    cameraChangeStarted(event : MapEvent) {
      if (this.state.focused) {
        this.setState((prevState : any) => ({
          ...prevState,
          focused: false,
        }));
      }
      if (this.mCameraListeners.isEmpty()) {
        return;
      }
      this.mCameraListeners.forEach((listener) => {
        if (listener.onStarCameraChange === null) {
          return;
        }
        listener.onStarCameraChange(event);
      });
    }

    cameraChangeEnded = (region : Region) => {
      this.centerRegion = region;
      if (this.mCameraListeners.isEmpty()) {
        return;
      }
      const centerPoint : LatLng = this.getCenterCoordinate();
      if (this.lastCameraIdlePointCalled && centerPoint.latitude === this.lastCameraIdlePointCalled.latitude && centerPoint.longitude === this.lastCameraIdlePointCalled.longitude) {
        return;
      }
      this.lastCameraIdlePointCalled = centerPoint;
      this.mCameraListeners.forEach((listener) => {
        if (listener.onCameraIdle === null) {
          return;
        }
        listener.onCameraIdle();
      });
    }

    isTrafficEnabled() : boolean {
      return this.state.trafficEnabled;
    }

    setMyLocationVisibile(visible : boolean) {
      this.state.myLocationButtonVisible = visible;
      this.forceUpdate();
    }

    setTrafficEnabled(enabled : boolean) {
      this.state.trafficEnabled = enabled;
      this.setState((prevState : any) => ({
        ...prevState,
      }));
    }

    createMarkerLayer() : MarkerLayer {
      const layer = new MarkerLayer(this);
      this.state.markerLayersList.add(layer);
      return layer;
    }

    createPolylineLayer() : PolylineLayer {
      const layer = new PolylineLayer(this);
      this.state.polylineLayersList.add(layer);
      return layer;
    }

    createCircle(latLng : LatLng, radius : number, strokeWidth : number, strokeColor : string, fillColor : string) {
      return (
        <Circle
          center={{
            latitude: latLng.latitude,
            longitude: latLng.longitude,
          }}
          radius={radius}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          fillColor={fillColor}
        />
      );
    }

    createPolyLine(color : string, coordinates : [], width : number, geodesic : boolean) {
      return (
        <Polyline
          strokeColor={color}
          strokeWidth={width}
          coordinates={coordinates}
          geodesic={geodesic}
          lineCap="round"
          lineJoin="round"
        />
      );
    }

    addPolyLine(route : Polyline) {
      if (this.state.polyLines.contains(route)) {
        return;
      }
      this.state.polyLines.add(route);
      this.forceUpdate();
    }

    addPolyLines(polyLines : Polyline[]) {
      for (const line of polyLines) {
        if (!this.state.polyLines.contains(line)) {
          this.state.polyLines.add(line);
        }
      }
      this.forceUpdate();
    }

    removePolyLine(route : Polyline) {
      if (!this.state.polyLines.contains(route)) {
        return;
      }
      this.state.polyLines.removeValue(route);
      this.forceUpdate();
    }

    removePolyLines(lines : Polyline[] | ArrayList<Polyline>) {
      for (const line of lines) {
        this.state.polyLines.removeValue(line);
      }
      this.forceUpdate();
    }

    addShape(shape : Shape) {
      if (this.state.shapes.contains(shape)) {
        return shape;
      }
      this.state.shapes.add(shape);
      this.setState((prevState : any) => ({
        ...prevState,
      }));
      return shape;
    }

    removeShape(shape : Shape) {
      if (!this.state.shapes.contains(shape)) {
        return;
      }
      this.state.shapes.removeValue(shape);
      this.setState((prevState : any) => ({
        ...prevState,
      }));
    }

    // markers currently slow down the app , unless its images are inside marker
    //                <FastImage style={{width:width,height:height}} source={imgSrc} resizeMode={'stretch'} />
    createMarker(latitude:number, longitude:number, title : string, description : string, anchor : Point, width:number, height:number, imgSrc:string, rotation : number = 0, markerLayerId : number = 0, onPress? : ()=>void, ref? : (marker : CustomMarker)=>void) : Marker {
      // @ts-ignore
      return (
      // @ts-ignore
        <CustomMarker
          ref={ref}
          key={`${latitude},${longitude},${imgSrc},${rotation},${markerLayerId}`}
          onPress={onPress}
          coordinate={{
            latitude,
            longitude,
          }}
          title={title}
          description={description}
          anchor={anchor}
          rotation={rotation}

          src={imgSrc}
          imageStyle={{ width, height }}
        />
      );
    }

    addMarker(marker : Marker) {
      if (this.state.markersList.contains(marker)) {
        return;
      }
      this.state.markersList.add(marker);
      this.forceUpdate();
    }

    addMarkers(markers : Marker[]) {
      for (const marker of markers) {
        if (!this.state.markersList.contains(marker)) {
          this.state.markersList.add(marker);
        }
      }
      this.forceUpdate();
    }

    removeMarker(marker : Marker) {
      if (!this.state || !this.state.markersList.contains(marker)) {
        return;
      }
      this.state.markersList.removeValue(marker);
      this.forceUpdate();
    }

    removeMarkers(markers : Marker[]) {
      for (const marker of markers) {
        this.state.markersList.removeValue(marker);
      }
      this.forceUpdate();
    }

    setFocused(focused : boolean) {
      if (this.state.focused === focused) {
        return;
      }
      this.setState((prevState : any) => ({
        ...prevState,
        focused,
      }));
    }

    resume() {
      GPSManager.addLocationListener(this.mLocationListener);
    }

    pause() {
      if (MapManager.lastKnownLocation) {
        AsyncStorage.setItem(MapManager.SP_LAST_LOCATION_INDENTIFIER, JSON.stringify(MapManager.lastKnownLocation));
      }
      GPSManager.removeLocationListener(this.mLocationListener);
    }

    mLocationListener = new LocationListener(GPSManager.ACCURACY_MEDIUM, true, (coordinate : Coordinates) => {
      MapManager.lastKnownLocation = coordinate;
      if (this.state.focused) {
        this.setFocusPoint({ latitude: coordinate.latitude, longitude: coordinate.longitude }, true);
      }
    }, () => false);

    static getLastKnownLocation() : Coordinates {
      return MapManager.lastKnownLocation;
    }

    /*    //default zoom : 0.003 , bigger is more far
        setFocusPointAndZoom(latLng : LatLng,animate : boolean,zoom : number = MapManager.DEFAULT_ZOOM){
            let region={
                latitude: latLng.latitude,
                longitude: latLng.longitude,
                latitudeDelta: zoom,
                longitudeDelta: zoom
            };
            this.mapView.animateToRegion(region);
        } */

    setFocusPoint(latLng : LatLng, animate : boolean, zoom : number = 16) {
      this.mapView.animateCamera({ center: latLng, zoom }, { duration: animate ? 1000 : 0 });
      // this.mapView.animateToCoordinate(latLng,animate ? 1000 : 0);
    }

    travelBy(metters : number, breaing = 45) {
      this.setFocused(false);
      const destination = geolib.computeDestinationPoint(this.getCenterCoordinate(), metters, breaing);
      this.setFocusPoint({ latitude: destination.latitude, longitude: destination.longitude }, true);
    }

    setViewBounds(latLngs : ArrayList<LatLng> | [LatLng], paddings = {
      top: 0, right: 0, bottom: 0, left: 0,
    }) {
      this.setFocused(false);
      this.mapView.fitToCoordinates(latLngs, { edgePadding: paddings, animated: true });
    }

    addCenterPoint(width : number, height:number) {
      const view = (
        <Text
          style={{
            backgroundColor: 'red', width, height, marginBottom: height,
          }}
          onPress={() => {}}
        >
PRESS ME
        </Text>
      );
      this.addCenterPointWithView(view);
    }

    addCenterPointWithView(view : any) {
      this.setState((prevState : any) => ({
        ...prevState,
        centerPointView: view,
      }));
    }

    addCenterPointWithImage(resource : string, width : number, height : number, onPress : ()=>void = null) {
      const view = this.createCenterView(resource, width, height, onPress);
      this.setState((prevState : any) => ({
        ...prevState,
        centerPointView: view,
      }));
    }

    createCenterView(resource : any, w : number, h : number, onPress : ()=>void) {
      return (
        <TouchableOpacity
          style={{ width: w, height: h, marginBottom: h }}
          onPress={onPress}
        >
          <Image
            source={resource}
            style={{ width: w, height: h }}
            resizeMode="stretch"
          />
        </TouchableOpacity>
      );
    }

    removeCenterPoint() {
      this.setState((prevState : any) => ({
        ...prevState,
        centerPointView: null,
      }));
    }


    addCameraIdleListener(listener : CameraChangeListener) {
      if (this.mCameraListeners.contains(listener)) {
        return;
      }
      this.mCameraListeners.add(listener);
    }

    removeCameraIdleListener(listener : CameraChangeListener) {
      if (!this.mCameraListeners.contains(listener)) {
        return;
      }
      this.mCameraListeners.removeValue(listener);
    }

    addLongClickListener(listener : (coordinate: LatLng)=>void) {
      if (this.mLongClickListeners.contains(listener)) {
        return;
      }
      this.mLongClickListeners.add(listener);
    }

    removeLongClickListener(listener : ()=>void) {
      if (!this.mLongClickListeners.contains(listener)) {
        return;
      }
      this.mLongClickListeners.removeValue(listener);
    }

    addMapClickListener(listener : (event : MapEvent)=>void) {
      if (this.mMapClickListeners.contains(listener)) {
        return;
      }
      this.mMapClickListeners.add(listener);
    }

    removeMapClickListener(listener : ()=>void) {
      if (!this.mMapClickListeners.contains(listener)) {
        return;
      }
      this.mMapClickListeners.removeValue(listener);
    }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
