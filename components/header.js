import {View, Text, StyleSheet, PixelRatio, TouchableOpacity} from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
export default class PhotoManagerHeader extends Component {

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
    const fontStyle = {fontFamily : this.props.font || 'Helvetica'};
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
          <Text style={[styles.cancelButton, fontStyle]}>Avbryt</Text>
        </TouchableOpacity>

        <View style={[styles.buttonArea, styles.centerButton]}>
          <TouchableOpacity style={styles.centerContainer}>
            <Text style={[styles.title, fontStyle]}>
              {this.props.headerTitle}
            </Text>
          </TouchableOpacity>
        </View>

        {this.renderRightButton(fontStyle)}
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
    margin: 10
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
    flexDirection: 'row',
    width: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightButtonArea: {
    paddingHorizontal: 15,
    paddingRight: 15
  }
});
