import React, {Component} from 'react';
import {Image} from 'react-native';
import CameraRollPhotoKit from './components/camera-roll';
import CameraRollPicker from './components/camera-roll-picker';
export default class PhotoKitTest extends Component {

  componentWillMount() {
    CameraRollPhotoKit.getPhotos().then((photos) => {
      debugger;
    });
  }

  render() {
    return <Image source={{uri : 'ph://FBED0A15-1063-4C7B-8300-6F2730E9E857/L0/001', width : 100, height : 100}}></Image>;
  }
}
