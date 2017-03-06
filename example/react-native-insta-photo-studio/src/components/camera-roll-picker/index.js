import React, { Component } from 'react'
import {
  ActivityIndicator,
  CameraRoll,
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ListView,
  InteractionManager,
  ScrollView,
  PanResponder,
  TouchableWithoutFeedback
} from 'react-native';
import WindowedListView from 'react-native/Libraries/Experimental/WindowedListView';
import debounce from 'debounce';
import { ScrollViewPanDelegator, BoundarySwipeDelgator, ContentOffsetDelegator, swipeUpDetector, swipeDownDetector } from '../../pan-delegator/scroll-view-pan-delegator';
import cameraRollService from '../../services/camera-roll-service';
class CameraRollPicker extends Component {
  constructor(props) {
    super(props);
    this.newAlbumAssetService = false;
    this.state = {
      noMore: false,
      shouldUpdate: this.guid(),
      bounces: true,
      selectedImages: []
    };
    this._onEndReachedDebounce = debounce(this._onEndReached, 200).bind(this);
    this.setupScrollViewPanDelegator(props);
    this.lastContentOffset = {
      y: 0,
      x: 0
    };
    this.startIndex = 0;
    this.albumAssetServiceListeners = [];
  }

  setupScrollViewPanDelegator(props) {
    this.scrollViewPanDelegator = new ScrollViewPanDelegator([
      new BoundarySwipeDelgator(swipeUpDetector, props.top, this.props),
      new ContentOffsetDelegator(swipeDownDetector, this.props, {
        setBounce: (bounces) => {
          this.setState({ bounces: bounces });
        }
      })
    ]);
    this.scrollViewPanDelegatorBound = {
      onTouchMove: this.scrollViewPanDelegator.onTouchMove.bind(this.scrollViewPanDelegator),
      onTouchEnd: this.scrollViewPanDelegator.onTouchEnd.bind(this.scrollViewPanDelegator),
      onTouchStart: this.scrollViewPanDelegator.onTouchStart.bind(this.scrollViewPanDelegator),
      onScroll: this.scrollViewPanDelegator.onScroll.bind(this.scrollViewPanDelegator)
    };
  }

  componentWillMount() {
    let { width } = Dimensions.get('window');
    let { imageMargin, imagesPerRow, containerWidth } = this.props;

    if (typeof containerWidth != "undefined") {
      width = containerWidth;
    }
    this._imageSize = (width / imagesPerRow) - ((imageMargin * (imagesPerRow - 1)) / imagesPerRow);
    this.setState({
      cellStyles: StyleSheet.create({
        imageSize: {
          height: this._imageSize,
          width: this._imageSize
        },
        cellMargin: {
          paddingTop: imageMargin,
          paddingRight: imageMargin
        }
      })
    });

    this.cameraRollServiceListener = cameraRollService.onAlbumAssetServiceChanged((albumAssetService) => {
      this.scrollToRow(0, undefined, false);
      this.newAlbumAssetService = true;
      this.unregisterFromAlbumAssetService();
      this.albumAssetService = albumAssetService;
      this.albumAssetServiceListeners.push(this.albumAssetService.onNewAssetsRecived((columnsSplittedData, newData) => {
        this.setState({
          dataSource: columnsSplittedData,
          shouldUpdate: this.guid()
        });
        if (this.newAlbumAssetService && newData.length) {
          this.newAlbumAssetService = false;
          this.setInitalSelection(newData);
        }
      }));

      this.albumAssetServiceListeners.push(this.albumAssetService.onSelectionChanged((selectedImages, rowIndexToScrollTo, columnsSplittedData) => {
        this.setState({
          selectedImages: selectedImages,
          dataSource: columnsSplittedData,
          shouldUpdate: this.guid()
        });
        if (rowIndexToScrollTo !== -1) {
          console.log(rowIndexToScrollTo);
          this.onScrollAdjustmentOnSelect(rowIndexToScrollTo);
        }
      }));
    }, true);
  }

  setInitalSelection(assets) {
    if (this.props.initalSelectedImageIndex !== undefined) {
      const image = assets[this.props.initalSelectedImageIndex];
      if (image) {
        cameraRollService.selectionRequested(this.albumAssetService, image);
      }
    }
  }
  
  componentWillUnMount() {
    if (this.cameraRollServiceListener) {
      this.cameraRollServiceListener();
    }
    this.unregisterFromAlbumAssetService();
  }

