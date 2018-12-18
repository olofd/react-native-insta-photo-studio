import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  PixelRatio
} from 'react-native';
import Video from 'react-native-video';
import OverlayGrid from '../overlay-grid';
import fbjsPerformanceNow from 'fbjs/lib/performanceNow';
import {
  ScrollViewPanDelegator,
  BoundarySwipeDelgator,
  ContentOffsetDelegator,
  swipeUpOrDownDetector
} from '../../pan-delegator/scroll-view-pan-delegator';
const performanceNow = global.nativePerformanceNow || fbjsPerformanceNow;

export default class ImageCropperView extends Component {
  constructor(props) {
    super(props);
    this.lastPress = 0;
    this.zommToImageHasBeenRun = false;
    this.state = {
      imageReady: false,
      scrollEnabled: false
    };
    // No need to have this on state. we call functions to perform zoom, not
    // rerenering in react:
    this.viewPortZoomIsZoomedOut = false;
    this.setupScrollViewPanDelegator(props);
    this.listeners = [];
  }

  setupScrollViewPanDelegator(props) {
    this.scrollViewPanDelegator = new ScrollViewPanDelegator([new BoundarySwipeDelgator(swipeUpOrDownDetector, 100, props, {
      setScrollEnabled: (scrollEnabled) => {
        this.setState({ scrollEnabled: scrollEnabled });
      }
    })]);
    this.scrollViewPanDelegatorBound = {
      onTouchMove: this.scrollViewPanDelegator.onTouchMove.bind(this.scrollViewPanDelegator),
      onTouchEnd: this.scrollViewPanDelegator.onTouchEnd.bind(this.scrollViewPanDelegator),
      onTouchStart: this.scrollViewPanDelegator.onTouchStart.bind(this.scrollViewPanDelegator),
      onScroll: this.scrollViewPanDelegator.onScroll.bind(this.scrollViewPanDelegator)
    };
  }

  componentWillMount() {
    if (this.props.image) {
      this.loadImage(this.props.image);
    }
  }

  componentWillUnmount() {
    this.unregisterFromImage(); 
  }

