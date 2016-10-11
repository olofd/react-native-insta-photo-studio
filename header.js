import {View, Text, StyleSheet, PixelRatio, TouchableOpacity} from 'react-native';
import Component from 'GKComponent';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from 'GKColors';
import fonts from 'GKFonts';
export default class PhotoManagerHeader extends Component {

  renderRightButton() {
    return <View
      style={{
      opacity: this.props.hasNextButton
        ? 1
        : 0
    }}>
      <TouchableOpacity
        style={[styles.buttonArea, styles.rightButtonArea]}
        onPress={this.props.onCreateLocationPress}>
        <Text style={styles.linkButton}>Nästa</Text>
      </TouchableOpacity>
    </View>;
  }

  render() {
    return (
      <View
        style={[
        styles.topBar, {
          height: this.props.height
        }
      ]}>
        <TouchableOpacity
          style={[styles.buttonArea, styles.leftButtonArea]}
          onPress={this.props.onCancelAction}>
          <Text style={styles.cancelButton}>Avbryt</Text>
        </TouchableOpacity>
        <View style={[styles.buttonArea, styles.centerButton]}>
          <TouchableOpacity style={styles.centerContainer}>
            <Text style={styles.title}>
              {this.props.headerTitle}
            </Text>
          </TouchableOpacity>
        </View>
        {this.renderRightButton()}
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
    flex: 1,
    fontSize: 15,
    textAlign: 'center',
    margin: 10,
    fontFamily: fonts.sansSerifBold
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45
  },
  cancelButton: {
    color: 'black',
    fontFamily: fonts.sansSerif,
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
    fontFamily: fonts.sansSerifBold,
    fontSize: 15
  },
  centerContainer: {
    flexDirection: 'row',
    width: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carrot: {
    fontSize: 18
  },
  rightButtonArea: {
    paddingHorizontal: 15,
    paddingRight: 15
  },
  addButtonIcon: {
    fontSize: 30,
    color: 'white'
  },
  peningMediaButton: {
    color: 'black',
    fontFamily: fonts.sansSerifBold,
    fontSize: 15
  }
});
