import React, {Component} from 'react';
import {View, Animated, Easing, PixelRatio, StyleSheet} from 'react-native';
const SHOWN_OPACITY = 0.65;
export default class PhotoGrid extends Component {

  constructor() {
    super();
    this.state = {
      anim: new Animated.Value(0)
    };
  }

  show() {
    this.anim(SHOWN_OPACITY, 20);
  }

  hide() {
    this.anim(0, 450);
  }

  anim(toVal, duration : 0) {
    Animated.timing(this.state.anim, {
      duration : duration,
      toValue: toVal,
      easing: Easing.elastic(1)
    }).start();
  }

  renderGrid = (direction) => {
    const blockStyle = direction === 'row'
      ? {
        borderColor: 'white',
        borderRightWidth: 1 / PixelRatio.get()
      }
      : {
        borderColor: 'white',
        borderBottomWidth: 1 / PixelRatio.get()
      };

    return (
      <Animated.View
        style={[styles.absolute, {
        flexDirection: direction,
        opacity: 1.0
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
      </Animated.View>
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
