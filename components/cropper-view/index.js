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
const ACTIVE_POINTER = 'auto';
const INACTIVE_POINTER = 'none';
import BlockView from 'react-native-scroll-block-view';
import {BlurView} from 'react-native-blur';
import {AnimatedCircularProgress} from '../../react-native-circular-progress';
export default class ImageCropperViewSwitch extends Component {

  constructor(props) {
    super(props);
    const images = [];
    if (props.image) {
      images.push({loaded: false, image: props.image});
    }
    this.state = {
      currentImageIndex: 0,
      images: images
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentImage = this.state.images[this.state.currentImageIndex];
    if (!currentImage || currentImage.image !== nextProps.image) {
      const nextPushIndex = this.getNextPushIndex();
      const cropperImageObj = this.state.images[nextPushIndex];
      if (cropperImageObj && cropperImageObj.image === nextProps.image) {
        this.onLoad(this.state.images[nextPushIndex], this.currentLoadingGuid);
      } else {
        this.state.images[nextPushIndex] = {
          loaded: false,
          image: nextProps.image
        };

        const currentLoadingGuid = this.guid();
        this.currentLoadingGuid = currentLoadingGuid;
        InteractionManager.runAfterInteractions(() => {
          if (this.currentLoadingGuid === currentLoadingGuid) {
            this.setState({isLoading: true});
            this.loadCircle.animateFill();
          }
        });

      }
      this.loadCircle.setAnimationValue(0);
      this.setState({currentImageIndex: nextPushIndex, isLoading : false});
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
    if (!imageObj.loaded) {
      this.state.images.forEach(i => i.loaded = false);
      imageObj.loaded = true;
      if (currentLoadingGuid === this.currentLoadingGuid) {
        this.currentLoadingGuid = null;
        this.setState({isLoading: false});
      }
      this.forceUpdate();
    }
  }

  renderCroppers(cropperProps) {
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

    const cropperViews = [];
    for (var j = 0; j < this.state.images.length; j++) {
      const imageObj = this.state.images[j];
      const isActive = this.state.currentImageIndex === j;
      cropperViews.push(<ImageCopperView
        key={j}
        {...commonProps}
        pointerEvents={isActive
        ? ACTIVE_POINTER
        : INACTIVE_POINTER}
        onLoad={this.onLoad.bind(this, imageObj, this.currentLoadingGuid)}
        style={[
        styles.imageCropperView, imageObj.loaded
          ? styles.activeCropperView
          : null
      ]}
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
    const absoluteStyle = {
      ...widthHeightStyle,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    return (
      <BlockView style={[styles.container, this.props.style]}>
        <ScrollView
          scrollsToTop={false}
          style={[absoluteStyle]}
          bounces={false}
          scrollEnabled={true}
          contentContainerStyle={absoluteStyle}>
          {this.renderCroppers()}
        </ScrollView>
        <Animated.View
          pointerEvents={INACTIVE_POINTER}
          style={[styles.drawerContainer, widthHeightStyle, drawerContainer]}/>
        <BlurView
          pointerEvents={INACTIVE_POINTER}
          style={[
          absoluteStyle,
          styles.blurView, {
            opacity: this.state.isLoading
              ? 1
              : 0
          }
        ]}
          blurType='dark'>
          <AnimatedCircularProgress
            ref={loadCircle => this.loadCircle = loadCircle}
            rotation={0}
            style={styles.animatedCircle}
            size={40}
            width={1}
            fill={100}
            tintColor='white'
            backgroundColor="rgba(170, 170, 170, 1)"/>
        </BlurView>
      </BlockView>
    );
  }
}

ImageCropperViewSwitch.defaultProps = {
  numberOfCroppers: 2
};

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
  drawerContainer: {
    backgroundColor: 'black',
    opacity: 0.6
  },
  blurView: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1
  }
});
