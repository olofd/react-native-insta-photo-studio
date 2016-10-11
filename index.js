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
  Easing
} from 'react-native';
import fonts from './fonts.js';
import Icon from 'react-native-vector-icons/Ionicons';
import React, {Component} from 'react';
import Header from './header';
import Footer from './footer';
import ImageCopperView from './image-cropper-view';
import CameraRollPicker from './camera-roll-picker';
import PhotoCamera from './photo-camera';
import Swiper from 'react-native-swiper';
import ImageCropperViewSwitch from './image-cropper-view-switch';
import clamp from 'clamp';
const SCROLLVIEW_REF = "SCROLLVIEW_REF";
const TOP_BAR_HEIGHT = 45;
const FOOTER_HEIGHT = 45;

export default class PhotoManager extends Component {

  constructor() {
    super();
    this.startValue = 0;
    this.isResponding = true;
    this.state = {
      headerHasNextButton: true,
      pendingMedia: null,
      animatedViewHeight: undefined,
      anim: new Animated.Value(0),
      isRetracted: false,
      currentImage: undefined,
      forceTopBarShow: false,
      currentSwiperIndex: 0,
      swiperScrollEnabled: true
    };
    this.currentSwiperIndex = 0;
  }

  componentWillMount() {
    this.updateHeader('library');
  }

  onFooterPress(action) {
    this.updateHeader(action);
    if (this.state.currentSwiperIndex === 0 && action === 'photo') {
      this.swiper.scrollBy(1);
    }
    if (this.state.currentSwiperIndex === 1 && action === 'library') {
      this.swiper.scrollBy(-1);
    }
  }

  updateHeader(action) {
    let headerTitle = this.state.headerTitle;
    let headerHasNextButton = true;
    switch (action) {
      case 'library':
        headerTitle = 'Bibliotek';
        break;
      case 'photo':
        headerHasNextButton = false;
        headerTitle = 'Foto';
        break;
      default:

    }
    this.setState({headerTitle, headerHasNextButton});
  }

  onPhotoTaken(photo) {}

  onCancelAction() {
    if (this.state.pendingMedia) {
      this.setState({pendingMedia: null});
    } else {
      this.props.navigationActions.pop();
    }
  }

  willStartAnimating() {
    this.isResponding = false;
    this.state.anim.stopAnimation((value) => {
      this.startValue = value;
      this.isResponding = true;
    });
  }

  getClampedAnimationValue(val) {
    if (!this.isResponding) {
      return;
    }
    const fixedValue = ((-val) + this.startValue);
    const minimum = -this.props.window.width;
    const maximum = 0;
    if (fixedValue > minimum && fixedValue < maximum) {
      return clamp(minimum, fixedValue, maximum);
    }
  }

  animate(val, correctedValue) {
    const fixedValue = correctedValue || this.getClampedAnimationValue(val);
    if (fixedValue !== undefined) {
      this.state.anim.setValue(fixedValue);
    }
  }

  finnishAnimation(finnishRetracted) {
    this.isResponding = false;
    this.state.anim.stopAnimation((value) => {
      Animated.timing(this.state.anim, {
        toValue: finnishRetracted
          ? ((-this.props.window.width))
          : 0,
        duration: 220,
        easing: Easing.inOut(Easing.ease)
      }).start();
    });
    this.setState({isRetracted: finnishRetracted});
  }

  resetAnimation() {
    if (this.startValue < (-this.props.window.width / 2)) {
      this.finnishAnimation(true);
    } else {
      this.finnishAnimation(false);
    }
  }

  onSelectedImagesChanged(selectedImages, image) {
    this.setState({currentImage: image});
    if (this.startValue > (-this.props.window.width / 2)) {
      this.finnishAnimation(false);
    }
  }

  onSwiperTouchEnd(e, state, context) {
    //No idea why I need to subract 10 here, please enlighten me!:
    const distance = ((this.lastX - e.nativeEvent.pageX) - 10);
    if (distance > (this.props.window.width / 2)) {
      //transision will happen
      this.revealTopBar(this.state.currentSwiperIndex === 0
        ? 1
        : 0);
      this.updateHeader(this.state.currentSwiperIndex === 1
        ? 'library'
        : 'photo');
    }
  }

  revealTopBar(currentSwiperIndex) {
    if (currentSwiperIndex === 1 && this.state.isRetracted) {
      this.setState({forceTopBarShow: true});
    }
    if (currentSwiperIndex === 0 && this.state.forceTopBarShow) {
      this.setState({forceTopBarShow: false});
    }
  }

  onSwiperOnMomentumScrollEnd(e, state, context) {
    this.setState({currentSwiperIndex: state.index});
    this.updateHeader(state.index === 0
      ? 'library'
      : 'photo')
    this.revealTopBar(state.index);
  }

