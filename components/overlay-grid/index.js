import React, {Component} from 'react';
import {View, Animated, Easing, PixelRatio, StyleSheet} from 'react-native';
const POINTER_EVENTS = 'none';
const COLUMN = 'column';
const ROW = 'row';

export default class OverlayGrid extends Component {

  static defaultProps = {
    OVERLAY_GRID_BORDER_COLOR: `rgba(255, 255, 255, 0.65)`,
    OVERLAY_GRID_SHOW_DURATION: 20,
    OVERLAY_GRID_HIDE_DURATION: 450
  };

  constructor() {
    super();
    this.state = {
      anim: new Animated.Value(0)
    };
  }

  shouldComponentUpdate() {
    return false;
  }

  show() {
    this.anim(1, this.props.OVERLAY_GRID_SHOW_DURATION);
  }

  hide() {
    this.anim(0, this.props.OVERLAY_GRID_HIDE_DURATION);
  }

  anim(toVal, duration : 0) {
    Animated.timing(this.state.anim, {
      duration: duration,
      toValue: toVal,
      easing: Easing. in(Easing.ease),
      useNativeDriver: true
    }).start();
  }

  renderGrid = (direction) => {
    const isRow = direction === ROW;
    const blockStyle = isRow
      ? styles.blockStyleRight
      : styles.blockStyleBottom;
    const flexStyle = isRow
      ? styles.flexRow
      : styles.flexColumn;
    const blockStyleWithBorderColor = [
      blockStyle, {
        borderColor: this.props.OVERLAY_GRID_BORDER_COLOR
      }
    ];
    return (
      <View shouldRasterizeIOS={true} style={flexStyle}>
        <View style={blockStyleWithBorderColor}/>
        <View style={blockStyleWithBorderColor}/>
        <View style={styles.flex}/>
      </View>
    );
  }

  render() {
    return (
      <Animated.View
        shouldRasterizeIOS={true}
        style={[
        styles.flexColumn, {
          opacity: this.state.anim
        }
      ]}
        pointerEvents={POINTER_EVENTS}>
        {this.renderGrid(ROW)}
        {this.renderGrid(COLUMN)}
      </Animated.View>
    );
  }
}
const shadowProps = {
  shadowColor : 'black',
  shadowOpacity : 0.7,
  shadowRadius  : 1,
  shadowOffset : {
    width : 1,
    height : 1,
  }
};
const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  blockStyleRight: Object.assign({
    backgroundColor : 'transparent',
    flex: 1,
    borderRightWidth: 1 / PixelRatio.get()
  }, shadowProps),
  blockStyleBottom: Object.assign({
    backgroundColor : 'transparent',
    flex: 1,
    borderBottomWidth: 1 / PixelRatio.get()
  }, shadowProps),
  flexRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row'
  },
  flexColumn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column'
  }
});
