import {
  Animated,
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity
} from 'react-native';
import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
const AnimatedIcon = Animated.createAnimatedComponent(Icon);
export default class PhotoManagerHeader extends Component {

  constructor() {
    super();
    this.albumsButtonPressed = false;
    this.state = {
      anim: new Animated.Value(1)
    };
  }

  onTitleButtonPressed() {
    this.state.anim.stopAnimation((value) => {
      this.albumsButtonPressed = !this.albumsButtonPressed;
      Animated.timing(this.state.anim, {
        toValue: this.albumsButtonPressed
          ? 0
          : 1,
        duration: 230,
        useNativeDriver: true
      }).start();
    });

  }

  renderRightButton(fontStyle) {
    return <View
      style={{
      opacity: this.props.hasNextButton
        ? 1
        : 0
    }}>
      <TouchableOpacity
        style={[styles.buttonArea, styles.rightButtonArea]}
        onPress={this.props.onCreateLocationPress}>
        <Text style={[styles.linkButton, fontStyle]}>Nästa</Text>
      </TouchableOpacity>
    </View>;
  }

  render() {
    const fontStyle = {
      fontFamily: this.props.font || 'Helvetica'
    };
    const interpolatedRotateAnimation = this.state.anim.interpolate({
      inputRange: [
        0, 1
      ],
      outputRange: ['180deg', '0deg']
    });
    const arrowAnim = {
      transform: [
        {
          rotate: interpolatedRotateAnimation
        }
      ]
    };
    const fadeAnim = {
      opacity: this.state.anim
    };
    return (
      <View
        style={[
        styles.topBar, {
          height: this.props.height
        }
      ]}>
        <Animated.View style={fadeAnim}>
          <TouchableOpacity
            style={[styles.buttonArea, styles.leftButtonArea]}
            onPress={this.props.onCancelAction}>
            <Text style={[styles.cancelButton, fontStyle]}>Avbryt</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.buttonArea, styles.centerButton]}>
          <TouchableOpacity
            style={styles.centerContainer}
            onPress={this.onTitleButtonPressed.bind(this)}>
            <Text style={[styles.title, fontStyle]}>
              {this.props.currentAlbum.title}
            </Text>
            <Animated.View style={arrowAnim}>
              <Icon style={styles.arrow} name='ios-arrow-down'></Icon>
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Animated.View style={fadeAnim}>
          {this.renderRightButton(fontStyle)}
        </Animated.View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45
  },
  cancelButton: {
    color: 'black',
    fontSize: 15
  },
  leftButtonArea: {
    paddingHorizontal: 15
  },
  centerButton: {
    flex: 1
  },
  linkButton: {
    color: '#3897f0',
    fontSize: 15
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  rightButtonArea: {
    paddingHorizontal: 15,
    paddingRight: 15
  },
  arrow: {
    fontSize: 20,
    top: 2
  }
});
