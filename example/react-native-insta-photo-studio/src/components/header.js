import {
  Animated,
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Easing
} from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import I18n from 'react-native-i18n';
import appService from '../services/app-service';

export default class PhotoManagerHeader extends Component {

  constructor() {
    super();
    this.listeners = [];
    this.state = {
      editStepAnim: new Animated.Value(0),
      currentStep: 0
    };
  }
  static defaultProps = {
    height: 45,
    styles: StyleSheet.create({
      fontStyle: {
        fontFamily: 'Arial'
      }
    })
  }

  componentWillUnmount() {
    this.listeners.forEach(cb => cb && cb());
  }

  componentWillMount() {
    this.setupStyleObjs(this.props);
    this.listeners.push(appService.onEditStepUpdated((stepIndex, stepName, stepModel) => {
      this.setState({
        currentStep: stepIndex
      });
    }));
  }

  componentWillReceiveProps(nextProps) {
    this.setupStyleObjs(nextProps);
  }

  setupStyleObjs(props) {
    if (!this.state.headerStyles || props.height !== this.state.height) {
      const dStyles = StyleSheet.create({
        buttonArea: {
          height: props.height,
        }
      });
      this.setState({
        height: props.height,
        buttonArea: [styles.buttonArea, dStyles.buttonArea]
      });
    }
  }

  onTitleButtonPressed() {
    this.props.onAlbumDropDownPressed();
  }

  onCancelAction() {
    this.props.onCancelAction && this.props.onCancelAction();
  }

  onBackAction() {
    appService.moveEditStep('previous');
  }

  onNextButtonPress() {
    appService.moveEditStep('next');
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
        onPress={this.onNextButtonPress.bind(this)}>
        <Text style={[styles.linkButton, this.props.styles.fontStyle]}>{this.state.currentStep === 2 ? I18n.t('share') : I18n.t('next')}</Text>
      </TouchableOpacity>
    </View>;
  }

  _renderExitMenu() {
    return (
      <TouchableOpacity
        style={[this.state.buttonArea, styles.exitButton]}
        onPress={this.onCancelAction}>
        <Icon name='ios-close' style={styles.exitIcon}></Icon>
      </TouchableOpacity>
    );
  }

  _renderLeftButton() {
    const leftCancelButtonStyle = {
      opacity: this.props.editStepAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
        extrapolate: 'clamp'
      })
    };
    const leftBackButtonStyle = {
      opacity: this.props.editStepAnim
    };
    return (
      <View>
        <Animated.View style={[styles.overlayButton, leftBackButtonStyle]}>
          <TouchableOpacity
            style={[this.state.buttonArea, styles.leftButtonArea, { paddingRight: 48 }]}
            onPress={this.onBackAction}>
            <Icon style={styles.leftBackButtonStyle} name='ios-arrow-back-outline'></Icon>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[leftCancelButtonStyle]} pointerEvents={this.state.currentStep === 0 ? 'auto' : 'none'}>
          <TouchableOpacity
            style={[this.state.buttonArea, styles.leftButtonArea]}
            onPress={this.onCancelAction.bind(this)}>
            <Text style={[styles.cancelButton, this.props.styles.fontStyle]}>{I18n.t('cancel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    );
  }

  _renderInnerCenterColumnStepOne() {
    const hasAlbum = !!this.props.currentAlbum;
    if (this.props.showAlbumsDropDown && hasAlbum) {
      return this._renderAlbumsDropDown();
    }

    return (<Text style={[styles.title, this.props.styles.fontStyle]}>
      {this.props.headerTitle}
    </Text>);
  }

  _renderCenterColumnStepOne() {
    const centerColumnStyle = {
      opacity: this.props.editStepAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          translateX: this.props.editStepAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, ((-this.props.window.width) / 2) + 100]
          })
        }
      ]
    };

    return (
      <Animated.View style={[styles.headerContainer, centerColumnStyle]}>
        {this._renderInnerCenterColumnStepOne()}
      </Animated.View>
    );
  }

  _renderCenterColumnStepTwo() {
    const centerColumnStyle = {
      opacity: this.props.editStepAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 0],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          translateX: this.props.editStepAnim.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [this.props.window.width, 0, ((-this.props.window.width) / 2) + 100]
          })
        }
      ]
    };
    return (
      <Animated.View style={[styles.headerContainer, centerColumnStyle]}>
        <Text style={[styles.title, this.props.styles.fontStyle]}>
          {I18n.t('edit')}
        </Text>
      </Animated.View >
    );
  }

  _renderCenterColumnStepThree() {
    const centerColumnStyle = {
      opacity: this.props.editStepAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp'
      }),
      transform: [
        {
          translateX: this.props.editStepAnim.interpolate({
            inputRange: [1, 2],
            outputRange: [this.props.window.width, 0],
            extrapolate: 'clamp'
          })
        }
      ]
    };
    return (
      <Animated.View style={[styles.headerContainer, centerColumnStyle]}>
        <Text style={[styles.title, this.props.styles.fontStyle]}>
          {I18n.t('share')}
        </Text>
      </Animated.View>

    );
  }

  _renderMenu() {
    if (!this.props.renderMenu) {
      return null;
    }
    if (this.props.renderExitMenu) {
      return this._renderExitMenu();
    }

    const fadeAnim = {
      opacity: this.props.showAlbumsAnim
    };

    return (
      <View style={styles.topBarInner}>
        <Animated.View style={[fadeAnim, styles.leftButtonContainer]}>
          {this._renderLeftButton()}
        </Animated.View>
        <Animated.View style={[this.state.buttonArea, styles.centerButton]}>
          {this._renderCenterColumnStepOne()}
          {this._renderCenterColumnStepTwo()}
          {this._renderCenterColumnStepThree()}
        </Animated.View>
        <Animated.View style={[fadeAnim, styles.rightButtonContainer]}>
          {this.renderRightButton()}
        </Animated.View>
      </View>
    );
  }

  /*
                  <Animated.View style={[fadeAnim, styles.leftButtonContainer]}>
          {this._renderLeftButton()}
        </Animated.View>
          <Animated.View style={fadeAnim}>
          {this.renderRightButton()}
        </Animated.View>
  */

  render() {
    console.log('render');
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
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    margin: 5,
    fontWeight: '600'
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    color: 'black',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  linkButton: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '500'
  },
  leftButtonContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1
  },
  rightButtonContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2
  },
  leftButtonArea: {
    alignItems: 'center',
    paddingHorizontal: 15
  },
  exitButton: {
    width: 50,
    position: 'absolute',
    left: 0
  },
  exitIcon: {
    fontSize: 35
  },
  centerButton: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
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
  },
  overlayButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  leftBackButtonStyle: {
    fontSize: 30,
    backgroundColor: 'transparent'
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
