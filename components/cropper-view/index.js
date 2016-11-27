import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
  InteractionManager
} from 'react-native';
import React, {Component} from 'react';
import ImageCopperView from './image-cropper-view';
import BlockView from 'react-native-scroll-block-view';
import {BlurView} from 'react-native-blur';
import {AnimatedCircularProgress} from '../../react-native-circular-progress';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const loadingViewScale = {
  inputRange: [
    0, 1
  ],
  outputRange: [1.15, 1]
};

const ACTIVE_POINTER = 'auto';
const INACTIVE_POINTER = 'none';

export default class CropperViewContainer extends Component {

  constructor(props) {
    super(props);
    const images = [];
    if (props.image) {
      images.push({loaded: false, image: props.image});
    }
    this.state = {
      currentImageIndex: 0,
      images: images,
      loadingViewAnim: new Animated.Value(0)
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentImage = this.state.images[this.state.currentImageIndex];
    if (!currentImage || currentImage.image !== nextProps.image) {
      const nextPushIndex = this.getNextPushIndex();
      const cropperImageObj = this.state.images[nextPushIndex];
      if (cropperImageObj && (cropperImageObj.image === nextProps.image || cropperImageObj.image.uri === nextProps.image.uri)) {
        this.onPartialLoad(this.state.images[nextPushIndex], this.currentLoadingGuid);
        this.onLoad(this.state.images[nextPushIndex], this.currentLoadingGuid);
      } else {
        this.state.images[nextPushIndex] = {
          loaded: false,
          image: nextProps.image
        };
        this.startLoadingTimer(this.state.images.length === 1);
      }
      this.loadCircle && this.loadCircle.setAnimationValue(0);
      this.setState({currentImageIndex: nextPushIndex, isLoading: false});
    }
  }

  startLoadingTimer(firstImage) {
    const currentLoadingGuid = this.guid();
    this.currentLoadingGuid = currentLoadingGuid;
    setTimeout(() => {
      if (this.currentLoadingGuid === currentLoadingGuid) {
        this.animateLoadingView(1, undefined, false);
      }
    }, 350);
  }

  animateLoadingView(toValue, cb, instant) {
    if (instant) {
      this.state.loadingViewAnim.setValue(toValue);
    } else {
      Animated.spring(this.state.loadingViewAnim, {
        toValue: toValue,
        tension: 10,
        friction: 7
      }).start(cb);
    }
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  getNextPushIndex() {
    if (this.state.currentImageIndex < this.props.numberOfCroppers - 1) {
      if (this.state.images.length < this.props.numberOfCroppers) {
        return this.state.images.length;
      }
      return this.state.currentImageIndex + 1;
    }
    return 0;
  }

  getCurrentImage() {
    return this.state.images[this.state.currentImageIndex];
  }

  onLoad(imageObj, currentLoadingGuid) {
    if (currentLoadingGuid === this.currentLoadingGuid) {
      this.currentLoadingGuid = null;
      this.loadCircle && this.loadCircle.animateFill(100, undefined, false);
      setTimeout(() => {
        this.animateLoadingView(0, undefined, true);
      }, 100);
    }
  }

  onPartialLoad(imageObj) {
    if (!imageObj.loaded) {
      this.state.images.forEach(i => i.loaded = false);
      imageObj.loaded = true;
      this.forceUpdate();
    }
  }

  onProgress(e) {
    const p = Math.round((e.nativeEvent.loaded / e.nativeEvent.total) * 100);
    this.loadCircle && this.loadCircle.animateFill(p, undefined, false);
  }

  renderCroppers(cropperProps) {
    const cropperViews = [];
    for (var j = 0; j < this.state.images.length; j++) {
      const imageObj = this.state.images[j];
      const isActive = this.state.currentImageIndex === j;
      const style = [
        styles.imageCropperView, styles.absoluteStyle, imageObj.loaded
          ? styles.activeCropperView
          : null
      ];
      cropperViews.push(<ImageCopperView
        key={j}
        magnification={this.props.magnification}
        window={this.props.window}
        willStartAnimating={this.props.willStartAnimating}
        finnishAnimation={this.props.finnishAnimation}
        getAnimationValue={this.props.getAnimationValue}
        animate={this.props.animate}
        resetAnimation={this.props.resetAnimation}
        pointerEvents={isActive
        ? ACTIVE_POINTER
        : INACTIVE_POINTER}
        onProgress={this.onProgress.bind(this)}
        onLoad={this.onLoad.bind(this, imageObj, this.currentLoadingGuid)}
        onPartialLoad={this.onPartialLoad.bind(this, imageObj, this.currentLoadingGuid)}
        style={style}
        image={imageObj.image}/>);
    }
    return cropperViews;
  }

  render() {
    const {width, height} = this.props.window;
    const drawerContainer = {
      opacity: this.props.anim.interpolate({
        inputRange: [
          0, width
        ],
        outputRange: [
          0, -0.35
        ],
        extrapolate: 'extend'
      })
    };
    const widthHeightStyle = {
      width,
      height: width
    };
    return (
      <BlockView style={[styles.container, this.props.style]}>
        <ScrollView
          style={widthHeightStyle}
          scrollsToTop={false}
          bounces={false}
          contentContainerStyle={widthHeightStyle}
          scrollEnabled={true}>
          {this.renderCroppers()}
        </ScrollView>
        <Animated.View
          pointerEvents={INACTIVE_POINTER}
          style={[styles.drawerContainer, styles.absoluteStyle, drawerContainer]}></Animated.View>
        {this.renderLoadingView(widthHeightStyle)}
      </BlockView>
    );
  }

  renderLoadingView(widthHeightStyle) {
    return (
      <Animated.View
        pointerEvents={INACTIVE_POINTER}
        style={[
        styles.absoluteStyle,
        styles.blurView, {
          backgroundColor: 'black',
          opacity: this.state.loadingViewAnim.interpolate({
            inputRange: [
              0, 1
            ],
            outputRange: [0, 0.65]
          }),
          transform: [
            {
              scale: this.state.loadingViewAnim.interpolate(loadingViewScale)
            }
          ]
        }
      ]}
        blurType='dark'>
        <AnimatedCircularProgress
          ref={loadCircle => this.loadCircle = loadCircle}
          rotation={0}
          style={styles.animatedCircle}
          size={50}
          width={1.5}
          fill={5}
          tintColor='white'
          backgroundColor="rgba(170, 170, 170, 1)"/>
      </Animated.View>
    );
  }
}

CropperViewContainer.defaultProps = {
  numberOfCroppers: 2
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  animatedCircle: {
    backgroundColor: 'transparent'
  },
  absoluteStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  imageCropperView: {
    opacity: 0
  },
  activeCropperView: {
    opacity: 1
  },
  drawerContainer: {
    backgroundColor: 'black',
    opacity: 0.6
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
