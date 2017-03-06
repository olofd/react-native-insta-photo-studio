import PhotoManager from './photo-manager';
import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions, Easing} from 'react-native';
import photoFrameworkService from './services/camera-roll-service';
import AlbumList from './components/album-list';
import I18N from './I18n';

export default class InstaPhotoStudio extends Component {

  static defaultProps = {
    fontFamily: 'Arial',
    libraryDisplayName: 'Library',
    photoDisplayName: 'Photo',
    topBarHeight : 45,
    footerHeight : 45,
    cropperMagnification : 2.0,
    finnishCropperAnimationDuration : 200,
    showAlbumsAnimationDuration : 200,
    unauthorizedHeaderText : 'Grant access to your photos',
    unauthorizedSubtitle : 'This will make it possible for this app to crop and select photos from the camera roll.',
    unauthorizedSettingsButtonText : 'Activate access to library'
  }

  constructor() {
    super();
    this.ch = [];
    this.state = {
      window: Dimensions.get('window'),
      currentAlbum: null,
      showAlbumsAnim: new Animated.Value(1)
    };
    this.albumsButtonPressed = false;
  }

  setupStyleObjs(props) {
    if(!this.state.styles || props.fontFamily !== this.props.fontFamily) {
      this.setState({
        styles : StyleSheet.create({
          fontStyle : {
            fontFamily : props.fontFamily
          }
        })
      });
    }
  }

  componentWillUnmount() {
    this.ch.forEach(cb => cb && cb());
  }

  onLayout(e) {
    const {width, height} = e.nativeEvent.layout;
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
    I18N(this.props.translations);
    this.setupStyleObjs(this.props);
    this.ch.push(photoFrameworkService.onCurrentAlbumsChanged((currentAlbums) => {
      this.setState({currentAlbums: currentAlbums});
    }));

    this.ch.push(photoFrameworkService.onCurrentAlbumChanged((currentAlbum) => {
      this.setState({currentAlbum: currentAlbum});
    }));

    this.ch.push(photoFrameworkService.onAuthorizationChanged((authStatus) => {
      this.setState({authStatus: authStatus});
    }));

    photoFrameworkService.authorize().then((authStatus) => {
      if(authStatus.isAuthorized) {
        photoFrameworkService.fetchAlbums();
      }
    });
  }

  onAlbumSelected(album) {
    photoFrameworkService.setCurrentAlbum(album);
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
        easing: Easing. in(Easing.ease)
      }).start();
    });
  }


  render() {
    const statePass = {
      window : this.state.window,
      styles : this.state.styles
    };
    const showAlbumViewAnim = {
      bottom : this.props.topBarHeight,
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
          window={this.state.window}
          authStatus={this.state.authStatus}
          onAlbumDropDownPressed={this.onAlbumDropDownPressed.bind(this)}
          showAlbumsAnim={this.state.showAlbumsAnim}
          currentAlbum={this.state.currentAlbum}></PhotoManager>
        <Animated.View style={[styles.albumListModal, showAlbumViewAnim]}>
          <AlbumList {...statePass} {...this.props} albums={this.state.currentAlbums} onAlbumSelected={this.onAlbumSelected.bind(this)}></AlbumList>
        </Animated.View>
      </View>
    );
  }
}


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
