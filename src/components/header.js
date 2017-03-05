import {
  Animated,
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Easing
} from 'react-native';
import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; 
import I18n from 'react-native-i18n';

export default class PhotoManagerHeader extends Component {

  constructor() {
    super();
    this.state = {};
  }
  static defaultProps = {
    height : 45,
    styles : StyleSheet.create({
       fontStyle : {
        fontFamily: 'Arial'
      }
    })
  }

  componentWillMount() {
    this.setupStyleObjs(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setupStyleObjs(nextProps);
  }

  setupStyleObjs(props) {
    if(!this.state.headerStyles || props.height !== this.state.height) {
      const dStyles =  StyleSheet.create({
        buttonArea : {
          height : props.height
        }
      });
      this.setState({
        height : props.height,
        buttonArea : [styles.buttonArea, dStyles.buttonArea]
      });
    }
  }

  onTitleButtonPressed() {
    this.props.onAlbumDropDownPressed();
  }

  renderRightButton() {
    return <View
      style={{
      opacity: this.props.hasNextButton
        ? 1
        : 0
    }}>
      <TouchableOpacity
        style={[this.state.buttonArea, styles.rightButtonArea]}
        onPress={this.props.onCreateLocationPress}>
        <Text style={[styles.linkButton, this.props.styles.fontStyle]}>{I18n.t('next')}</Text>
      </TouchableOpacity>
    </View>;
  }

  _renderExitMenu() {
    return (
      <TouchableOpacity
        style={[this.state.buttonArea, styles.exitButton]}
        onPress={this.props.onCancelAction}>
        <Icon name='ios-close' style={styles.exitIcon}></Icon>
      </TouchableOpacity>
    );
  }

  _renderLeftButton() {
    return (
      <TouchableOpacity
        style={[this.state.buttonArea, styles.leftButtonArea]}
        onPress={this.props.onCancelAction}>
        <Text style={[styles.cancelButton, this.props.styles.fontStyle]}>{I18n.t('cancel')}</Text>
      </TouchableOpacity>
    );
  }

  _renderArrow() {
    const interpolatedRotateAnimation = this.props.showAlbumsAnim.interpolate({
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
    return (
      <Animated.View style={arrowAnim}>
        <Icon style={styles.arrow} name='ios-arrow-down'></Icon>
      </Animated.View>
    );
  }

  _renderAlbumsDropDown() {
    const hasAlbum = !!this.props.currentAlbum;
    return (
      <View style={[this.state.buttonArea, styles.centerButton]}>
        <TouchableOpacity
          disabled={!hasAlbum}
          style={styles.centerContainer}
          onPress={this.onTitleButtonPressed.bind(this)}>
          <Text style={[styles.title, this.props.styles.fontStyle]}>
            {hasAlbum
              ? this.props.currentAlbum.title
              : ''}
          </Text>
          {hasAlbum
            ? this._renderArrow()
            : null}
        </TouchableOpacity>
      </View>
    );
  }

  _renderCenterColumn() {
    const hasAlbum = !!this.props.currentAlbum;
    if (this.props.showAlbumsDropDown && hasAlbum) {
      return this._renderAlbumsDropDown();
    }
    return (
      <View style={[this.state.buttonArea, styles.centerButton]}>
        <Text style={[styles.title, this.props.styles.fontStyle]}>
          {this.props.headerTitle}
        </Text>
      </View>
    );
  }

  _renderMenu() {
    if(!this.props.renderMenu) {
      return null;
    }
    if(this.props.renderExitMenu) {
      return this._renderExitMenu();
    }

    const fadeAnim = {
      opacity: this.props.showAlbumsAnim
    };
    return (
      <View style={styles.topBarInner}>
        <Animated.View style={fadeAnim}>
          {this._renderLeftButton()}
        </Animated.View>
        {this._renderCenterColumn()}
        <Animated.View style={fadeAnim}>
          {this.renderRightButton()}
        </Animated.View>
      </View>
    );
  }

  render() {
    return (
      <View
        style={[
        styles.topBar, {
          height: this.props.height
        }
      ]}>
        {this._renderMenu()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  topBar: {
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: 'rgb(129, 129, 129)',
    justifyContent: 'center'
  },
  topBarInner: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5,
    fontWeight : '600'
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    color: 'black',
    fontSize: 16
  },
  linkButton: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight : '500'
  },
  leftButtonArea: {
    alignItems: 'center',
    paddingHorizontal: 15
  },
  exitButton : {
    width : 50,
    position : 'absolute',
    left : 0
  },
  exitIcon : {
    fontSize : 35
  },
  centerButton: {
    flex: 1,
    flexGrow: 1
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
