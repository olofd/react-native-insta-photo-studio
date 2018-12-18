import {
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Dimensions,
  Image,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Camera from 'react-native-camera';
import BlockView from 'react-native-scroll-block-view';
import photoFrameworkService from '../../services/camera-roll-service';
const TRIGGER_BUTTON_WIDTH = 80;
const TRIGGER_BUTTON_BORDER = 14;
const TRIGGER_RETENTION = {
  top: 100,
  left: 100,
  bottom: 100,
  right: 100
};
const SETTINGS_BUTTON_HIT_SLOPE = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20
};
export default class PhotoCamera extends Component {

  constructor() {
    super();
    const {auto, on, off} = Camera.constants.FlashMode;
    this.state = {
      type: Camera.constants.Type.back,
      flashMode: auto,
      renderCamera: true,
      triggerAnim: new Animated.Value(0)
    };
  }

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
    this.setState({flashMode: newFlashMode});
  }

  onTriggerPress() {
    this.takePicture()
  }

  renderSettingsRow() {
    return (
      <View
        style={[
        styles.settingsRow, {
          width: this.props.window.width
        }
      ]}>
        <View style={styles.leftSettingsContainer}>
          {this.renderChangeCameraIcon()}
        </View>
        <View style={styles.rightSettingsContainer}>
          {this.renderFlashButton()}
        </View>
      </View>
    );
  }

  onChangeCamera() {
    const {front, back} = Camera.constants.Type;
    this.setState({
      type: this.state.type === back
        ? front
        : back
    });
  }

  renderChangeCameraIcon() {
    return (
      <TouchableOpacity
        onPress={this.onChangeCamera.bind(this)}
        hitSlop={SETTINGS_BUTTON_HIT_SLOPE}
        style={styles.changeCameraContainer}>
        <IconFontAwesome name='refresh' style={styles.changeCameraIcon}></IconFontAwesome>
      </TouchableOpacity>
    );
  }

  renderFlashButton() {
    const {auto, on, off} = Camera.constants.FlashMode;
    const flashIconActive = this.flashIconActive();
    return (
      <TouchableOpacity
        onPress={this.onFlashPress.bind(this)}
        hitSlop={SETTINGS_BUTTON_HIT_SLOPE}
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

  animateTriggerButton(toValue) {
    Animated.timing(this.state.triggerAnim, {
      useNativeDriver: true,
      toValue: toValue,
      duration: 150
    }).start();
  }

  renderTriggerButton() {
    return (
      <BlockView>
        <TouchableWithoutFeedback
          onPress={this.onTriggerPress.bind(this)}
          pressRetentionOffset={TRIGGER_RETENTION}
          onPressIn={this.animateTriggerButton.bind(this, 1)}
          onPressOut={this.animateTriggerButton.bind(this, 0)}>
          <View style={styles.buttonContainer}>
            <Animated.View style={styles.triggerContainer}></Animated.View>
            <Animated.View
              style={[
              styles.triggerContainerActive, {
                opacity: this.state.triggerAnim
              }
            ]}></Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </BlockView>
    );
  }

  renderPendingMedia(squareImageStyle) {
    if (!this.props.pendingMedia) {
      return null;
    }
    return (
      <Image
        style={[
        styles.previewImage,
        squareImageStyle, {
          top: -squareImageStyle.height
        }
      ]}
        source={{
          uri : this.props.pendingMedia.path
        }}></Image>
    );
  }

  renderCamera(squareImageStyle) {
    if (!this.state.renderCamera) {
      return (
        <View
          style={[
          styles.preview,
          squareImageStyle, {
            backgroundColor: 'black'
          }
        ]}></View>
      );
    }
    return (
      <Camera
        mirrorImage={true}
        type={this.state.type}
        captureAudio={false}
        onZoomChanged={() => {}}
        onFocusChanged={() => {}}
        flashMode={this.state.flashMode}
        ref={(cam) => {
        this.camera = cam;
      }}
        style={[styles.preview, squareImageStyle]}
        aspect={Camera.constants.Aspect.fill}></Camera>
    );
  }

  /*
  captureTarget={Camera.constants.CaptureTarget.temp}

  */

  render() {
    const squareImageStyle = {
      width: this.props.window.width,
      height: this.props.window.width
    };
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
    flex: 1,
    overflow: 'hidden'
  },
  preview: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: {
    position: 'absolute'
  },
  settingsRow: {
    top: -40,
    height: 30,
    position: 'absolute',
    flexDirection: 'row',
    flex: 1
  },
  leftSettingsContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 15
  },
  rightSettingsContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 15
  },
  changeCameraContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flashContainer: {
    right: 0,
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flashContainerActive: {
    borderColor: 'white'
  },
  flashIcon: {
    fontSize: 25,
    color: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent'
  },
  changeCameraIcon: {
    fontSize: 25,
    color: 'white',
    backgroundColor: 'transparent'
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
    backgroundColor: 'transparent'
  },
  automaticFlashTextVisible: {
    opacity: 1
  },
  photoButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    width: 83,
    height: 83
  },
  triggerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: TRIGGER_BUTTON_WIDTH,
    height: TRIGGER_BUTTON_WIDTH,
    borderWidth: TRIGGER_BUTTON_BORDER,
    borderColor: '#cccccc',
    borderRadius: TRIGGER_BUTTON_WIDTH / 2
  },
  triggerContainerActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: TRIGGER_BUTTON_WIDTH,
    height: TRIGGER_BUTTON_WIDTH,
    borderWidth: TRIGGER_BUTTON_BORDER,
    borderColor: '#afafaf',
    borderRadius: TRIGGER_BUTTON_WIDTH / 2,
    backgroundColor: '#dbdbdb'
  }
});
