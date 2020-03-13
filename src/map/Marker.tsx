import React from 'react';
import CustomMarker, {MarkerProps} from "./CustomMarker";

export default class Marker {
  props: MarkerProps;
  constructor (props: MarkerProps) {
    this.props = props;
  }

  get key () {
    return this.props.key;
  }

  render () {
    return(
        <CustomMarker {...this.props}/>
    )
  }
}
