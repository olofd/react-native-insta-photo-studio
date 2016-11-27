import {
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Camera from 'react-native-camera';

export default class PhotoCamera extends Component {

  constructor() {
    super();
    const {auto, on, off} = Camera.constants.FlashMode;
    this.state = {
      flashMode: auto,
      renderCamera : true
    };
  }
  /*
  <Icon style={styles.carrot} name='ios-arrow-down'></Icon>
  */
  takePicture() {
    this.camera.capture().then((data) => {
      this.props.onPhotoTaken(data);
    }).catch(err => console.error(err));
  }

  flashIconActive() {
    const {auto, on, off} = Camera.constants.FlashMode;
    return this.state.flashMode === auto || this.state.flashMode === on;
  }

  onFlashPress() {
    const {auto, on, off} = Camera.constants.FlashMode;
    let newFlashMode = auto;
    switch (this.state.flashMode) {
      case auto:
        newFlashMode = off;
        break;
      case off:
        newFlashMode = on;
        break;
      case on:
        newFlashMode = auto;
        break;
    }
    this.setState({
      flashMode : newFlashMode
    });
  }

  onTriggerPress() {
    this.takePicture()
  }

  renderFlashButton() {
    const {auto, on, off} = Camera.constants.FlashMode;
    const flashIconActive = this.flashIconActive();
    return (
      <TouchableOpacity
        onPress={this.onFlashPress.bind(this)}
        hitSlop={{
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }}
        style={[
        styles.flashContainer, flashIconActive
          ? styles.flashContainerActive
          : null
      ]}>
        <Icon
          name='ios-flash'
          style={[
          styles.flashIcon, flashIconActive
            ? styles.flashIconActive
            : null
        ]}></Icon>
        <Text
          style={[
          styles.automaticFlashText, this.state.flashMode === auto
            ? styles.automaticFlashTextVisible
            : null
        ]}>A</Text>
      </TouchableOpacity>
    );
  }

  renderTriggerButton() {
    return (
      <TouchableOpacity onPress={this.onTriggerPress.bind(this)} style={styles.triggerContainer}></TouchableOpacity>
    );
  }

  renderSettingsRow() {
    return (
      <View style={[styles.settingsRow, {width : this.props.window.width}]}>
        {this.renderFlashButton()}
      </View>
    );
  }

  renderPendingMedia(squareImageStyle) {
    if(!this.props.pendingMedia){
      return null;
    }
    return (
      <Image style={[styles.previewImage, squareImageStyle, {top : -squareImageStyle.height}]} source={{uri : this.props.pendingMedia.path}}></Image>
    );
  }

  renderCamera(squareImageStyle) {
    if(!this.state.renderCamera){
      return (
        <View style={[styles.preview, squareImageStyle, {backgroundColor : 'black'}]}>

        </View>
      );
    }
    return (
      <Camera
        captureAudio={false}
        onZoomChanged={() => {}}
        onFocusChanged={() => {}}
        flashMode={this.state.flashMode}
        ref={(cam) => {
        this.camera = cam;
      }}
        style={[styles.preview, squareImageStyle]}
        aspect={Camera.constants.Aspect.fill}>
      </Camera>
    );
  }

  render() {
    const squareImageStyle = {width : this.props.window.width, height : this.props.window.width};
    return (
      <View
        style={[
        styles.container, {
          width: this.props.window.width
        },
        this.props.style
      ]}>
        {this.renderCamera(squareImageStyle)}
        <View style={styles.photoButtonContainer}>
          {this.renderPendingMedia(squareImageStyle)}
          {this.renderSettingsRow()}
          {this.renderTriggerButton()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex : 1
  },
  preview: {
    justifyContent : 'center',
    alignItems: 'center'
  },
  previewImage : {
    position : 'absolute'
  },
  settingsRow : {
    top : -40,
    height : 30,
    position : 'absolute',
    flexDirection : 'row',
    justifyContent : 'flex-end',
    flex : 1
  },
  flashContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashContainerActive: {
    borderColor: 'white'
  },
  flashIcon: {
    fontSize: 25,
    color: 'rgba(255, 255, 255, 0.3)',
    backgroundColor : 'transparent'
  },
  flashIconActive: {
    color: 'white'
  },
  automaticFlashText: {
    color: 'white',
    fontSize: 10,
    position: 'absolute',
    right: 6,
    bottom: 6,
    opacity: 0,
    backgroundColor : 'transparent'
  },
  automaticFlashTextVisible : {
    opacity: 1
  },
  photoButtonContainer : {
    flex : 1,
    alignItems : 'center',
    justifyContent : 'center'
  },
  triggerContainer : {
    width : 80,
    height : 80,
    borderWidth : 15,
    borderColor : 'rgb(175, 175, 175)',
    borderRadius : 49
  }
});