  unregisterFromAlbumAssetService() {
    if (this.albumAssetServiceListeners) {
      this.albumAssetServiceListeners.forEach(listener => listener());
      this.albumAssetServiceListeners = [];
    }
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  renderScrollView(props) {
    return (
      <ScrollView
        scrollsToTop={true}
        bounces={this.state.bounces}
        onTouchMove={this.scrollViewPanDelegatorBound.onTouchMove}
        onTouchEnd={this.scrollViewPanDelegatorBound.onTouchEnd}
        onTouchStart={this.scrollViewPanDelegatorBound.onTouchStart}
        {...props}
        style={this.props.scrollViewStyle}
        scrollEventThrottle={16}
        decelerationRate='normal'></ScrollView>
    );
  }

  renderFooter() {
    return (
      <ActivityIndicator style={styles.activityIndicator}></ActivityIndicator>
    )
  }

  renderListView() {
    if (!this.state.dataSource) {
      return <ActivityIndicator style={styles.spinner} />;
    }
    return (
      <WindowedListView
        renderWindowBoundaryIndicator={this.renderFooter.bind(this)}
        ref={wlv => this.wlv = wlv}
        onScroll={this.onScroll.bind(this)}
        disableIncrementalRendering={true}
        renderScrollComponent={this.renderScrollView.bind(this)}
        initialNumToRender={30}
        numToRenderAhead={40}
        maxNumToRender={500}
        shouldUpdateToken={this.state.shouldUpdate}
        onViewableRowsChanged={(e) => {
          if (e[e.length - 1] >= (this.state.dataSource.length - 60)) {
            this._onEndReachedDebounce();
          }
        }}
        data={this.state.dataSource}
        renderRow={this._renderRow.bind(this)}></WindowedListView>
    );
  }

  render() {
    const { imageMargin, backgroundColor } = this.props;
    return (
      <View
        style={[
          styles.wrapper, {
            padding: imageMargin,
            paddingRight: 0,
            width: this.props.window.width
          },
          this.props.style
        ]}>
        {this.renderListView()}
      </View>
    );
  }

  _renderImage(item, rowIndex, rowColumn, rowData) {
    let isSelected = false;
    for (let i = 0; i < this.state.selectedImages.length; i++) {
      if (item.uri.indexOf(this.state.selectedImages[i].uri) !== -1) {
        isSelected = true;
        break;
      }
    }
    let cellStyles = this.state.cellStyles;
    let lastItemInRow = (rowColumn % this.props.imagesPerRow) === this.props.imagesPerRow - 1;
    return (
      <TouchableOpacity
        activeOpacity={1.0}
        key={item.uri}
        style={[cellStyles.cellMargin, {
          paddingRight: lastItemInRow ? 0 : this.props.imageMargin
        }]}
        onPress={() => this._selectImage(item, rowIndex, rowData)}>
        <Image source={item.image} style={cellStyles.imageSize}>
          {isSelected
            ? <View style={[cellStyles.imageSize, styles.selectedImage]}></View>
            : null}
        </Image>
      </TouchableOpacity>
    );
  }

  _renderRow(rowData, unknown, rowIndex) {
    console.log('Render Row');
    if (rowData === undefined) {
      return null;
    }
    var items = rowData.filter(x => !!x).map((item, rowColumn) => this._renderImage(item, rowIndex, rowColumn, rowData));
    return (
      <View style={styles.row}>
        {items}
      </View>
    );
  }

  _onEndReached() {
    if (this.albumAssetService) {
      this.albumAssetService.requestAssets();
    }
  }

  _selectImage(image, rowIndex, rowData) {
    cameraRollService.selectionRequested(this.albumAssetService, image);
  }

  onScrollAdjustmentOnSelect(rowIndex) {
    const imageWidthMarginSize = this.getImageWithMarginHeight();
    const rowScrollPosition = this.getRowIndexScrollTop(rowIndex, imageWidthMarginSize);
    if (this.props.scrollToRowOnSelection) {
      this.scrollToRow(rowIndex, rowScrollPosition);
    } else {
      if (rowScrollPosition < this.lastContentOffset.y) {
        this.scrollToRow(rowIndex, rowScrollPosition);
      }
      if ((rowScrollPosition + imageWidthMarginSize) > (this.props.scrollViewStyle.height + this.lastContentOffset.y)) {
        this.scrollToRow(rowIndex, rowScrollPosition - this.props.scrollViewStyle.height + imageWidthMarginSize);
      }
    }
  }

  onScroll(e) {
    this.lastContentOffset = e.nativeEvent.contentOffset;
    this.scrollViewPanDelegatorBound.onScroll(e);
  }

  getImageWithMarginHeight() {
    const { imageMargin } = this.props;
    return ((this._imageSize) + imageMargin);
  }

  getRowIndexScrollTop(rowIndex, imageWidthMarginSize) {
    return ((imageWidthMarginSize !== undefined
      ? imageWidthMarginSize
      : this.getImageWithMarginHeight()) * rowIndex);
  }

  scrollToRow(rowIndex, predefinedYValye, animated = true) {
    const scrollResponder = this.wlv && this.wlv.getScrollResponder();
    if (scrollResponder) {
      scrollResponder.scrollTo({
        x: 0,
        y: predefinedYValye !== undefined
          ? predefinedYValye
          : this.getRowIndexScrollTop(rowIndex),
        animated: animated
      });
    }
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    flex: 1
  },
  marker: {
    position: 'absolute',
    top: 5,
    backgroundColor: 'transparent',
    width: 25,
    height: 25,
    right: 10
  },
  spinner: {
    marginTop: 20
  },
  selectedImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
  },
  activityIndicator: {
    marginTop: 20
  }
})

CameraRollPicker.propTypes = {
  maximum: React.PropTypes.number,
  imagesPerRow: React.PropTypes.number,
  imageMargin: React.PropTypes.number,
  containerWidth: React.PropTypes.number,
  onSelectedImagesChanged: React.PropTypes.func,
  selected: React.PropTypes.array,
  selectedMarker: React.PropTypes.element,
  backgroundColor: React.PropTypes.string
}

CameraRollPicker.defaultProps = {
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 5,
  backgroundColor: 'white',
  selected: []
}

export default CameraRollPicker;
