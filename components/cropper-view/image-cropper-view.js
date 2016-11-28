import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  PixelRatio,
  ImageEditor
} from 'react-native';
import OverlayGrid from '../overlay-grid';
import Icon from 'react-native-vector-icons/Ionicons';
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
      currentImageDimensions: null,
      currentFilter: null,
      currentImage: null,
      scrollEnabled: false
    };
    // No need to have this on state. we call functions to perform zoom, not
    // rerenering in react:
    this.viewPortZoomIsZoomedOut = false;
    this.setupScrollViewPanDelegator(props);
  }

  crop() {
    const offsetY = this.lastScrollEvent.contentOffset.y / this.lastScrollEvent.contentSize.height;
    const offsetX = this.lastScrollEvent.contentOffset.x / this.lastScrollEvent.contentSize.width;
    const {width, height} = this.state.currentImageDimensions;
    let newX = width * offsetX;
    let newY = height * offsetY;
    let newWidth = width / (this.lastScrollEvent.zoomScale * this.getMagnification());
    let newHeight = width / (this.lastScrollEvent.zoomScale * this.getMagnification());
    if (newWidth > width) {
      newWidth = width;
    }
    if (newHeight > height) {
      newHeight = height;
    }
    if (newX < 0) {
      newX = 0;
    }
    if (newY < 0) {
      newY = 0;
    }
    const cropData = {
      offset: {
        x: newX,
        y: newY
      },
      size: {
        width: newWidth,
        height: newHeight
      }
    };

    return new Promise((resolve, reject) => {
      ImageEditor.cropImage(this.state.currentImage, cropData, (croppedUri) => {
        resolve(croppedUri);
      }, (failure) => reject(failure));
    });
  }

  setupScrollViewPanDelegator(props) {
    this.scrollViewPanDelegator = new ScrollViewPanDelegator([new BoundarySwipeDelgator(swipeUpOrDownDetector, 100, props, {
        setScrollEnabled: (scrollEnabled) => {
          this.setState({scrollEnabled: scrollEnabled});
        }
      })]);
    this.scrollViewPanDelegatorBound = {
      onTouchMove: this.scrollViewPanDelegator.onTouchMove.bind(this.scrollViewPanDelegator),
      onTouchEnd: this.scrollViewPanDelegator.onTouchEnd.bind(this.scrollViewPanDelegator),
      onTouchStart: this.scrollViewPanDelegator.onTouchStart.bind(this.scrollViewPanDelegator),
      onScroll: this.scrollViewPanDelegator.onScroll.bind(this.scrollViewPanDelegator)
    };
  }

  getImageRatioInfo(imageDimensions) {
    const {width, height} = imageDimensions;
    let largerField = 'width';
    let smallerField = 'height';
    if (width < height) {
      largerField = 'height';
      smallerField = 'width';
    }
    const imageRatio = imageDimensions[largerField] / imageDimensions[smallerField];
    return {imageRatio, largerField, smallerField};
  }

  getMinimumZoomLevel() {
    //WINDOW WIDTH / LARGESTFIELD-INNER_VALUE (large-value)
    const {imageRatio} = this.state.currentImageInfo;
    const largerFieldValue = (this.props.window.width * this.getMagnification()) * imageRatio;
    return this.props.window.width / largerFieldValue;
  }

  getMagnification() {
    //We need to magnify for zoomToRect not to flip out in it's animations.
    //read: https://recalll.co/app/?q=ios%20-%20-%5BUIScrollView%20zoomToRect:animated:%5D%20weird%20behavior%20when%20contentSize%20%3C%20bounds.size
    if(this.props.magnification <= 1.0) {
      return 1.01;
    }
    const {largerField, smallerField, imageRatio} = this.state.currentImageInfo;
    const largerFieldValue = (this.props.window.width * this.props.magnification) * imageRatio;
    if (largerFieldValue <= this.props.window.width) {
      return 1.01;
    }
    return this.props.magnification;
  }

  getMainPreviewImageDiemensions() {
    const {largerField, smallerField, imageRatio} = this.state.currentImageInfo;
    const magnifiedWindow = (this.props.window.width * this.getMagnification());
    const largerFieldValue = magnifiedWindow * imageRatio;
    const smallerFieldValue = magnifiedWindow;
    const preview = {
      [smallerField]: smallerFieldValue,
      [largerField]: largerFieldValue
    };
    return preview;
  }

  getImageDimensions(image) {
    if (image) {
      if (typeof image !== 'string' && image.width && image.height) {
        let opportunisticImage = image;
        if(image.withOptions) {
          opportunisticImage = image.withOptions({
            deliveryMode : 'opportunistic'
          });
        }

        const currentImageDimensions = {
          width: image.width,
          height: image.height
        };
        this.setState({currentImage: opportunisticImage.uri, currentImageDimensions, currentImageInfo: this.getImageRatioInfo(currentImageDimensions)});
      } else {
        if (typeof image === 'string') {
          this.getSize(image);
        }else {

          this.getSize(image.uri);
        }
      }
    }
  }

  getSize(uri) {
    Image.getSize(uri, (width, height) => {
      const currentImageDimensions = {
        width,
        height
      };
      this.setState({currentImage: uri, currentImageDimensions: currentImageDimensions, currentImageInfo: this.getImageRatioInfo(currentImageDimensions)});
    });
  }

  componentWillMount() {
    this.getImageDimensions(this.props.image);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.image !== this.props.image) {
      this.zommToImageHasBeenRun = false;
      this.viewPortZoomIsZoomedOut = false;
      this.setState({imageReady: false});
      //We must reset zoom if there is a new image.
      this.zoomToRect(0, 0, this.props.window.width, this.props.window.width);
      this.getImageDimensions(nextProps.image);
    }
  }

  initalZoomToImage(cb) {
    if(!this.zommToImageHasBeenRun) {
      return this.zoomToImage(cb);
    }
    cb && cb();
  }

  zoomToImage(cb, animated) {
    if (this.state.currentImageDimensions) {
      this.zommToImageHasBeenRun = true;
      const {width, height} = this.getMainPreviewImageDiemensions();
      const fixedSize = height > width
        ? width
        : height;
      let x = 0,
        y = 0;
      if (width > height) {
        x = ((width - (this.props.window.width * this.getMagnification())) / 2);
      } else {
        y = ((height - (this.props.window.width * this.getMagnification())) / 2)
      }
      this.zoomToRect(x, y, fixedSize, fixedSize, animated === true);
      this.setState({imageReady: true});
      cb && cb();
    }
  }

  zoomToRect(x, y, width, height, animated = false) {
    this.scrollView && this.scrollView.scrollResponderZoomTo({x, y, width, height, animated});
  }

  toogleViewportZoom() {
    if (!this.viewPortZoomIsZoomedOut) {
      const {width, height} = this.getMainPreviewImageDiemensions();
      this.zoomToRect(0, 0, width, height, true);
    } else {
      this.zoomToImage(undefined, true);
    }
    this.viewPortZoomIsZoomedOut = !this.viewPortZoomIsZoomedOut;
  }

  applyFilter(filter) {
    this.setState({currentFilter: filter});
  }

  renderFilterPreview(item, index) {
    if (!this.state.currentImageDimensions) {
      return null;
    }
    return (
      <FilterPreviewItem
        applyFilter={this.applyFilter.bind(this)}
        width={85}
        height={85}
        imageSize={this.state.currentImageDimensions}
        image={this.state.currentImage}
        style={index !== 0
        ? styles.firstPreviewItem
        : null}
        filter={item}
        key={index}></FilterPreviewItem>
    );
  }

  renderPlainImage(currentImageDimensions, previewImageDimensions) {
    return (
      <Image
        onError={this.props.onError}
        onProgress={this.props.onProgress}
        onPartialLoad={this.initalZoomToImage.bind(this, this.props.onPartialLoad)}
        onLoadEnd={this.initalZoomToImage.bind(this, this.props.onLoad)}
        source={{
        uri: this.state.currentImage,
        width: previewImageDimensions.width,
        height: previewImageDimensions.height
      }}></Image>
    )
  }

  renderMainImage(currentImageDimensions, previewImageDimensions) {
    if (!this.state.currentImage) {
      return null;
    }
    return this.renderPlainImage(currentImageDimensions, previewImageDimensions);
  }

  onScroll(e) {
    this.lastScrollEvent = e.nativeEvent;
    this.scrollViewPanDelegatorBound.onScroll(e);
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
        const {pointX, pointY} = this.lastPress;
        const {pageX, pageY} = e.nativeEvent;
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
    if (!this.state.currentImageDimensions) {
      return null;
    }
    const previewImageDimensions = this.getMainPreviewImageDiemensions();
    const {width, height} = previewImageDimensions;
    const scrollViewStyle = {
      height: this.props.window.width,
      width: this.props.window.width,
      opacity: this.state.imageReady
        ? 1
        : 0
    };
    const contentContainerStyle = {
      height: height + 1,
      width: width + 1
    };
    //maximumZoomScale
    const minimumZoomScale = this.getMinimumZoomLevel();
    const maximumZoomScale = minimumZoomScale * 4;
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
        minimumZoomScale={minimumZoomScale}
        maximumZoomScale={maximumZoomScale < 1 ? 1 : maximumZoomScale}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={scrollViewStyle}
        contentContainerStyle={contentContainerStyle}
        alwaysBounceVertical={true}
        alwaysBounceHorizontal={true}
        scrollEnabled={this.state.scrollEnabled}>
        {this.renderMainImage(this.state.currentImageDimensions, previewImageDimensions)}
      </ScrollView>
    );
  }

  renderToolBar() {
    if (!this.state.currentImageDimensions) {
      return null;
    }
    const {width, height} = this.state.currentImageDimensions;
    if (width === height) {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={this.toogleViewportZoom.bind(this)}
        style={[styles.zoomButtonContainer]}>
        {/*We need a inner view to rotate. If we rotate the container, the border will look jagged*/}
        <View style={styles.zoomButtonRotationView}>
          <Icon style={styles.zoomButtonText} name='ios-arrow-up'></Icon>
          <Icon style={styles.zoomButtonText} name='ios-arrow-down'></Icon>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View
        style={[styles.container, this.props.style]}
        pointerEvents={this.props.pointerEvents}>
        {this.renderMainImageScrollView()}
        <OverlayGrid ref={OverlayGrid => this.OverlayGrid = OverlayGrid}></OverlayGrid>
        {this.renderToolBar()}
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
  zoomButtonContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    backgroundColor: 'rgba(21, 21, 21, 0.6)',
    borderRadius: 15,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1 / PixelRatio.get(),
    transform: [
      {
        rotate: '0deg'
      }
    ]
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 13
  },
  zoomButtonRotationView: {
    transform: [
      {
        rotate: '45deg'
      }
    ]
  }
});
