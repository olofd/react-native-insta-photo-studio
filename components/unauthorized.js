import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import photoFrameworkService from '../services/camera-roll-service';
export default class Unauthorized extends Component {


  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor : 'black'
    //  overflow : 'hidden'
  }
});
