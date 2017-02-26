import React, {Component} from 'react';
import {View, StyleSheet, Animated, Dimensions, Text, TouchableOpacity} from 'react-native';
import photoFrameworkService from '../services/camera-roll-service';
export default class Unauthorized extends Component {

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <Text style={styles.headerText}>{this.props.unauthorizedHeaderText}</Text>
        <Text style={styles.headerSubtitle}>{this.props.unauthorizedSubtitle}</Text>
        <TouchableOpacity style={styles.activateButton} onPress={() => photoFrameworkService.openSettings()}>
          <Text style={styles.activateText}>
            {this.props.unauthorizedSettingsButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding : 20
    //  overflow : 'hidden'
  },
  headerText: {
    color: 'rgb(139, 139, 139)',
    fontSize: 19,
    fontWeight : 'bold',
    textAlign : 'center',
    marginBottom : 20
  },
  headerSubtitle : {
    color: 'rgb(139, 139, 139)',
    fontSize: 16,
    textAlign : 'center',
  },
  activateButton : {
    padding : 35
  },
  activateText : {
    color: 'rgb(27, 141, 224)',
    fontSize: 14,
    textAlign : 'center',
  }
});