  unregisterFromImage() {
    this.listeners.forEach(cb => cb());
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.image !== this.props.image) {
      this.unregisterFromImage();
      this.zoomRectStartupValue = undefined;
      this.userHasMovedImage = false;
      this.zommToImageHasBeenRun = false;
      this.viewPortZoomIsZoomedOut = false;
      this.setState({ imageReady: false });
      //We must reset zoom if there is a new image.
      this.zoomToRect(0, 0, this.props.window.width, this.props.window.width);
      this.loadImage(nextProps.image);
    }
  }

  onScroll(e) {
    this.scrollViewPanDelegatorBound.onScroll(e);
    if (this.props.image) {
      this.props.image.updateLastScrollEvent(e.nativeEvent);
    }

    if (this.zommToImageHasBeenRun) {
      const zoomRectValue = e.nativeEvent.contentOffset.y + e.nativeEvent.contentOffset.x + e.nativeEvent.zoomScale;
      if (this.zoomRectStartupValue === undefined || zoomRectValue === this.zoomRectStartupValue) {
        //Arrived at original react.
        this.zoomRectStartupValue = zoomRectValue;
        this.atOriginalZoomReact = true;
      }
      else if (zoomRectValue !== this.zoomRectStartupValue) {
        this.atOriginalZoomReact = false;
      }
    }
  }

  loadImage(image) {
    if (image) {
      this.listeners.push(image.onRequestImageInfo((imageInfo) => {
        this.setState({
          imageInfo: imageInfo
        });
      }));

      this.listeners.push(image.onToogleViewportZoom(() => {
        this.toogleViewportZoom();
      }));
    }
  }

  initalZoomToImage(cb) {
    if (!this.zommToImageHasBeenRun) {
      return this.zoomToImage(cb, false, true);
    }
    cb && cb();
  }

  zoomToImage(cb, animated, startup) {
    this.zommToImageHasBeenRun = true;
    const { originalZoomRect, startupZoomRect } = this.state.imageInfo.zoomRect;
    const zoomRect = startup ? startupZoomRect : originalZoomRect;
    setTimeout(() => {
      this.zoomToRect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height, animated === true);
      cb && cb();
      this.setState({ imageReady: true });
    }, 0);
    this.atOriginalZoomReact = true;
  }

  zoomToRect(x, y, width, height, animated = false) {
    this.scrollView && this.scrollView.scrollResponderZoomTo({ x, y, width, height, animated });
  }

  toogleViewportZoom() {
    if (this.atOriginalZoomReact) {
      const { previewSurface } = this.state.imageInfo;
      this.zoomToRect(0, 0, previewSurface.width, previewSurface.height, true);
    } else {
      this.zoomToImage(undefined, true);
    }
  }

  renderMainVideo(imageInfo) {
    return (<Video source={imageInfo.image.video} // Looks for .mp4 file (background.mp4) in the given expansion version.
      rate={1.0}                   // 0 is paused, 1 is normal.
      volume={1.0}                 // 0 is muted, 1 is normal.
      muted={false}                // Mutes the audio entirely.
      paused={!this.props.isActive}               // Pauses playback entirely.
      resizeMode="contain"           // Fill the whole screen at aspect ratio.
      repeat={true}                // Repeat forever.
      onLoadStart={this.initalZoomToImage.bind(this, this.props.onPartialLoad)} // Callback when video starts to load
      onLoad={this.initalZoomToImage.bind(this, this.props.onLoad)}    // Callback when video loads
      onError={this.props.onError}    // Callback when video cannot be loaded
      style={styles.backgroundVideo} />)
  }

  renderMainImage(imageInfo) {
    const { previewSurface } = imageInfo;
    return (
      <Image
        onError={this.props.onError}
        onProgress={this.props.onProgress}
        onPartialLoad={this.initalZoomToImage.bind(this, this.props.onPartialLoad)}
        onLoadEnd={this.initalZoomToImage.bind(this, this.props.onLoad)}
        source={{
          uri: imageInfo.image.uri,
          width: previewSurface.width,
          height: previewSurface.height
        }}></Image>
    )
  }

  onTouchStart(e) {
    this.scrollViewPanDelegatorBound.onTouchStart(e);
    clearTimeout(this.showGridTimer);
    this.showGridTimer = setTimeout(() => {
      this.OverlayGrid.show();
    }, 130);
    const now = performanceNow();
    if (this.lastPress) {
      var delta = now - this.lastPress.time;
      //Below 80ms will probobly be user trying to zoom
      if (delta > 80 && delta < 400) {
        const { pointX, pointY } = this.lastPress;
        const { pageX, pageY } = e.nativeEvent;
        const totalDiff = (pointX - pageX) + (pointY - pageY);
        if (totalDiff > -20 && totalDiff < 20) {
          // double tap happend
          this.toogleViewportZoom();
        }
      }
    }
    this.lastPress = {
      time: now,
      pointY: e.nativeEvent.pageY,
      pointX: e.nativeEvent.pageX
    };
  }

  onTouchMove(e) {
    this.scrollViewPanDelegatorBound.onTouchMove(e);
    clearTimeout(this.showGridTimer);
    this.OverlayGrid.show();
  }

  onTouchEnd(e) {
    this.scrollViewPanDelegatorBound.onTouchEnd(e);
    this.OverlayGrid.hide();
    clearTimeout(this.showGridTimer);
  }

  renderMainImageScrollView() {
    if (!this.state.imageInfo) {
      console.log('ACTIVE');
      return null;
    }
    const { previewSurface, window, minimumZoomLevel, maximumZoomLevel } = this.state.imageInfo;

    const { width, height } = this.state.imageInfo.previewSurface;
    const scrollViewStyle = {
      height: window.width,
      width: window.width,
      /*display: this.state.imageReady
        ? 1
        : 0*/
    };
    const contentContainerStyle = {
      height: height + 1,
      width: width + 1
    };
    return (
      <ScrollView
        scrollsToTop={false}
        onTouchMove={this.onTouchMove.bind(this)}
        onTouchEnd={this.onTouchEnd.bind(this)}
        onTouchStart={this.onTouchStart.bind(this)}
        onScroll={this.onScroll.bind(this)}
        bounces={true}
        centerContent={true}
        scrollEventThrottle={50}
        ref={scrollView => this.scrollView = scrollView}
        minimumZoomScale={minimumZoomLevel}
        maximumZoomScale={maximumZoomLevel}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={scrollViewStyle}
        contentContainerStyle={contentContainerStyle}
        alwaysBounceVertical={true}
        alwaysBounceHorizontal={true}
        scrollEnabled={this.state.scrollEnabled}>
        {this.state.imageInfo.image.mediaType === 'video' ? this.renderMainVideo(this.state.imageInfo) : this.renderMainImage(this.state.imageInfo)}
      </ScrollView>
    );
  }


  render() {
    return (
      <View
        style={[styles.container, this.props.style]}
        pointerEvents={this.props.pointerEvents}>
        {this.renderMainImageScrollView()}
        <OverlayGrid ref={OverlayGrid => this.OverlayGrid = OverlayGrid}></OverlayGrid>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  filterPreviewsContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 45
  },
  filterPreviewScrolView: {
    overflow: 'hidden'
  },
  firstPreviewItem: {
    marginLeft: 5
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }
});
