import {View, Text, StyleSheet, PixelRatio, TouchableOpacity} from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import I18n from 'react-native-i18n';

export default class PhotoManagerHeader extends Component {

  static defaultProps = {
    styles : StyleSheet.create({
       fontStyle : {
        fontFamily: 'Arial'
      }
    })
  }

  render() {
    return (
      <View style={[styles.topBar, this.props.style, {
        height: this.props.height
      }]}>
        <TouchableOpacity
          style={[styles.buttonArea, styles.leftButtonArea]}
          onPress={() => this.props.onPress('library')}>
          <Text
            style={[
            styles.button, this.props.styles.fontStyle, this.props.selectedTab === 'library'
              ? styles.buttonSelected
              : null
          ]}>{I18n.t('library')}</Text>
        </TouchableOpacity>
        <View style={{flex : 1}}></View>
        <TouchableOpacity
          style={[styles.buttonArea, styles.buttonArea]}
          onPress={() => this.props.onPress('photo')}>
          <Text
            style={[
            styles.button, this.props.styles.fontStyle, this.props.selectedTab === 'photo'
              ? styles.buttonSelected
              : null
          ]}>{I18n.t('photo')}</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    textAlign: 'center',
    margin: 10
  },
  buttonArea: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  button: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    fontWeight : '600'
  },
  buttonSelected: {
    color: 'black',
  },
  buttonArea: {
    height : 45,
    paddingHorizontal: 15,
    justifyContent: 'center'
  }
});
