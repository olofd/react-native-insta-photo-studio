import PhotoManager from './photo-manager';
import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import photoFrameworkService from './services/camera-roll-service';
import AlbumList from './components/album-list';
export default class InstaPhotoStudio extends Component {

  constructor() {
    super();
    this.ch = [];
    this.state = {
      window: Dimensions.get('window'),
      currentAlbum: null,
      showAlbumsAnim: new Animated.Value(1)
    };
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

  componentWillMount() {
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

  showAlbumView() {}

  hideAlbumView() {}

  renderLoading() {
    return (
      <View style={{flex : 1, backgroundColor : 'red'}}></View>
    );
  }

  render() {
    if(!this.state.authStatus || this.state.authStatus.isAuthorized) {
      if (!this.state.currentAlbum || !this.state.currentAlbums) {
        return this.renderLoading();
      }
    }
    const showAlbumViewAnim = {
      transform: [
        {
          translateY: this.state.showAlbumsAnim.interpolate({
            inputRange: [
              0, 1
            ],
            outputRange: [45, this.state.window.height]
          })
        }
      ]
    };
    return (
      <View style={styles.container} onLayout={this.onLayout.bind(this)}>
        <PhotoManager
          authStatus={this.state.authStatus}
          showAlbumView={this.showAlbumView.bind(this)}
          hideAlbumView={this.hideAlbumView.bind(this)}
          showAlbumsAnim={this.state.showAlbumsAnim}
          window={this.state.window}
          currentAlbum={this.state.currentAlbum}></PhotoManager>
        <Animated.View style={[styles.albumListModal, showAlbumViewAnim]}>
          <AlbumList albums={this.state.currentAlbums}></AlbumList>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //  overflow : 'hidden'
  },
  albumListModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