  render() {
    const animationStyle = {
      transform: [
        {
          translateY: this.state.anim
        }
      ]
    };

    const cropperView = {
      height: this.props.window.width
    };
    const cameraRollPickerView = {
      marginTop: this.props.window.width,
      paddingBottom: FOOTER_HEIGHT + TOP_BAR_HEIGHT,
      height: 100
    };

    const mainAnimationContainer = {
      height: this.props.window.height + this.props.window.width
    };

    const forceTopBarAnim = {};
    if (this.state.forceTopBarShow) {
      forceTopBarAnim.transform = [
        {
          translateY: 0
        }
      ];
    }

    const mainAreaHeight = (this.props.window.height - TOP_BAR_HEIGHT - FOOTER_HEIGHT);

    const scrollViewStyle = {
      //  position : 'absolute',
    };

    return (
      <View style={styles.container}>
        <StatusBar hidden={true}></StatusBar>
        <Swiper
          scrollEnabled={this.state.swiperScrollEnabled}
          ref={swiper => this.swiper = swiper}
          onTouchStart={(e) => this.lastX = e.nativeEvent.pageX}
          onTouchEnd={this.onSwiperTouchEnd.bind(this)}
          onMomentumScrollEnd={this.onSwiperOnMomentumScrollEnd.bind(this)}
          showsPagination={false}
          loop={false}
          style={styles.swiper}
          showsButtons={false}>
          <Animated.View
            style={[animationStyle, styles.mainAnimationContainer, mainAnimationContainer]}>
            <CameraRollPicker
              setOuterScrollEnabled={(enabled) => this.setState({swiperScrollEnabled: enabled})}
              scrollViewStyle={scrollViewStyle}
              scrollToRowOnSelection={this.state.isRetracted}
              initalSelectedImageIndex={0}
              onSelectedImagesChanged={this.onSelectedImagesChanged.bind(this)}
              replaceSelection={true}
              top={this.state.isRetracted
              ? 50
              : (this.props.window.width + TOP_BAR_HEIGHT)}
              willStartAnimating={this.willStartAnimating.bind(this)}
              finnishAnimation={this.finnishAnimation.bind(this)}
              getAnimationValue={this.getClampedAnimationValue.bind(this)}
              animate={this.animate.bind(this)}
              resetAnimation={this.resetAnimation.bind(this)}
              style={cameraRollPickerView}
              maximum={1}
              window={this.props.window}
              imageMargin={2}
              imagesPerRow={4}></CameraRollPicker>
            <ImageCropperViewSwitch
              style={[styles.absolute, cropperView]}
              top={this.state.isRetracted
              ? 50
              : (this.props.window.width + TOP_BAR_HEIGHT)}
              willStartAnimating={this.willStartAnimating.bind(this)}
              finnishAnimation={this.finnishAnimation.bind(this)}
              getAnimationValue={this.getClampedAnimationValue.bind(this)}
              animate={this.animate.bind(this)}
              resetAnimation={this.resetAnimation.bind(this)}
              image={this.state.currentImage}
              magnification={2.0}
              window={this.props.window}></ImageCropperViewSwitch>
          </Animated.View>
          <PhotoCamera
            style={styles.photoCamera}
            pendingMedia={this.state.pendingMedia}
            onPhotoTaken={this.onPhotoTaken.bind(this)}
            window={this.props.window}></PhotoCamera>
        </Swiper>
        <Animated.View
          style={[animationStyle, styles.absolute, styles.headerContainer, forceTopBarAnim]}>
          <Header
            hasNextButton={this.state.headerHasNextButton}
            height={TOP_BAR_HEIGHT}
            headerTitle={this.state.headerTitle}
            onCancelAction={this.onCancelAction.bind(this)}></Header>
        </Animated.View>
        <Footer
          onPress={this.onFooterPress.bind(this)}
          style={styles.footer}
          selectedTab={this.state.currentSwiperIndex === 0
          ? 'library'
          : 'photo'}
          height={FOOTER_HEIGHT}></Footer>
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
    marginTop: TOP_BAR_HEIGHT,
    overflow: 'hidden'
  },
  swiper: {},
  blurBackground: {
    flex: 1
  },
  title: {
    marginTop: 15,
    fontFamily: fonts.serifLight,
    fontSize: 40,
    flex: 1
  },
  topcontainer: {
    flexDirection: 'row',
    marginLeft: 15,
    marginBottom: 20
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButton: {
    fontSize: 30,
    textAlign: 'center'
  },
  stepContainer: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 15
  },
  button: {
    backgroundColor: 'rgb(41, 130, 173)',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    borderRadius: 10
  },
  buttonText: {
    fontFamily: fonts.serifLight,
    fontSize: 18,
    color: 'white'
  },
  scrollViewContentContainer: {},
  scrollView: {
    flex: 1
  },
  headerContainer: {
    height: TOP_BAR_HEIGHT
  },
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
  photoCamera: {
    top: TOP_BAR_HEIGHT
  }
});
