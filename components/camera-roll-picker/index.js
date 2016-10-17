import React, {Component} from 'react'
import {
  CameraRoll,
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ListView,
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  PanResponder,
  TouchableWithoutFeedback
} from 'react-native';
import WindowedListView from '../../../react-native/Libraries/Experimental/WindowedListView';
import debounce from 'debounce';
import {
  ScrollViewPanDelegator,
  BoundarySwipeDelgator,
  ContentOffsetDelegator,
  swipeUpDetector,
  swipeDownDetector
} from '../../pan-delegator/scroll-view-pan-delegator';

const PIVOT = 40;
class CameraRollPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      selected: this.props.selected,
      lastCursor: null,
      loadingMore: false,
      noMore: false,
      shouldUpdate: this.guid(),
      bounces: true,
      scrollingEnabled: true
    };
    this._onEndReachedDebounce = debounce(this._onEndReached, 500).bind(this);
    this.setupScrollViewPanDelegator(props);
    this.lastContentOffset = {y : 0, x : 0};
  }

  setupScrollViewPanDelegator(props) {
    this.scrollViewPanDelegator = new ScrollViewPanDelegator([
      new BoundarySwipeDelgator(swipeUpDetector, props.top, this.props),
      new ContentOffsetDelegator(swipeDownDetector, this.props, {
        setBounce: (bounces) => {
          this.setState({bounces: bounces});
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
    var {width} = Dimensions.get('window');
    var {imageMargin, imagesPerRow, containerWidth} = this.props;

    if (typeof containerWidth != "undefined") {
      width = containerWidth;
    }
    this._imageSize = (width - (imagesPerRow + 1) * imageMargin) / imagesPerRow;

    this.fetch();

    this.setState({
      cellStyles: StyleSheet.create({
        imageSize: {
          height: this._imageSize,
          width: this._imageSize
        },
        cellMargin: {
          marginBottom: this.props.imageMargin,
          marginRight: this.props.imageMargin
        }
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({selected: nextProps.selected});
  }

  fetch() {
    if (!this.state.loadingMore) {
      this.setState({
        loadingMore: true
      }, () => {
        this._fetch();
      });
    }
  }

  _fetch() {
    //  console.log('FETCH');
    if (this.fetchInProgress) {
      return;
    }
    this.fetchInProgress = true;
    if (this.fetchRound === undefined) {
      this.fetchRound = -1;
    }
    this.fetchRound++;
    var {groupTypes, assetType} = this.props;

    const fetchNum = 12;
    const fetchNumber = this.fetchRound === 0
      ? fetchNum
      : (fetchNum * (this.fetchRound + 1)) * 3;
    var fetchParams = {
      first: fetchNumber,
      groupTypes: groupTypes,
      assetType: assetType
    };

    if (Platform.OS === "android") {
      // not supported in android
      delete fetchParams.groupTypes;
    }

    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor;
    }

    CameraRoll.getPhotos(fetchParams).then((data) => {
      //  console.log('RECIVE', data.edges.length);
      this._appendImages(data);
      this.fetchInProgress = false;
      if (this.fetchRound === 0 || this.fetchRound === 1) {
        this._fetch();
      }
    }, (e) => console.log(e));

    if (this.fetchRound === 0) {
      setInterval(() => {
        if (!this.state.noMore) {
          this._fetch();
        }
      }, this.fetchRound < 5
        ? 1600
        : 3000);
    }
  }

  _appendImages(data) {
    var assets = data.edges;
    var newState = {
      loadingMore: false,
      dataSource: this.state.dataSource || []
    };
    var firstFetch = false;
    if (!data.page_info.has_next_page) {
      newState.noMore = true;
    }
    if (assets.length > 0) {
      if (!this.state.lastCursor) {
        firstFetch = true;
      }
      newState.lastCursor = data.page_info.end_cursor;
      newState.dataSource = this.appendToState(newState.dataSource, assets, this.props.imagesPerRow);
      if (firstFetch && this.props.initalSelectedImageIndex !== undefined) {
        const image = assets[this.props.initalSelectedImageIndex].node.image;
        this.state.selected.push(image);
        this.props.onSelectedImagesChanged(this.state.selected, image);
      }
      newState.shouldUpdate = this.guid();
    }
    this.setState(newState);
  }

  appendToState(dataSource, newAssets, imagesPerRow) {
    let columnsAdded = 0;
    const lastRow = dataSource[dataSource.length - 1];
    if (lastRow && lastRow.rowData.length < this.props.imagesPerRow) {
      for (let i = (lastRow.rowData.length); i < imagesPerRow; i++) {
        lastRow.rowData.push(newAssets[columnsAdded]);
        columnsAdded++;
      }
      lastRow.rowData = [...lastRow.rowData];
    }
    const previousLength = (dataSource && dataSource.length) || 0;
    const newRows = newAssets.filter((item, index) => index >= columnsAdded).reduce((newRows, image, index) => {
      if (index % imagesPerRow == 0 && index !== 0) {
        newRows.push({
          rowKey: newRows.length + previousLength,
          rowData: []
        });
      };
      newRows[newRows.length - 1].rowData.push(image);
      return newRows;
    }, [
      {
        rowKey: previousLength,
        rowData: []
      }
    ]);
    return dataSource.concat(newRows);
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
        scrollEnabled={this.state.scrollingEnabled}
        scrollEventThrottle={16}
        decelerationRate='normal'></ScrollView>
    );
  }

  renderListView() {
    if (!this.state.dataSource) {
      return <ActivityIndicator style={styles.spinner}/>;
    }
    return (
      <WindowedListView
        ref={wlv => this.wlv = wlv}
        onScroll={this.onScroll.bind(this)}
        disableIncrementalRendering={false}
        renderScrollComponent={this.renderScrollView.bind(this)}
        initialNumToRender={30}
        numToRenderAhead={40}
        maxNumToRender={500}
        shouldUpdateToken={this.state.shouldUpdate}
        onViewableRowsChanged={(e) => {
        if (e[e.length - 1] >= (this.state.dataSource.length - 30)) {
          this._onEndReachedDebounce();
        }
      }}
        data={this.state.dataSource}
        renderRow={this._renderRow.bind(this)}></WindowedListView>
    );
  }

  render() {
    const {imageMargin, backgroundColor} = this.props;
    return (
      <View
        style={[
        styles.wrapper, {
          padding: imageMargin,
          paddingRight: 0,
          backgroundColor: 'white',
          width: this.props.window.width
        },
        this.props.style
      ]}>
        {this.renderListView()}
      </View>
    );
  }

  _renderImage(item, rowIndex, rowColumn, rowData) {
    var isSelected = false;
    for (var i = 0; i < this.state.selected.length; i++) {
      if (this.state.selected[i].uri === item.node.image.uri) {
        isSelected = true;
        break;
      }
    }
    var cellStyles = this.state.cellStyles;
    return (
      <TouchableOpacity
        activeOpacity={1.0}
        key={item.node.image.uri}
        style={cellStyles.cellMargin}
        onPress={() => this._selectImage(item.node.image, rowIndex, rowData)}>
        <Image source={item.node.image} style={cellStyles.imageSize}>
          {isSelected
            ? <View style={[cellStyles.imageSize, styles.selectedImage]}></View>
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

  _renderFooterSpinner() {
    if (!this.state.noMore) {
      return <ActivityIndicator style={styles.spinner}/>;
    }
    return null;
  }

  _onEndReached() {
    //    console.log('END');
    if (!this.state.noMore) {
      this.fetch();
    }
  }

  _selectImage(image, rowIndex, rowData) {
    var {maximum, imagesPerRow, onSelectedImagesChanged} = this.props;

    var selected = this.state.selected,
      index = this._arrayObjectIndexOf(selected, 'uri', image.uri);

    if (index >= 0 && !this.props.replaceSelection) {
      selected.splice(index, 1);
    } else {
      if (selected.length < maximum) {
        selected.push(image);
        image.selected = true;
      } else if (this.props.replaceSelection) {
        const itemToRemove = selected[0];
        selected.splice(0, 1);
        for (var i = 0; i < this.state.dataSource.length; i++) {
          const row = this.state.dataSource[i];
          let rowFound = false;
          for (var j = 0; j < row.rowData.length; j++) {
            const item = row.rowData[j];
            if (item.node.image === itemToRemove) {
              this.markRowForRerender(i);
              rowFound = true;
              break;
            }
          }
          if (rowFound) {
            break;
          }
        }
        this._selectImage(image, rowIndex, rowData);
      }
    }
    this.markRowForRerender(rowIndex);
    this.setState({selected: selected, shouldUpdate: this.guid()});
    onSelectedImagesChanged(this.state.selected, image);
    this.onScrollAdjustmentOnSelect(rowIndex);
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
    const {imageMargin} = this.props;
    return ((this._imageSize) + imageMargin);
  }

  getRowIndexScrollTop(rowIndex, imageWidthMarginSize) {
    return ((imageWidthMarginSize !== undefined
      ? imageWidthMarginSize
      : this.getImageWithMarginHeight()) * rowIndex);
  }

  scrollToRow(rowIndex, predefinedYValye) {
    const scrollResponder = this.wlv && this.wlv.getScrollResponder();
    if (scrollResponder) {
      scrollResponder.scrollTo({
        x: 0,
        y: predefinedYValye !== undefined
          ? predefinedYValye
          : this.getRowIndexScrollTop(rowIndex),
        animated: true
      });
    }
  }

  markRowForRerender(rowIndex) {
    this.state.dataSource[rowIndex].rowData = [...this.state.dataSource[rowIndex].rowData];
  }

  _nEveryRow(data, n) {
    var result = [],
      temp = [];

    for (var i = 0; i < data.length; ++i) {
      if (i > 0 && i % n === 0) {
        result.push({
          rowKey: result.length - 1,
          rowData: temp
        });
        temp = [];
      }
      temp.push(data[i]);
    }

    if (temp.length > 0) {
      while (temp.length !== n) {
        temp.push(null);
      }
      result.push({
        rowKey: result.length - 1,
        rowData: temp
      });
    }

    return result;
  }

  _arrayObjectIndexOf(array, property, value) {
    return array.map((o) => {
      return o[property];
    }).indexOf(value);
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
  }
})

CameraRollPicker.propTypes = {
  groupTypes: React.PropTypes.oneOf([
    'Album',
    'All',
    'Event',
    'Faces',
    'Library',
    'PhotoStream',
    'SavedPhotos'
  ]),
  maximum: React.PropTypes.number,
  assetType: React.PropTypes.oneOf(['Photos', 'Videos', 'All']),
  imagesPerRow: React.PropTypes.number,
  imageMargin: React.PropTypes.number,
  containerWidth: React.PropTypes.number,
  onSelectedImagesChanged: React.PropTypes.func,
  selected: React.PropTypes.array,
  selectedMarker: React.PropTypes.element,
  backgroundColor: React.PropTypes.string
}

CameraRollPicker.defaultProps = {
  groupTypes: 'SavedPhotos',
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 5,
  assetType: 'Photos',
  backgroundColor: 'white',
  selected: [],
  onSelectedImagesChanged: function(selectedImages, currentImage) {
    console.log(currentImage);
    console.log(selectedImages);
  }
}

export default CameraRollPicker;
//        <View pointerEvents={this.state.blockViewPointerEvents} style={{flex :
// 1, position : 'absolute', top : 0, left : 0, right : 0, bottom : 0}}></View>
