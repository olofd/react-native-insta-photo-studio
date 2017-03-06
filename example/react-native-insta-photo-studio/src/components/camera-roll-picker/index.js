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
  TouchableWithoutFeedback,
  PixelRatio
} from 'react-native';
import WindowedListView from 'react-native/Libraries/Experimental/WindowedListView';
import debounce from 'debounce';
import { ScrollViewPanDelegator, BoundarySwipeDelgator, ContentOffsetDelegator, swipeUpDetector, swipeDownDetector } from '../../pan-delegator/scroll-view-pan-delegator';
import cameraRollService from '../../services/camera-roll-service';
class CameraRollPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noMore: false,
      shouldUpdate: this.guid(),
      bounces: true,
      selectedImage: null,
      markedForExport: [],
      multiExportModeEnabled: true
    };
    this._onEndReachedDebounce = debounce(this._onEndReached, 200).bind(this);
    this.setupScrollViewPanDelegator(props);
    this.lastContentOffset = {
      y: 0,
      x: 0
    };
    this.startIndex = 0;
    this.albumAssetServiceListeners = [];
    this.cameraRollServiceListeners = [];
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

    this.cameraRollServiceListeners.push(cameraRollService.onToogleMultiExportMode((multiExportModeEnabled) => {
      this.markAllRowsForRerender();
      this.setState({
        multiExportModeEnabled: multiExportModeEnabled,
        shouldUpdate: this.guid()
      });
    }, true));
    this.cameraRollServiceListeners.push(cameraRollService.onAlbumAssetServiceChanged((albumAssetService) => {
      this.scrollToRow(0, undefined, false);
      this.unregisterFromAlbumAssetService();
      this.albumAssetService = albumAssetService;
      this.albumAssetServiceListeners.push(this.albumAssetService.onNewAssetsRecived((columnsSplittedData, newData) => {
        this.setState({
          dataSource: columnsSplittedData,
          shouldUpdate: this.guid()
        });
      }));

      this.albumAssetServiceListeners.push(this.albumAssetService.onSelectionChanged((selectedImage, rowIndexToScrollTo, columnsSplittedData) => {
        this.setState({
          selectedImage: selectedImage,
          dataSource: columnsSplittedData,
          shouldUpdate: this.guid()
        });
        if (rowIndexToScrollTo !== -1) {
          this.onScrollAdjustmentOnSelect(rowIndexToScrollTo);
        }
      }));

      this.albumAssetServiceListeners.push(this.albumAssetService.onMarkedForExportMediaChanged((markedForExport, columnsSplittedData) => {
        this.setState({
          markedForExport: markedForExport,
          columnsSplittedData: columnsSplittedData,
          shouldUpdate: this.guid()
        });
      }));

    }, true));
  }

  markAllRowsForRerender() {
    const { dataSource } = this.state;
    if (!dataSource)
      return;
    for (var i = 0; i < dataSource.length; i++) {
      const row = dataSource[i];
      dataSource[i].rowData = [...dataSource[i].rowData];
    }
  }

  componentWillUnMount() {
    this.cameraRollServiceListeners.forEach(listener => listener());
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
    console.log('RENDER SCROLLVIEW');
    const { imageMargin, backgroundColor } = this.props;
    return (
      <View
        style={[
          styles.wrapper, {
            width: this.props.window.width
          },
          this.props.style
        ]}>
        {this.renderListView()}
      </View>
    );
  }

  _renderImage(item, rowIndex, rowColumn, rowData) {
    let isSelected = !!this.state.selectedImage && this.state.selectedImage.uri === item.uri;
    let markedNumber = 0;
    let markedForExport = false;
    for (let i = 0; i < this.state.markedForExport.length; i++) {
      if (item.uri === this.state.markedForExport[i].uri) {
        markedForExport = true;
        markedNumber = i + 1;
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
          paddingRight: lastItemInRow ? 0 : this.props.imageMargin,
          paddingTop : rowIndex === 0 ? 0 : this.props.imageMargin
        }]}
        onPress={() => this._selectImage(item, rowIndex, rowData)}>
        <Image source={item.image} style={cellStyles.imageSize}>
          {isSelected
            ? <View style={[cellStyles.imageSize, styles.selectedImage]}></View>
            : null}
          {this.state.multiExportModeEnabled ?
            <View style={[styles.markedForExportCircle, markedForExport ? styles.markedForExportCircleSelected : undefined]}>
              {markedForExport ? <Text style={styles.markedForExportCircleText}>{markedNumber}</Text> : undefined}
            </View>
            : null}
        </Image>
      </TouchableOpacity>
    );
  }

  _renderRow(rowData, unknown, rowIndex) {
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
  },
  markedForExportCircle: {
    position: 'absolute',
    right: 5,
    top: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  markedForExportCircleSelected: {
    backgroundColor: '#4F98EA',
    borderWidth: 0
  },
  markedForExportCircleText: {
    fontSize: 11,
    color: '#FFFFFF'
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
