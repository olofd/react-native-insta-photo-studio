import {
  View,
  Text,
  StyleSheet,
  PixelRatio,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Animated,
  InteractionManager,
  Easing,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import React, { Component } from 'react';
import Header from './components/header';
import Footer from './components/footer';
import CameraRollPicker from './components/camera-roll-picker';
import PhotoCamera from './components/camera';
import CropperView from './components/cropper-view';
import Swiper from './components/swiper';
import clamp from 'clamp';
import Unauthorized from './components/unauthorized';
import I18n from 'react-native-i18n';
import cameraRollService from './services/camera-roll-service';
//import mediaStore from '../services/mediaStore';
const SCROLLVIEW_REF = "SCROLLVIEW_REF";

export default class PhotoManager extends Component {

  static defaultProps = {
    finnishCropperAnimationDuration: 200,
    topBarHeight: 45,
    footerHeight: 45,
    window: Dimensions.get('window')
  };

  constructor(props) {
    super(props);
    this.startValue = 0;
    this.isResponding = true;
    this.state = {
      headerHasNextButton: true,
      anim: new Animated.Value(0),
      isRetracted: false,
      currentLibraryImage: undefined,
      currentCameraImage: undefined,
      forceTopBarShow: false,
      currentSwiperIndex: 0,
      smallCameraRollContainer: true,
      swiperIndexHasChangedAtSomePoint: false
    };
    this.currentSwiperIndex = 0;
    this.listeners = [];
  }

  componentWillMount() {
    this.updateHeader('library');
    this.listeners.push(cameraRollService.onSelectionChanged((selectedImages, changedImages, newSelection) => {
      this.setState({
        currentLibraryImage: newSelection
      });
      if (this.isRetracted()) {
        this.finnishAnimation(false);
      }
    }));
  }

  componentWillUnmount() {
    this.listeners.forEach(cb => cb());
  }

  onFooterPress(action) {
    this.updateHeader(action);
    this.swiper && this.swiper.scrollToPage(action === 'library'
      ? 0
      : 1);
  }

  updateHeader(action) {
    let headerTitle = this.state.headerTitle;
    let headerHasNextButton = true;
    switch (action) {
      case 'library':
        headerHasNextButton = this.state.currentLibraryImage;
        headerTitle = I18n.t('library');
        break;
      case 'photo':
        headerHasNextButton = false;
        headerTitle = I18n.t('photo');
        break;
      default:
    }
    this.setState({ headerTitle, headerHasNextButton });
  }

  onPhotoTaken(photo) {
    this.setState({
      currentCameraImage: photo
    });
  }

  onCancelAction() {
    this.props.onClose && this.props.onClose();
  }

  willStartAnimating() {
    this.isResponding = false;
    this.state.anim.stopAnimation((value) => {
      this.startValue = value;
      this.isResponding = true;
    });
  }

  getAnimationValue(val) {
    if (!this.isResponding) {
      return;
    }
    const fixedValue = ((-val) + this.startValue);
    const minimum = -this.props.window.width;
    const maximum = 0;
    if (fixedValue > minimum && fixedValue < maximum) {
      return {
        fixedValue: clamp(minimum, fixedValue, maximum),
        inputValue: val
      };
    }
  }

  animate(val, correctedValue) {
    const valueObj = correctedValue || this.getAnimationValue(val);
    if (valueObj !== undefined) {
      this.state.anim.setValue(valueObj.fixedValue);
      if (valueObj.inputValue > 0 && this.state.smallCameraRollContainer) {
        this.setState({ smallCameraRollContainer: false });
      }
    }
  }

  finnishAnimation(finnishRetracted) {
    const retractedValue = (-this.props.window.width);
    this.isResponding = false;
    this.state.anim.stopAnimation((value) => {
      Animated.timing(this.state.anim, {
        toValue: finnishRetracted
          ? retractedValue
          : 0,
        duration: this.props.finnishCropperAnimationDuration,
        easing: Easing.inOut(Easing.ease),
        //useNativeDriver : true
      }).start((e) => {
        if (e.finished) {
          this.startValue = finnishRetracted
            ? retractedValue
            : 0;
          const isRetracted = this.isRetracted();
          if (!isRetracted && !this.state.smallCameraRollContainer) {
            this.setState({ smallCameraRollContainer: true });
          }
        }
      });
    });
    this.setState({ isRetracted: finnishRetracted });
  }

  isRetracted() {
    return (this.startValue < (-this.props.window.width / 2));
  }

  resetAnimation() {
    this.finnishAnimation(this.isRetracted());
  }

  onSelectedPageChanged(newPageIndex, lastPageIndex) {
    if (newPageIndex !== this.state.currentSwiperIndex) {
      this.setState({ currentSwiperIndex: newPageIndex, swiperIndexHasChangedAtSomePoint: true });
      this.updateHeader(newPageIndex === 0
        ? 'library'
        : 'photo');
      //Force to show header if we a are not on the firstpage, but it's retracted.
      this.setState({
        forceTopBarShow: newPageIndex !== 0 && this.isRetracted()
      });
    }
  }

  getCurrentImageForSwiperIndex() {
    if (this.state.currentSwiperIndex === 0) {
      return this.state.currentLibraryImage;
    }

    if (this.state.currentSwiperIndex === 1) {
      return this.state.currentCameraImage;
    }
  }

  _renderCropper() {
    const cropperView = {
      height: this.props.window.width
    };
    return (<CropperView
      anim={this.state.anim}
      style={[styles.absolute, cropperView]}
      willStartAnimating={this.willStartAnimating.bind(this)}
      finnishAnimation={this.finnishAnimation.bind(this)}
      getAnimationValue={this.getAnimationValue.bind(this)}
      animate={this.animate.bind(this)}
      resetAnimation={this.resetAnimation.bind(this)}
      image={this.state.currentLibraryImage}
      magnification={this.props.cropperMagnification}
      window={this.props.window} />);
  }

  _renderPicker() {
    if (!this.props.currentAlbum) {
      return null;
    }
    const imageMargin = 2;
    const cameraRollPickerView = {
      marginTop: this.props.window.width,
      paddingBottom: this.props.footerHeight + this.props.topBarHeight
    };

    const mainAreaHeight = (this.props.window.height - this.props.topBarHeight - this.props.footerHeight);

    const scrollViewStyle = {
      position: 'absolute',
      height: this.state.smallCameraRollContainer
        ? (mainAreaHeight - this.props.window.width)
        : mainAreaHeight,
      width: this.props.window.width
    };

    return (
      <CameraRollPicker
        currentAlbum={this.props.currentAlbum}
        scrollViewStyle={scrollViewStyle}
        scrollToRowOnSelection={this.state.isRetracted}
        replaceSelection={true}
        initalSelectedImageIndex={0}
        top={this.state.isRetracted
          ? 50
          : (this.props.window.width + this.props.topBarHeight)}
        willStartAnimating={this.willStartAnimating.bind(this)}
        finnishAnimation={this.finnishAnimation.bind(this)}
        getAnimationValue={this.getAnimationValue.bind(this)}
        animate={this.animate.bind(this)}
        resetAnimation={this.resetAnimation.bind(this)}
        style={cameraRollPickerView}
        maximum={1}
        window={this.props.window}
        imageMargin={imageMargin}
        imagesPerRow={4}></CameraRollPicker>
    );
  }

  _renderLoading() {
    return (
      <View
        style={[
          styles.loadingContainer, {
            width: this.props.window.width
          }
        ]}>
        <ActivityIndicator></ActivityIndicator>
      </View>
    );
  }

  _renderLibraryPicker(animationStyle) {
    if (this.props.authStatus && !this.props.authStatus.isAuthorized) {
      return (
        <Unauthorized
          style={{
            width: this.props.window.width,
            paddingBottom: this.props.footerHeight
          }}
          {...this.props}></Unauthorized>
      );
    }

    if (!this.props.currentAlbum) {
      return this._renderLoading();
    }

    const mainAnimationContainer = {
      marginTop: this.props.topBarHeight,
      height: this.props.window.height + this.props.window.width
    };

    return (
      <Animated.View
        style={[animationStyle, styles.mainAnimationContainer, mainAnimationContainer]}>
        {this._renderPicker()}
        {this._renderCropper()}
      </Animated.View>
    );
  }

  _renderHeader(animationStyle) {
    const currentImage = this.getCurrentImageForSwiperIndex();
    const forceTopBarAnim = {
      height: this.props.topBarHeight
    };
    if (this.state.forceTopBarShow) {
      forceTopBarAnim.transform = [
        {
          translateY: 0
        }
      ];
    }
    const renderMenu = !!this.props.authStatus;
    const renderExitMenu = !this.state.swiperIndexHasChangedAtSomePoint && this.props.authStatus && !this.props.authStatus.isAuthorized
    return (
      <Animated.View
        style={[animationStyle, styles.absolute, styles.headerContainer, forceTopBarAnim]}>
        <Header
          styles={this.props.styles}
          renderMenu={renderMenu}
          renderExitMenu={renderExitMenu}
          showAlbumsAnim={this.props.showAlbumsAnim}
          currentAlbum={this.props.currentAlbum}
          onAlbumDropDownPressed={this.props.onAlbumDropDownPressed}
          hasNextButton={currentImage !== undefined}
          height={this.props.topBarHeight}
          headerTitle={this.state.headerTitle}
          showAlbumsDropDown={this.state.currentSwiperIndex === 0}
          onCancelAction={this.onCancelAction.bind(this)}></Header>
      </Animated.View>
    );
  }
  _render() {
    if (!this.props.currentAlbum) {
      return null;
    }
    const animationStyle = {
      transform: [
        {
          translateY: this.state.anim
        }
      ]
    };
    return (
      <CameraRollPicker
        currentAlbum={this.props.currentAlbum}
        scrollToRowOnSelection={this.state.isRetracted}
        onSelectedImagesChanged={this.onSelectedImagesChanged.bind(this)}
        replaceSelection={true}
        initalSelectedImageIndex={0}
        top={0}
        willStartAnimating={this.willStartAnimating.bind(this)}
        finnishAnimation={this.finnishAnimation.bind(this)}
        getAnimationValue={this.getAnimationValue.bind(this)}
        animate={this.animate.bind(this)}
        resetAnimation={this.resetAnimation.bind(this)}
        maximum={1}
        window={this.props.window}
        imageMargin={2}
        imagesPerRow={4}></CameraRollPicker>);
  }
  render() {
    const animationStyle = {
      transform: [
        {
          translateY: this.state.anim
        }
      ]
    };
    return (
      <View style={styles.container}>
        <StatusBar hidden={true}></StatusBar>
        <Swiper
          topBarHeight={this.props.topBarHeight}
          pageWillChange={this.onSelectedPageChanged.bind(this)}
          selectedPageChanged={this.onSelectedPageChanged.bind(this)}
          window={this.props.window}
          ref={swiper => this.swiper = swiper}>
          {this._renderLibraryPicker(animationStyle)}
          <PhotoCamera
            pendingMedia={this.state.currentCameraImage}
            style={{
              paddingTop: this.props.topBarHeight,
              paddingBottom: this.props.footerHeight
            }}
            onPhotoTaken={this.onPhotoTaken.bind(this)}
            window={this.props.window}></PhotoCamera>
        </Swiper>
        {this._renderHeader(animationStyle)}
        <Footer
          onPress={this.onFooterPress.bind(this)}
          style={styles.footer}
          styles={this.props.styles}
          selectedTab={this.state.currentSwiperIndex === 0
            ? 'library'
            : 'photo'}
          height={this.props.footerHeight}></Footer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  mainAnimationContainer: {
    overflow: 'hidden'
  },
  swiper: {},
  headerContainer: {},
  cropperContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
