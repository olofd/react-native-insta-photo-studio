import {
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView
} from 'react-native';
import React, {Component} from 'react';
import ImageCopperView from './image-cropper-view';
//import {AnimatedCircularProgress} from 'react-native-circular-progress';
const ACTIVE_POINTER = 'auto';
const INACTIVE_POINTER = 'none';
export default class ImageCropperViewSwitch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageOne: props.image,
      imageTwo: null,
      currentImage: 0,
      imageOneLoaded: false,
      imageTwoLoaded: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.image !== this.getCurrentImage()) {
      const nextSlot = this.getNextSlot();
      if (this.state[nextSlot] === nextProps.image) {
        this.onLoad(nextSlot);
      } else {
        this.state[nextSlot] = nextProps.image;
      }
      this.updateCurrentImagePointer();
    }
  }

  updateCurrentImagePointer() {
    this.setState({
      currentImage: this.state.currentImage === 0
        ? 1
        : 0
    });
  }

  getNextSlot() {
    if (this.state.currentImage === 0) {
      return 'imageTwo';
    }
    return 'imageOne';
  }

  getCurrentImage() {
    if (this.state.currentImage === 0) {
      return this.state.imageOne;
    }
    return this.state.imageTwo;
  }

  getCurrentImageRef() {
    if (this.state.currentImage === 0) {
      return 'imageOne';
    }
    return 'imageTwo';
  }

  onLoad(imageRef) {
    this.setState({
      imageOneLoaded: imageRef === 'imageOne',
      imageTwoLoaded: imageRef === 'imageTwo'
    });
  }

  getOpacityFor(imageRef) {
    return this.getCurrentImageRef() === imageRef
      ? 1
      : 0;
  }

  render() {
    const {width, height} = this.props.window;
    const imageOneActive = (this.state.currentImage === 0);
    const commonProps = {
      top: this.props.top,
      magnification: this.props.magnification,
      window: this.props.window,
      willStartAnimating: this.props.willStartAnimating,
      finnishAnimation: this.props.finnishAnimation,
      getAnimationValue: this.props.getAnimationValue,
      animate: this.props.animate,
      resetAnimation: this.props.resetAnimation
    };
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
    return (

      <View style={[styles.container, this.props.style]}>
        <ScrollView
          style={{width, height : width, position : 'absolute'}}
          bounces={false}
          scrollEnabled={false}
          contentContainerStyle={{width, height : width}}>
          <ImageCopperView
            {...commonProps}
            pointerEvents={imageOneActive
            ? ACTIVE_POINTER
            : INACTIVE_POINTER}
            onLoad={this.onLoad.bind(this, 'imageOne')}
            style={[
            styles.imageCropperView, this.state.imageOneLoaded
              ? styles.activeCropperView
              : undefined
          ]}
            image={this.state.imageOne}></ImageCopperView>
          <ImageCopperView
            {...commonProps}
            pointerEvents={!imageOneActive
            ? ACTIVE_POINTER
            : INACTIVE_POINTER}
            onLoad={this.onLoad.bind(this, 'imageTwo')}
            style={[
            styles.imageCropperView, this.state.imageTwoLoaded
              ? styles.activeCropperView
              : undefined
          ]}
            image={this.state.imageTwo}></ImageCopperView>
        </ScrollView>
        <Animated.View
          pointerEvents='none'
          style={[
          {
            backgroundColor: 'black',
            width,
            height: width,
            opacity: 0.4
          },
          drawerContainer
        ]}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  animatedCircle: {
    backgroundColor: 'transparent'
  },
  imageCropperView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0
  },
  activeCropperView: {
    opacity: 1
  },
  scaledImage: {
    transform: [
      {
        scale: 100
      }
    ]
  }
});
