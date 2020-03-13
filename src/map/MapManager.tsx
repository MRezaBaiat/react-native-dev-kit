import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Shape,
  ViewStyle,
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
import Coordinates from './Coordinates';
import SmartComponent from '../views/SmartComponent';
import CameraChangeListener from './CameraChangeListener';
import Storage from '../utils/Storage';

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
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    };

    static lastKnownLocation : Coordinates = null;
    lastCameraIdlePointCalled : LatLng = null;
    mapView : MapView;

    listeners = {
      cameraListeners: [] as CameraChangeListener[],
      longClickListeners: [] as ((coordinate: LatLng)=>void)[],
      mapClickListeners: [] as ((event : MapEvent)=>void)[],
    };

    state = {
      markerLayersList: [] as MarkerLayer[],
      shapes: [] as Shape[],
      focused: true,
      centerPointView: null as any,
      trafficEnabled: false,
      myLocationButtonVisible: true,
      navigating: false,
    };

    componentDidMount(): void {
      const { onMapReady } = this.props;
      onMapReady && onMapReady(this);
    }

    componentWillUnmount(): void {
      this.pause();
    }

    render() {

      const { markerLayersList, trafficEnabled, centerPointView } = this.state;
      const {
        panelMargins, navigationMarginTop, navigationButton, style, initialRegion, children,
      } = this.props;

      const myLocationMarginTop = panelMargins ? panelMargins.top : 7;
      const myLocationMarginsRight = panelMargins ? panelMargins.right : 7;

      return (
        <View
          style={[styles.container, style, { zIndex: 0 }]}
        >
          <MapView
            initialRegion={initialRegion}
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
            showsTraffic={trafficEnabled}
            style={styles.map}
          >
            {
                  markerLayersList.map((layer) => layer.getMarkers().map((marker) => marker.render()))
              }

          </MapView>
          {
             centerPointView
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
                    children
                }
        </View>
      );
    }

    onRegionChange = (region : Region) => {
      this.centerRegion = region;
    };

    getCenterCoordinate() : Region {
      return this.centerRegion;
    }

    clickPerformed(event : MapEvent) {
      const { mapClickListeners } = this.listeners;
      if (mapClickListeners.length === 0) {
        return;
      }
      mapClickListeners.forEach((listener) => listener(event));
    }

    longPressPerformed(event: MapEvent) {
      const { longClickListeners } = this.listeners;
      if (longClickListeners.length === 0) {
        return;
      }
      longClickListeners.forEach((listener) => listener(event.nativeEvent.coordinate));
    }

    cameraChangeStarted(event : MapEvent) {
      const { focused } = this.state;
      const { cameraListeners } = this.listeners;
      focused && this.setState((prevState : any) => ({
        ...prevState,
        focused: false,
      }));
      if (cameraListeners.length === 0) {
        return;
      }
      cameraListeners.forEach((listener) => {
        listener.onStartCameraChange && listener.onStartCameraChange(event);
      });
    }

    cameraChangeEnded = (region : Region) => {
      this.centerRegion = region;
      const { cameraListeners } = this.listeners;
      const { lastCameraIdlePointCalled } = this;
      if (cameraListeners.length === 0) {
        return;
      }
      const centerPoint : LatLng = this.getCenterCoordinate();
      if (lastCameraIdlePointCalled
          && centerPoint.latitude === lastCameraIdlePointCalled.latitude
          && centerPoint.longitude === lastCameraIdlePointCalled.longitude) {
        return;
      }
      this.lastCameraIdlePointCalled = centerPoint;
      cameraListeners.forEach((listener) => {
        listener.onCameraIdle && listener.onCameraIdle();
      });
    };

    isTrafficEnabled() : boolean {
      return this.state.trafficEnabled;
    }

    setMyLocationVisibile(visible : boolean) {
      this.setState((prevState : any) => ({
        ...prevState,
        myLocationButtonVisible: visible,
      }));
    }

    setTrafficEnabled(enabled : boolean) {
      this.setState((prevState : any) => ({
        ...prevState,
        trafficEnabled: enabled,
      }));
    }

    createMarkerLayer() : MarkerLayer {
      const { markerLayersList } = this.state;
      const layer = new MarkerLayer(() => {
        this.forceUpdate();
      });
      this.setState((prevState: any) => ({
        ...prevState,
        markerLayersList: [...markerLayersList, layer],
      }));
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

    addShape(shape : Shape) {
      const { shapes } = this.state;
      if (shapes.includes(shape)) {
        return shape;
      }
      this.setState((prevState : any) => ({
        ...prevState,
        shapes: [...shapes, shape],
      }));
      return shape;
    }

    removeShape(shape : Shape) {
      const { shapes } = this.state;
      if (!shapes.includes(shape)) {
        return;
      }
      const list = [...shapes];
      list.splice(list.indexOf(shape));
      this.setState((prevState : any) => ({
        ...prevState,
        shapes: list,
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
        Storage.set(MapManager.SP_LAST_LOCATION_INDENTIFIER, JSON.stringify(MapManager.lastKnownLocation));
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
      const { cameraListeners } = this.listeners;
      !cameraListeners.includes(listener) && cameraListeners.push(listener);
    }

    removeCameraIdleListener(listener : CameraChangeListener) {
      const { cameraListeners } = this.listeners;
      cameraListeners.includes(listener) && cameraListeners.splice(cameraListeners.indexOf(listener));
    }

    addLongClickListener(listener : (coordinate: LatLng)=>void) {
      const { longClickListeners } = this.listeners;
      !longClickListeners.includes(listener) && longClickListeners.push(listener);
    }

    removeLongClickListener(listener : ()=>void) {
      const { longClickListeners } = this.listeners;
      longClickListeners.includes(listener) && longClickListeners.splice(longClickListeners.indexOf(listener));
    }

    addMapClickListener(listener : (event : MapEvent)=>void) {
      const { mapClickListeners } = this.listeners;
      !mapClickListeners.includes(listener) && mapClickListeners.push(listener);
    }

    removeMapClickListener(listener : ()=>void) {
      const { mapClickListeners } = this.listeners;
      mapClickListeners.includes(listener) && mapClickListeners.splice(mapClickListeners.indexOf(listener));
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
