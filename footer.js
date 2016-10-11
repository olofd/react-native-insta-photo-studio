import {View, Text, StyleSheet, PixelRatio, TouchableOpacity} from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import fonts from './fonts';
export default class PhotoManagerHeader extends Component {

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
            styles.button, this.props.selectedTab === 'library'
              ? styles.buttonSelected
              : null
          ]}>Bibliotek</Text>
        </TouchableOpacity>
        <View style={{flex : 1}}></View>
        <TouchableOpacity
          style={[styles.buttonArea, styles.buttonArea]}
          onPress={() => this.props.onPress('photo')}>
          <Text
            style={[
            styles.button, this.props.selectedTab === 'photo'
              ? styles.buttonSelected
              : null
          ]}>Foto</Text>
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
    fontSize: 15,
    textAlign: 'center',
    margin: 10,
    fontFamily: fonts.sansSerifBold
  },
  buttonArea: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  button: {
    color: '#999999',
    fontFamily: fonts.sansSerifBold,
    fontSize: 15,
    textAlign: 'center'
  },
  buttonSelected: {
    color: 'black'
  },
  buttonArea: {
    height : 45,
    paddingHorizontal: 15,
    justifyContent: 'center'
  },
  leftButtonArea: {
  //  flex: 1
  },
  centerButton: {
    //  flex: 1
  }
});
