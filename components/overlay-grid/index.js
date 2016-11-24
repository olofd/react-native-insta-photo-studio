import React, {Component} from 'react';
import {View, Animated, Easing, PixelRatio, StyleSheet} from 'react-native';
const SHOWN_OPACITY = 0.65;
export default class OverlayGrid extends Component {

  constructor() {
    super();
    this.state = {
      anim: new Animated.Value(0)
    };
  }

  show() {
    this.anim(1, 20);
  }

  hide() {
    this.anim(0, 450);
  }

  anim(toVal, duration : 0) {
    Animated.timing(this.state.anim, {
      duration : duration,
      toValue: toVal,
      easing: Easing.in(Easing.ease),
      useNativeDriver : true
    }).start();
  }

  renderGrid = (direction) => {
    const blockStyle = direction === 'row'
      ? {
        borderColor: 'rgba(255, 255, 255, 0.65)',
        borderRightWidth: 1 / PixelRatio.get()
      }
      : {
        borderColor: 'rgba(255, 255, 255, 0.65)',
        borderBottomWidth: 1 / PixelRatio.get()
      };

    return (
      <View
        shouldRasterizeIOS={true}
        style={[styles.absolute, {
        flexDirection: direction
      }]}>
        <View
          style={[
          {
            flex: 1
          },
          blockStyle
        ]}/>
        <View
          style={[
          {
            flex: 1
          },
          blockStyle
        ]}/>
        <View style={{
          flex: 1
        }}/>
    </View>
    );
  }
  render() {
    return (
      <Animated.View shouldRasterizeIOS={true} style={[styles.absolute, { opacity : this.state.anim }]} pointerEvents="none">
        {this.renderGrid('row')}
        {this.renderGrid('column')}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  absolute : {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
