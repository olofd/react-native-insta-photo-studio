import PhotoManager from './photo-manager';
import React, { Component } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, ImageEditor } from 'react-native';
import CameraRollService from './services/camera-roll-service';
import AlbumList from './components/album-list';
import I18N from './I18n';
import AppService from './services/app-service';
import {Surface} from "gl-react-native"; // for React Native
import { Shaders, Node, GLSL } from "gl-react";
const shaders = Shaders.create({
  helloBlue: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`
  }
});
class HelloBlue extends React.Component {
  render() {
    const { blue } = this.props;
    return <Node
      shader={shaders.helloBlue}
      uniforms={{ blue }}
    />;
  }
}
/*import Instagram from './instagram';
import App from './effects/App';
import Edit from './components/edit/index'
*/
export default class InstaPhotoStudio extends Component {

  static defaultProps = {
    fontFamily: 'Arial',
    topBarHeight: 45,
    footerHeight: 45,
    cropperMagnification: 2.0,
    finnishCropperAnimationDuration: 200,
    showAlbumsAnimationDuration: 200
  }

  constructor() {
    super();
    this.listeners = [];
    this.state = {
      window: Dimensions.get('window'),
      currentAlbum: null,
      showAlbumsAnim: new Animated.Value(1),
      editStepAnim: new Animated.Value(0),
      appService: new AppService(ImageEditor)
    };
    this.albumsButtonPressed = false;
  }

  setupStyleObjs(props) {
    if (!this.state.styles || props.fontFamily !== this.props.fontFamily) {
      this.setState({
        styles: StyleSheet.create({
          fontStyle: {
            fontFamily: props.fontFamily
          }
        })
      });
    }
  }

  componentWillUnmount() {
    this.listeners.forEach(cb => cb && cb());
  }

  onLayout(e) {
    const { width, height } = e.nativeEvent.layout;
    if (width !== this.state.window.width || height !== this.state.window.height) {
      this.setState({
        window: {
          width,
          height
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setupStyleObjs(nextProps);
  }

  componentWillMount() {
    if (this.props.onEventEmitterCreated) {
      this.props.onEventEmitterCreated(this.state.appService);
    }
    const { appService } = this.state;
    const { cameraRollService } = appService;
    I18N(this.props.translations);

    this.setupStyleObjs(this.props);
    this.listeners.push(cameraRollService.onCurrentAlbumsChanged((currentAlbums) => {
      this.setState({ currentAlbums: currentAlbums });
    }));

    this.listeners.push(cameraRollService.onCurrentAlbumChanged((currentAlbum) => {
      this.setState({ currentAlbum: currentAlbum });
    }));

    this.listeners.push(cameraRollService.onAuthorizationChanged((authStatus) => {
      this.setState({ authStatus: authStatus });
    }));

    this.listeners.push(appService.onEditStepUpdated((stepIndex, stepName, stepModel) => {
      this.state.editStepAnim.stopAnimation((value) => {
        Animated.timing(this.state.editStepAnim, {
          toValue: stepIndex,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }));

    cameraRollService.authorize().then((authStatus) => {
      if (authStatus.isAuthorized) {
        cameraRollService.fetchAlbums();
      }
    });
  }

  onAlbumSelected(album) {
    const { cameraRollService } = this.state.appService;
    cameraRollService.setCurrentAlbum(album);
    this.onAlbumDropDownPressed();
  }

  onAlbumDropDownPressed() {
    this.state.showAlbumsAnim.stopAnimation((value) => {
      this.albumsButtonPressed = !this.albumsButtonPressed;
      Animated.timing(this.state.showAlbumsAnim, {
        toValue: this.albumsButtonPressed
          ? 0
          : 1,
        duration: this.props.showAlbumsAnimationDuration,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }).start();
    });
  }


  __render() {
    return <Surface width={300} height={300}>
  <HelloBlue blue={0.5} />
</Surface>
  }

  render() {
    const statePass = {
      window: this.state.window,
      styles: this.state.styles
    };
    const showAlbumViewAnim = {
      bottom: this.props.topBarHeight,
      transform: [
        {
          translateY: this.state.showAlbumsAnim.interpolate({
            inputRange: [
              0, 1
            ],
            outputRange: [this.props.topBarHeight, this.state.window.height]
          })
        }
      ]
    };
    return (
      <View style={styles.container} onLayout={this.onLayout.bind(this)}>
        <PhotoManager
          {...statePass}
          {...this.props}
          appService={this.state.appService}
          window={this.state.window}
          authStatus={this.state.authStatus}
          onAlbumDropDownPressed={this.onAlbumDropDownPressed.bind(this)}
          showAlbumsAnim={this.state.showAlbumsAnim}
          editStepAnim={this.state.editStepAnim}
          currentAlbum={this.state.currentAlbum}></PhotoManager>
        <Animated.View style={[styles.albumListModal, showAlbumViewAnim]}>
          <AlbumList {...statePass} {...this.props} albums={this.state.currentAlbums} onAlbumSelected={this.onAlbumSelected.bind(this)}></AlbumList>
        </Animated.View>
      </View>
    );
  }
}

/*
        <PhotoManager
          {...statePass}
          {...this.props}
          window={this.state.window}
          authStatus={this.state.authStatus}
          onAlbumDropDownPressed={this.onAlbumDropDownPressed.bind(this)}
          showAlbumsAnim={this.state.showAlbumsAnim}
          editStepAnim={this.state.editStepAnim}
          currentAlbum={this.state.currentAlbum}></PhotoManager>
        <Animated.View style={[styles.albumListModal, showAlbumViewAnim]}>
          <AlbumList {...statePass} {...this.props} albums={this.state.currentAlbums} onAlbumSelected={this.onAlbumSelected.bind(this)}></AlbumList>
        </Animated.View>
*/


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  albumListModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  }
});
