import React, { Component } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { LatLng } from 'react-native-maps';
import ArrayList from '../objects/ArrayList';
import LangUtils from '../utils/LangUtils';
import PlatformsUtils from '../utils/PlatformsUtils';
import Coordinates from './Coordinates';
import LocalFiles from '../LocalFiles';

interface Props{
    fontStyle?: any,
    onItemSelected : (item : ArrayList<Coordinates>)=>void,
    onBackPressed: ()=>void
}

export default class SearchAddressHandler extends Component<Props> {

    mFontStyle : ViewStyle;

    onItemSelected: {(item: ArrayList<Coordinates>): void};

    onBackPressed : ()=>void;

    static mApiKey: string;

    state={
      data: new ArrayList(),
    }

    static init(apiKey : string) {
      SearchAddressHandler.mApiKey = apiKey;
    }

    componentDidMount(): void {
      const { fontStyle, onItemSelected, onBackPressed } = this.props;

      this.mFontStyle = fontStyle;
      this.onItemSelected = onItemSelected;
      this.onBackPressed = onBackPressed;
      this.setState((prevState) => ({
        ...prevState,
      }));
    }

    render() {
      const { data } = this.state;
      return (
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
          <TouchableOpacity
            style={{
              width: 40, height: 40, marginRight: 'auto', marginTop: PlatformsUtils.isAndroid() ? 10 : 20, marginLeft: 10,
            }}
            onPress={this.onBackPressed}
          >
            <Image
              style={{ width: 40, height: 40 }}
              source={LocalFiles.back_button}
              resizeMode="stretch"
            />
          </TouchableOpacity>
          <TextInput
            placeholderTextColor="#0099cc"
            placeholder="جستجو"
            style={[{
              textAlign: 'right', padding: 10, marginTop: 10, marginBottom: 'auto', width: '90%', height: 60, marginRight: '5%', marginLeft: '5%', borderColor: 'grey', borderWidth: 0.5,
            }, this.mFontStyle]}
            onChangeText={(text) => {
              SearchAddressHandler.searchAddress(text)
                .then((res) => {
                  this.setState((prevState) => ({
                    ...prevState,
                    data: res.predictions,
                  }));
                });
            }}
          />
          <FlatList
            style={{ width: '100%' }}
            data={data}
                        // @ts-ignore
            renderItem={(item) => (
              <ViewHolder
                onItemSelected={this.onItemSelected}
                textStyle={this.mFontStyle}
                item={item}
              />
            )}
          />
        </View>
      );
    }


    static async findReference(placeId : String) : Promise<ArrayList<Coordinates>> {
      return fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&language=fa&key=${SearchAddressHandler.mApiKey}`)
        .then((res) => (res.ok ? res.json() : null)).then((resJson) => {
          if (!resJson) {
            return null;
          }
          const list : ArrayList<Coordinates> = new ArrayList();
          list.add(new Coordinates(resJson.result.geometry.viewport.northeast.lat, resJson.result.geometry.viewport.northeast.lng));
          list.add(new Coordinates(resJson.result.geometry.viewport.southwest.lat, resJson.result.geometry.viewport.southwest.lng));
          return list;
        });
    }

    /**
     * let url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="
     + encodeURIComponent(address)
     + (MapManager.getInstance().getLastKnownLocation() == null ? "" : "&location="+MapManager.getInstance().getLastKnownLocation().latitude+","+MapManager.getInstance().getLastKnownLocation().longitude+"&radius=500")
     + "&types=geocode&language=fa&sensor=true&components=country:ir&key="+PLACES_API_KEY;
     */
    static async searchAddress(text : String) {
      return await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&lang=fa&key=${this.mApiKey}`, {
        headers: {
          'Accept-Language': 'fa-IR,fa',
        },
      })
        .then((res) => (res.ok ? res.json() : null)).then((resJson) => resJson);
    }

    static async geocode(latLng : LatLng) {
      return await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng.latitude},${latLng.longitude}&lang=fa&key=${SearchAddressHandler.mApiKey}`, {
        headers: {
          'Accept-Language': 'fa-IR,fa',
        },
      })
        .then((res) => (res.ok ? res.json() : null)).then((resJson) => {
          if (resJson == null) {
            return null;
          }

          for (const place of resJson.results) {
            if (!LangUtils.containsEnglish(place.formatted_address)) {
              return place.formatted_address;
            }
          }
          return resJson.results[0].formatted_address;
        });
    }
}

interface HolderProps {
    item: { item: Predict; },
    textStyle : TextStyle,
    onItemSelected: (item: ArrayList<Coordinates>) => void
}
const ViewHolder = (props : HolderProps) => {
  const { item, textStyle } = props;
  const predict : Predict = item.item;
  const title = predict.structured_formatting.main_text;
  const desc = predict.description;
  return (
    <TouchableOpacity
      style={{ width: '100%', marginTop: 5 }}
      onPress={() => {
        SearchAddressHandler.findReference(predict.place_id).then((res : ArrayList<Coordinates>) => {
          if (res) {
            props.onItemSelected(res);
          }
        });
      }}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[{
          color: '#1ba792', marginRight: 15, marginLeft: 15, textAlign: 'center', fontSize: 18,
        }, textStyle]}
        >
          {title}
        </Text>
        <Text style={[{
          color: '#1b8fa7', marginTop: 10, marginRight: 15, marginLeft: 15, textAlign: 'center', fontSize: 16,
        }, textStyle]}
        >
          {desc}
        </Text>
        <View style={{
          backgroundColor: '#99C9C9C9', width: '90%', marginRight: '5%', marginLeft: '5%', height: 1, marginTop: 10,
        }}
        />
      </View>
    </TouchableOpacity>
  );
};

class Predict {
    description : String;
    reference : String;
    place_id : String;
    structured_formatting: { main_text: string; };
}
